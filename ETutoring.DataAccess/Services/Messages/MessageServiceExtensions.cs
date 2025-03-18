using ETutoring.Business.Dtos.Response.Message;
using ETutoring.Core.Common;
using ETutoring.DataAccess.Data;
using Microsoft.EntityFrameworkCore;
using PdfSharp.Drawing;
using PdfSharp.Pdf;
using ClosedXML.Excel;
using System.IO;

namespace ETutoring.DataAccess.Services.Messages
{
    public partial class MessageService
    {
        public async Task<ApiResponse<AverageMessagesResponse>> GetAverageMessagesPerTutorAsync()
        {
            try
            {
                // Get all users with Tutor role
                var tutorIds = await _context.UserRoles
                    .Join(_context.Roles,
                        ur => ur.RoleId,
                        r => r.Id,
                        (ur, r) => new { ur.UserId, RoleName = r.Name })
                    .Where(x => x.RoleName == "Tutor")
                    .Select(x => x.UserId.ToString())
                    .ToListAsync();

                // Get message counts for each tutor
                var tutorMessageCounts = await _context.Messages
                    .Where(m => tutorIds.Contains(m.SenderId))
                    .GroupBy(m => m.SenderId)
                    .Select(g => new
                    {
                        TutorId = g.Key,
                        MessageCount = g.Count()
                    })
                    .ToListAsync();

                // Get tutor names
                var tutorIdGuids = tutorMessageCounts.Select(t => Guid.Parse(t.TutorId)).ToList();
                var tutors = await _context.Users
                    .Where(u => tutorIdGuids.Contains(u.Id))
                    .Select(u => new { u.Id, u.FullName })
                    .ToListAsync();

                // Calculate average
                double averageMessages = 0;
                if (tutorMessageCounts.Count > 0)
                {
                    averageMessages = tutorMessageCounts.Average(t => t.MessageCount);
                }

                // Create response
                var tutorPerformances = tutorMessageCounts.Select(t => new TutorPerformanceResponse
                {
                    TutorId = Guid.Parse(t.TutorId),
                    TutorName = tutors.FirstOrDefault(u => u.Id == Guid.Parse(t.TutorId))?.FullName ?? "Unknown",
                    MessageCount = t.MessageCount
                }).ToList();

                var response = new AverageMessagesResponse
                {
                    AverageMessages = averageMessages,
                    TutorPerformances = tutorPerformances
                };

                return ApiResponse<AverageMessagesResponse>.SuccessResponse(response);
            }
            catch (Exception ex)
            {
                return ApiResponse<AverageMessagesResponse>.FailureResponse($"An error occurred: {ex.Message}");
            }
        }

        public async Task<byte[]> GenerateTutorPerformancePdfReportAsync()
        {
            var tutorPerformanceResponse = await GetAverageMessagesPerTutorAsync();
            if (!tutorPerformanceResponse.Success || tutorPerformanceResponse.Data == null)
            {
                throw new Exception(tutorPerformanceResponse.Message);
            }

            var tutorPerformance = tutorPerformanceResponse.Data;

            using var document = new PdfDocument();
            var page = document.AddPage();
            var gfx = XGraphics.FromPdfPage(page);
            var font = new XFont("Arial", 12);
            var titleFont = new XFont("Arial", 16);
            var headerFont = new XFont("Arial", 14);

            // Add title
            gfx.DrawString("Tutor Performance Report", titleFont,
                XBrushes.Black, new XRect(50, 50, page.Width.Point, 30), XStringFormats.TopLeft);

            gfx.DrawString($"Average Messages Per Tutor: {tutorPerformance.AverageMessages:F2}", headerFont,
                XBrushes.Black, new XRect(50, 90, page.Width.Point, 30), XStringFormats.TopLeft);

            gfx.DrawString("Tutor Name", headerFont, XBrushes.Black, 50, 130);
            gfx.DrawString("Message Count", headerFont, XBrushes.Black, 300, 130);

            var yPos = 160;
            foreach (var tutor in tutorPerformance.TutorPerformances.OrderByDescending(t => t.MessageCount))
            {
                gfx.DrawString(tutor.TutorName, font, XBrushes.Black, 50, yPos);
                gfx.DrawString(tutor.MessageCount.ToString(), font, XBrushes.Black, 300, yPos);
                yPos += 20;

                if (yPos > page.Height.Point - 50)
                {
                    page = document.AddPage();
                    gfx = XGraphics.FromPdfPage(page);
                    yPos = 50;
                }
            }

            gfx.DrawString($"Generated on: {DateTime.Now}", font, XBrushes.Black, 50, page.Height.Point - 50);

            using var stream = new MemoryStream();
            document.Save(stream);
            return stream.ToArray();
        }

        public async Task<byte[]> GenerateTutorPerformanceExcelReportAsync()
        {
            var tutorPerformanceResponse = await GetAverageMessagesPerTutorAsync();
            if (!tutorPerformanceResponse.Success)
            {
                throw new Exception(tutorPerformanceResponse.Message);
            }

            var tutorPerformance = tutorPerformanceResponse.Data;

            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Tutor Performance");

            // Add title
            worksheet.Cell(1, 1).Value = "Tutor Performance Report";
            worksheet.Cell(1, 1).Style.Font.Bold = true;
            worksheet.Cell(1, 1).Style.Font.FontSize = 16;

            // Add average
            worksheet.Cell(3, 1).Value = "Average Messages Per Tutor:";
            worksheet.Cell(3, 2).Value = tutorPerformance.AverageMessages;
            worksheet.Cell(3, 2).Style.NumberFormat.Format = "0.00";

            // Add headers
            worksheet.Cell(5, 1).Value = "Tutor Name";
            worksheet.Cell(5, 2).Value = "Message Count";
            worksheet.Cell(5, 3).Value = "Comparison to Average";
            worksheet.Range(5, 1, 5, 3).Style.Font.Bold = true;

            // Add data
            var row = 6;
            foreach (var tutor in tutorPerformance.TutorPerformances.OrderByDescending(t => t.MessageCount))
            {
                worksheet.Cell(row, 1).Value = tutor.TutorName;
                worksheet.Cell(row, 2).Value = tutor.MessageCount;
                worksheet.Cell(row, 3).FormulaA1 = $"=B{row}/B3*100";
                worksheet.Cell(row, 3).Style.NumberFormat.Format = "0.00%";
                row++;
            }

            // Add generation date
            worksheet.Cell(row + 2, 1).Value = $"Generated on: {DateTime.Now}";

            // Auto-fit columns
            worksheet.Columns().AdjustToContents();

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }
    }
}
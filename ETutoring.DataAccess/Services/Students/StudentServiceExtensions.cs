using ETutoring.Business.Dtos.Response.Students;
using ETutoring.Core.Common;
using ETutoring.DataAccess.Data;
using Microsoft.EntityFrameworkCore;
using PdfSharp.Drawing;
using PdfSharp.Pdf;
using ClosedXML.Excel;
using System.IO;

namespace ETutoring.DataAccess.Services.Students
{
    public partial class StudentService
    {
        public async Task<ApiResponse<List<UnassignedStudentResponse>>> GetUnassignedStudentsAsync()
        {
            try
            {
                // Get all users with Student role
                var studentIds = await _context.UserRoles
                    .Join(_context.Roles,
                        ur => ur.RoleId,
                        r => r.Id,
                        (ur, r) => new { ur.UserId, RoleName = r.Name })
                    .Where(x => x.RoleName == "Student")
                    .Select(x => x.UserId)
                    .ToListAsync();

                // Find students who are not assigned to any tutor
                var assignedStudentIds = await _context.StudentTutorManagements
                    .Select(stm => stm.StudentId)
                    .Distinct()
                    .ToListAsync();

                var unassignedStudentIds = studentIds.Except(assignedStudentIds).ToList();

                // Get student details
                var unassignedStudents = await _context.Users
                    .Where(u => unassignedStudentIds.Contains(u.Id))
                    .Select(u => new UnassignedStudentResponse
                    {
                        Id = u.Id,
                        FullName = u.FullName,
                        Email = u.Email,
                        RegistrationDate = u.CreatedAt
                    })
                    .ToListAsync();

                return ApiResponse<List<UnassignedStudentResponse>>.SuccessResponse(unassignedStudents);
            }
            catch (Exception ex)
            {
                return ApiResponse<List<UnassignedStudentResponse>>.FailureResponse($"An error occurred: {ex.Message}");
            }
        }

        public async Task<ApiResponse<List<InactiveStudentResponse>>> GetInactiveStudentsAsync(int days)
        {
            try
            {
                var cutoffDate = DateTime.UtcNow.AddDays(-days);

                // Get all users with Student role who haven't logged in within the specified days
                var inactiveStudents = await _context.UserRoles
                    .Join(_context.Roles,
                        ur => ur.RoleId,
                        r => r.Id,
                        (ur, r) => new { ur.UserId, RoleName = r.Name })
                    .Where(x => x.RoleName == "Student")
                    .Join(_context.Users,
                        ur => ur.UserId,
                        u => u.Id,
                        (ur, u) => new { User = u })
                    .Where(x => x.User.LastLoginTime == null || x.User.LastLoginTime < cutoffDate)
                    .Select(x => new InactiveStudentResponse
                    {
                        Id = x.User.Id,
                        FullName = x.User.FullName,
                        Email = x.User.Email,
                        LastLoginTime = x.User.LastLoginTime,
                        DaysInactive = x.User.LastLoginTime.HasValue ? 
                            (int)(DateTime.UtcNow - x.User.LastLoginTime.Value).TotalDays : 
                            days
                    })
                    .ToListAsync();

                return ApiResponse<List<InactiveStudentResponse>>.SuccessResponse(inactiveStudents);
            }
            catch (Exception ex)
            {
                return ApiResponse<List<InactiveStudentResponse>>.FailureResponse($"An error occurred: {ex.Message}");
            }
        }

        public async Task<byte[]> GenerateUnassignedStudentsPdfReportAsync()
        {
            var unassignedStudentsResponse = await GetUnassignedStudentsAsync();
            if (!unassignedStudentsResponse.Success)
            {
                throw new Exception(unassignedStudentsResponse.Message);
            }

            var unassignedStudents = unassignedStudentsResponse.Data;

            using var document = new PdfDocument();
            var page = document.AddPage();
            var gfx = XGraphics.FromPdfPage(page);
            var font = new XFont("Arial", 12);
            var titleFont = new XFont("Arial", 16, XFontStyle.Bold);
            var headerFont = new XFont("Arial", 14, XFontStyle.Bold);

            // Add title
            gfx.DrawString("Unassigned Students Report", titleFont,
                XBrushes.Black, new XRect(50, 50, page.Width, 30), XStringFormats.TopLeft);

            // Add headers
            gfx.DrawString("Student Name", headerFont, XBrushes.Black, 50, 100);
            gfx.DrawString("Email", headerFont, XBrushes.Black, 250, 100);
            gfx.DrawString("Registration Date", headerFont, XBrushes.Black, 450, 100);

            // Add data
            var yPos = 130;
            foreach (var student in unassignedStudents)
            {
                gfx.DrawString(student.FullName, font, XBrushes.Black, 50, yPos);
                gfx.DrawString(student.Email, font, XBrushes.Black, 250, yPos);
                gfx.DrawString(student.RegistrationDate?.ToString("yyyy-MM-dd") ?? "N/A", font, XBrushes.Black, 450, yPos);
                yPos += 20;

                // Add a new page if needed
                if (yPos > page.Height - 50)
                {
                    page = document.AddPage();
                    gfx = XGraphics.FromPdfPage(page);
                    yPos = 50;
                }
            }

            // Add generation date
            gfx.DrawString($"Generated on: {DateTime.Now}", font, XBrushes.Black, 50, page.Height - 50);

            using var stream = new MemoryStream();
            document.Save(stream);
            return stream.ToArray();
        }

        public async Task<byte[]> GenerateUnassignedStudentsExcelReportAsync()
        {
            var unassignedStudentsResponse = await GetUnassignedStudentsAsync();
            if (!unassignedStudentsResponse.Success)
            {
                throw new Exception(unassignedStudentsResponse.Message);
            }

            var unassignedStudents = unassignedStudentsResponse.Data;

            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Unassigned Students");

            // Add title
            worksheet.Cell(1, 1).Value = "Unassigned Students Report";
            worksheet.Cell(1, 1).Style.Font.Bold = true;
            worksheet.Cell(1, 1).Style.Font.FontSize = 16;

            // Add headers
            worksheet.Cell(3, 1).Value = "Student Name";
            worksheet.Cell(3, 2).Value = "Email";
            worksheet.Cell(3, 3).Value = "Registration Date";
            worksheet.Range(3, 1, 3, 3).Style.Font.Bold = true;

            // Add data
            var row = 4;
            foreach (var student in unassignedStudents)
            {
                worksheet.Cell(row, 1).Value = student.FullName;
                worksheet.Cell(row, 2).Value = student.Email;
                worksheet.Cell(row, 3).Value = student.RegistrationDate;
                if (student.RegistrationDate.HasValue)
                {
                    worksheet.Cell(row, 3).Style.DateFormat.Format = "yyyy-MM-dd";
                }
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

        public async Task<byte[]> GenerateInactiveStudentsPdfReportAsync(int days)
        {
            var inactiveStudentsResponse = await GetInactiveStudentsAsync(days);
            if (!inactiveStudentsResponse.Success)
            {
                throw new Exception(inactiveStudentsResponse.Message);
            }

            var inactiveStudents = inactiveStudentsResponse.Data;

            using var document = new PdfDocument();
            var page = document.AddPage();
            var gfx = XGraphics.FromPdfPage(page);
            var font = new XFont("Arial", 12);
            var titleFont = new XFont("Arial", 16, XFontStyle.Bold);
            var headerFont = new XFont("Arial", 14, XFontStyle.Bold);

            // Add title
            gfx.DrawString($"Inactive Students Report (Last {days} Days)", titleFont,
                XBrushes.Black, new XRect(50, 50, page.Width, 30), XStringFormats.TopLeft);

            // Add headers
            gfx.DrawString("Student Name", headerFont, XBrushes.Black, 50, 100);
            gfx.DrawString("Email", headerFont, XBrushes.Black, 250, 100);
            gfx.DrawString("Last Login", headerFont, XBrushes.Black, 450, 100);
            gfx.DrawString("Days Inactive", headerFont, XBrushes.Black, 600, 100);

            // Add data
            var yPos = 130;
            foreach (var student in inactiveStudents)
            {
                gfx.DrawString(student.FullName, font, XBrushes.Black, 50, yPos);
                gfx.DrawString(student.Email, font, XBrushes.Black, 250, yPos);
                gfx.DrawString(student.LastLoginTime?.ToString("yyyy-MM-dd") ?? "Never", font, XBrushes.Black, 450, yPos);
                gfx.DrawString(student.DaysInactive.ToString(), font, XBrushes.Black, 600, yPos);
                yPos += 20;

                // Add a new page if needed
                if (yPos > page.Height - 50)
                {
                    page = document.AddPage();
                    gfx = XGraphics.FromPdfPage(page);
                    yPos = 50;
                }
            }

            // Add generation date
            gfx.DrawString($"Generated on: {DateTime.Now}", font, XBrushes.Black, 50, page.Height - 50);

            using var stream = new MemoryStream();
            document.Save(stream);
            return stream.ToArray();
        }

        public async Task<byte[]> GenerateInactiveStudentsExcelReportAsync(int days)
        {
            var inactiveStudentsResponse = await GetInactiveStudentsAsync(days);
            if (!inactiveStudentsResponse.Success)
            {
                throw new Exception(inactiveStudentsResponse.Message);
            }

            var inactiveStudents = inactiveStudentsResponse.Data;

            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Inactive Students");

            // Add title
            worksheet.Cell(1, 1).Value = $"Inactive Students Report (Last {days} Days)";
            worksheet.Cell(1, 1).Style.Font.Bold = true;
            worksheet.Cell(1, 1).Style.Font.FontSize = 16;

            // Add headers
            worksheet.Cell(3, 1).Value = "Student Name";
            worksheet.Cell(3, 2).Value = "Email";
            worksheet.Cell(3, 3).Value = "Last Login";
            worksheet.Cell(3, 4).Value = "Days Inactive";
            worksheet.Range(3, 1, 3, 4).Style.Font.Bold = true;

            // Add data
            var row = 4;
            foreach (var student in inactiveStudents)
            {
                worksheet.Cell(row, 1).Value = student.FullName;
                worksheet.Cell(row, 2).Value = student.Email;
                worksheet.Cell(row, 3).Value = student.LastLoginTime;
                if (student.LastLoginTime.HasValue)
                {
                    worksheet.Cell(row, 3).Style.DateFormat.Format = "yyyy-MM-dd";
                }
                worksheet.Cell(row, 4).Value = student.DaysInactive;
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
using ETutoring.Business.Dtos.Response.Moderator;
using ETutoring.Business.Exceptions;
using ETutoring.Business.Interfaces.Students;
using Microsoft.EntityFrameworkCore;
using ETutoring.Business.Dtos.Response;
using System.Diagnostics;
using System.Net;
using ETutoring.Business.Dtos.Response.Students;
using ETutoring.Core.Common;
using ETutoring.DataAccess.Data;
using PdfSharp.Drawing;
using PdfSharp.Pdf;
using ClosedXML.Excel;
using System.IO;

namespace ETutoring.DataAccess.Services.Students
{
    public class StudentService : IStudentService
    {
        private readonly ApplicationDbContext _context;

        public StudentService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<List<GetTutorForStudentResponse>>> GetTutorsForStudentAsync(Guid studentId)
        {
            try
            {
                var tutors = await (
                    from management in _context.StudentTutorManagements
                    join tutor in _context.Users on management.TutorId equals tutor.Id
                    where management.StudentId == studentId
                    select new GetTutorForStudentResponse
                    {
                        TutorId = tutor.Id,
                        FullName = tutor.FullName,
                        Address = tutor.Address,
                        PhoneNumber = tutor.PhoneNumber,
                        Email = tutor.Email
                    }
                ).ToListAsync();

                if (!tutors.Any())
                    return ApiResponse<List<GetTutorForStudentResponse>>.FailureResponse("This student does not have any tutors assigned.");

                return ApiResponse<List<GetTutorForStudentResponse>>.SuccessResponse(tutors, "Tutors retrieved successfully.");
            }
            catch (Exception ex)
            {
                return ApiResponse<List<GetTutorForStudentResponse>>.FailureResponse($"An error occurred while retrieving tutors: {ex.Message}");
            }
        }

        public async Task<ApiResponse<List<UnassignedStudentResponse>>> GetUnassignedStudentsAsync()
        {
            try
            {
                var studentIds = await _context.UserRoles
                    .Join(_context.Roles,
                        ur => ur.RoleId,
                        r => r.Id,
                        (ur, r) => new { ur.UserId, RoleName = r.Name })
                    .Where(x => x.RoleName == "Student")
                    .Select(x => x.UserId)
                    .ToListAsync();

                var assignedStudentIds = await _context.StudentTutorManagements
                    .Select(stm => stm.StudentId)
                    .Distinct()
                    .ToListAsync();

                var unassignedStudentIds = studentIds.Except(assignedStudentIds).ToList();

                var unassignedStudents = await _context.Users
                    .Where(u => unassignedStudentIds.Contains(u.Id))
                    .Select(u => new UnassignedStudentResponse
                    {
                        Id = u.Id,
                        FullName = u.FullName,
                        Email = u.Email
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
            var titleFont = new XFont("Arial", 16, XFontStyleEx.Bold);
            var headerFont = new XFont("Arial", 14, XFontStyleEx.Bold);

            gfx.DrawString("Unassigned Students Report", titleFont,
                XBrushes.Black, new XRect(50, 50, page.Width, 30), XStringFormats.TopLeft);

            gfx.DrawString("Student Name", headerFont, XBrushes.Black, 50, 100);
            gfx.DrawString("Email", headerFont, XBrushes.Black, 250, 100);
            gfx.DrawString("Registration Date", headerFont, XBrushes.Black, 450, 100);

            var yPos = 130;
            foreach (var student in unassignedStudents)
            {
                gfx.DrawString(student.FullName, font, XBrushes.Black, 50, yPos);
                gfx.DrawString(student.Email, font, XBrushes.Black, 250, yPos);
                gfx.DrawString(student.RegistrationDate?.ToString("yyyy-MM-dd") ?? "N/A", font, XBrushes.Black, 450, yPos);
                yPos += 20;

                if (yPos > page.Height - 50)
                {
                    page = document.AddPage();
                    gfx = XGraphics.FromPdfPage(page);
                    yPos = 50;
                }
            }

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

            worksheet.Cell(1, 1).Value = "Unassigned Students Report";
            worksheet.Cell(1, 1).Style.Font.Bold = true;
            worksheet.Cell(1, 1).Style.Font.FontSize = 16;

            worksheet.Cell(3, 1).Value = "Student Name";
            worksheet.Cell(3, 2).Value = "Email";
            worksheet.Cell(3, 3).Value = "Registration Date";
            worksheet.Range(3, 1, 3, 3).Style.Font.Bold = true;

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

            worksheet.Cell(row + 2, 1).Value = $"Generated on: {DateTime.Now}";

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
            var titleFont = new XFont("Arial", 16, XFontStyleEx.Bold);
            var headerFont = new XFont("Arial", 14, XFontStyleEx.Bold);

            gfx.DrawString($"Inactive Students Report (Last {days} Days)", titleFont,
                XBrushes.Black, new XRect(50, 50, page.Width, 30), XStringFormats.TopLeft);

            gfx.DrawString("Student Name", headerFont, XBrushes.Black, 50, 100);
            gfx.DrawString("Email", headerFont, XBrushes.Black, 250, 100);
            gfx.DrawString("Last Login", headerFont, XBrushes.Black, 450, 100);
            gfx.DrawString("Days Inactive", headerFont, XBrushes.Black, 600, 100);

            var yPos = 130;
            foreach (var student in inactiveStudents)
            {
                gfx.DrawString(student.FullName, font, XBrushes.Black, 50, yPos);
                gfx.DrawString(student.Email, font, XBrushes.Black, 250, yPos);
                gfx.DrawString(student.LastLoginTime?.ToString("yyyy-MM-dd") ?? "Never", font, XBrushes.Black, 450, yPos);
                gfx.DrawString(student.DaysInactive.ToString(), font, XBrushes.Black, 600, yPos);
                yPos += 20;

                if (yPos > page.Height - 50)
                {
                    page = document.AddPage();
                    gfx = XGraphics.FromPdfPage(page);
                    yPos = 50;
                }
            }

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

            worksheet.Cell(1, 1).Value = $"Inactive Students Report (Last {days} Days)";
            worksheet.Cell(1, 1).Style.Font.Bold = true;
            worksheet.Cell(1, 1).Style.Font.FontSize = 16;

            worksheet.Cell(3, 1).Value = "Student Name";
            worksheet.Cell(3, 2).Value = "Email";
            worksheet.Cell(3, 3).Value = "Last Login";
            worksheet.Cell(3, 4).Value = "Days Inactive";
            worksheet.Range(3, 1, 3, 4).Style.Font.Bold = true;

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

            worksheet.Cell(row + 2, 1).Value = $"Generated on: {DateTime.Now}";

            worksheet.Columns().AdjustToContents();

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }
    }
}
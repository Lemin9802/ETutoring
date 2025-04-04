using ClosedXML.Excel;
using ETutoring.Business.Dtos.Request.Students;
using ETutoring.Business.Dtos.Response.Students;
using ETutoring.Business.Interfaces.Students;
using ETutoring.Core.Common;
using ETutoring.DataAccess.Data;
using Microsoft.EntityFrameworkCore;
using PdfSharp.Drawing;
using PdfSharp.Pdf;
using System.Linq;

namespace ETutoring.DataAccess.Services.Students
{
    public class StudentService : IStudentService
    {
        private readonly ApplicationDbContext _context;

        public StudentService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<List<GetTutorForStudentResponse>>> GetTutorsForStudentAsync(GetTutorsForStudentRequest req)
        {
            var tutors = await _context.Allocations
                .Where(a => a.StudentId == req.StudentId)
                .Join(
                    _context.Users,
                    allocation => allocation.TutorId,
                    user => user.Id,
                    (allocation, tutor) => new GetTutorForStudentResponse
                    {
                        TutorId = tutor.Id,
                        FullName = tutor.FullName,
                        Address = tutor.Address,
                        PhoneNumber = tutor.PhoneNumber,
                        Email = tutor.Email
                    }
                )
                .ToListAsync();

            if (!tutors.Any())
            {
                return ApiResponse<List<GetTutorForStudentResponse>>.FailureResponse("This student has not been assigned a Tutor yet.");
            }

            return ApiResponse<List<GetTutorForStudentResponse>>.SuccessResponse(tutors, "Get tutor list successfully.");
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
            // Removed Registration Date header

            var yPos = 130;
            foreach (var student in unassignedStudents)
            {
                gfx.DrawString(student.FullName, font, XBrushes.Black, 50, yPos);
                gfx.DrawString(student.Email, font, XBrushes.Black, 250, yPos);
                // Removed Registration Date data
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
            // Removed Registration Date header
            worksheet.Range(3, 1, 3, 2).Style.Font.Bold = true; // Adjusted range

            var row = 4;
            foreach (var student in unassignedStudents)
            {
                worksheet.Cell(row, 1).Value = student.FullName;
                worksheet.Cell(row, 2).Value = student.Email;
                // Removed Registration Date data and formatting
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

        // Implementation for Students Without Interaction
        public async Task<ApiResponse<List<StudentWithoutInteractionResponse>>> GetStudentsWithoutInteractionAsync(int days)
        {
            try
            {
                var cutoffDate = DateTime.UtcNow.AddDays(-days);

                // Get all student IDs
                var studentIds = await _context.UserRoles
                    .Join(_context.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => new { ur.UserId, RoleName = r.Name })
                    .Where(x => x.RoleName == "Student")
                    .Select(x => x.UserId)
                    .ToListAsync();

                // Get all students with their assigned tutors
                var studentsWithTutors = await _context.Users
                    .Where(u => studentIds.Contains(u.Id))
                    .Select(s => new
                    {
                        Student = s,
                        AssignedTutors = _context.StudentTutorManagements
                            .Where(stm => stm.StudentId == s.Id)
                            .Join(_context.Users, stm => stm.TutorId, t => t.Id, (stm, t) => new { t.Id, t.FullName })
                            .ToList() // Materialize tutor list per student
                    })
                    .ToListAsync();

                var studentsWithoutRecentInteraction = new List<StudentWithoutInteractionResponse>();

                foreach (var studentData in studentsWithTutors)
                {
                    var studentId = studentData.Student.Id;
                    // Directly use GUIDs instead of converting to string
                    var tutorIds = studentData.AssignedTutors.Select(t => t.Id).ToList();

                    // Find the last message time between the student and any of their tutors
                    var lastMessageTime = await _context.Messages
                        .Where(m => (m.SenderId == studentId && tutorIds.Contains(m.ReceiverId)) ||
                                    (tutorIds.Contains(m.SenderId) && m.ReceiverId == studentId))
                        .OrderByDescending(m => m.Timestamp)
                        .Select(m => (DateTime?)m.Timestamp)
                        .FirstOrDefaultAsync();

                    // Add student if no interaction or if the last interaction is before the cutoff date
                    if (!lastMessageTime.HasValue || lastMessageTime.Value < cutoffDate)
                    {
                        studentsWithoutRecentInteraction.Add(new StudentWithoutInteractionResponse
                        {
                            // If the response model still expects a string, convert here; otherwise, consider using Guid directly.
                            Id = studentId.ToString(),
                            FullName = studentData.Student.FullName,
                            Email = studentData.Student.Email,
                            LastInteractionTime = lastMessageTime // Could be null if no interaction ever
                        });
                    }
                }

                return ApiResponse<List<StudentWithoutInteractionResponse>>.SuccessResponse(studentsWithoutRecentInteraction);
            }
            catch (Exception ex)
            {
                // Log the exception details (consider using a proper logging framework)
                Console.WriteLine($"Error in GetStudentsWithoutInteractionAsync: {ex}");
                return ApiResponse<List<StudentWithoutInteractionResponse>>.FailureResponse($"An error occurred while retrieving students without interaction: {ex.Message}");
            }
        }

        public async Task<byte[]> GenerateStudentsWithoutInteractionPdfReportAsync(int days)
        {
            var response = await GetStudentsWithoutInteractionAsync(days);
            if (!response.Success)
            {
                throw new Exception(response.Message);
            }
            var students = response.Data;

            using var document = new PdfDocument();
            var page = document.AddPage();
            var gfx = XGraphics.FromPdfPage(page);
            var font = new XFont("Arial", 10); // Smaller font for more data
            var titleFont = new XFont("Arial", 16, XFontStyleEx.Bold);
            var headerFont = new XFont("Arial", 12, XFontStyleEx.Bold); // Smaller header

            gfx.DrawString($"Students Without Tutor Interaction Report (Last {days} Days)", titleFont,
                XBrushes.Black, new XRect(50, 50, page.Width - 100, 30), XStringFormats.TopCenter);

            double currentY = 100;
            double leftMargin = 40;
            double col1X = leftMargin;
            double col2X = leftMargin + 150;
            // double col3X = leftMargin + 300; // Removed
            double col3X = leftMargin + 300; // Renamed col4X to col3X

            // Draw Headers
            gfx.DrawString("Student Name", headerFont, XBrushes.Black, col1X, currentY);
            gfx.DrawString("Email", headerFont, XBrushes.Black, col2X, currentY);
            // gfx.DrawString("Assigned Tutors", headerFont, XBrushes.Black, col3X, currentY); // Removed
            gfx.DrawString("Last Interaction", headerFont, XBrushes.Black, col3X, currentY); // Use new col3X
            currentY += 25; // Space after header

            foreach (var student in students)
            {
                // Check page height
                if (currentY > page.Height - 80) // Need space for footer and next item
                {
                    page = document.AddPage();
                    gfx = XGraphics.FromPdfPage(page);
                    currentY = 50; // Reset Y for new page
                    // Redraw headers on new page if needed (optional)
                    gfx.DrawString("Student Name", headerFont, XBrushes.Black, col1X, currentY);
                    gfx.DrawString("Email", headerFont, XBrushes.Black, col2X, currentY);
                    // gfx.DrawString("Assigned Tutors", headerFont, XBrushes.Black, col3X, currentY); // Removed
                    gfx.DrawString("Last Interaction", headerFont, XBrushes.Black, col3X, currentY); // Use new col3X
                    currentY += 25;
                }

                gfx.DrawString(student.FullName ?? "-", font, XBrushes.Black, col1X, currentY);
                gfx.DrawString(student.Email ?? "-", font, XBrushes.Black, col2X, currentY);
                // gfx.DrawString(string.Join(", ", student.AssignedTutorNames), font, XBrushes.Black, col3X, currentY); // Removed
                gfx.DrawString(student.LastInteractionTime?.ToString("yyyy-MM-dd HH:mm") ?? "Never", font, XBrushes.Black, col3X, currentY); // Use new col3X
                currentY += 20;
            }

            // Footer
            gfx.DrawString($"Generated on: {DateTime.Now:yyyy-MM-dd HH:mm:ss}", font, XBrushes.Gray, leftMargin, page.Height - 40);

            using var stream = new MemoryStream();
            document.Save(stream, false); // 'false' = don't close stream
            return stream.ToArray();
        }


        public async Task<byte[]> GenerateStudentsWithoutInteractionExcelReportAsync(int days)
        {
            var response = await GetStudentsWithoutInteractionAsync(days);
            if (!response.Success)
            {
                throw new Exception(response.Message);
            }
            var students = response.Data;

            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("No Interaction Students");

            worksheet.Cell(1, 1).Value = $"Students Without Tutor Interaction Report (Last {days} Days)";
            worksheet.Cell(1, 1).Style.Font.Bold = true;
            worksheet.Cell(1, 1).Style.Font.FontSize = 16;
            worksheet.Range(1, 1, 1, 3).Merge().Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center; // Adjusted range


            worksheet.Cell(3, 1).Value = "Student Name";
            worksheet.Cell(3, 2).Value = "Email";
            // worksheet.Cell(3, 3).Value = "Assigned Tutors"; // Removed
            worksheet.Cell(3, 3).Value = "Last Interaction"; // Moved to col 3
            worksheet.Range(3, 1, 3, 3).Style.Font.Bold = true; // Adjusted range

            var row = 4;
            foreach (var student in students)
            {
                worksheet.Cell(row, 1).Value = student.FullName;
                worksheet.Cell(row, 2).Value = student.Email;
                // worksheet.Cell(row, 3).Value = string.Join(", ", student.AssignedTutorNames); // Removed
                worksheet.Cell(row, 3).Value = student.LastInteractionTime; // Moved to col 3
                if (student.LastInteractionTime.HasValue)
                {
                    worksheet.Cell(row, 3).Style.DateFormat.Format = "yyyy-MM-dd HH:mm"; // Adjusted col index
                }
                else
                {
                    worksheet.Cell(row, 3).Value = "Never"; // Adjusted col index
                }
                row++;
            }

            worksheet.Cell(row + 1, 1).Value = $"Generated on: {DateTime.Now:yyyy-MM-dd HH:mm:ss}";
            worksheet.Cell(row + 1, 1).Style.Font.Italic = true;

            worksheet.Columns().AdjustToContents();

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }


        // Implementation for Unconfirmed Email Students
        public async Task<ApiResponse<List<UnconfirmedEmailStudentResponse>>> GetUnconfirmedEmailStudentsAsync()
        {
            try
            {
                var unconfirmedStudents = await _context.Users
                    .Join(_context.UserRoles, u => u.Id, ur => ur.UserId, (u, ur) => new { User = u, ur.RoleId })
                    .Join(_context.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => new { ur.User, RoleName = r.Name })
                    .Where(x => x.RoleName == "Student" && !x.User.EmailConfirmed)
                    .Select(x => new UnconfirmedEmailStudentResponse
                    {
                        Id = x.User.Id.ToString(), // Convert Guid to string
                        FullName = x.User.FullName,
                        Email = x.User.Email
                    })
                    .Distinct() // Ensure uniqueness if a user somehow has multiple student roles (unlikely but safe)
                    .ToListAsync();

                return ApiResponse<List<UnconfirmedEmailStudentResponse>>.SuccessResponse(unconfirmedStudents);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetUnconfirmedEmailStudentsAsync: {ex}");
                return ApiResponse<List<UnconfirmedEmailStudentResponse>>.FailureResponse($"An error occurred: {ex.Message}");
            }
        }

        public async Task<byte[]> GenerateUnconfirmedEmailStudentsPdfReportAsync()
        {
            var response = await GetUnconfirmedEmailStudentsAsync();
            if (!response.Success)
            {
                throw new Exception(response.Message);
            }
            var students = response.Data;

            using var document = new PdfDocument();
            var page = document.AddPage();
            var gfx = XGraphics.FromPdfPage(page);
            var font = new XFont("Arial", 12);
            var titleFont = new XFont("Arial", 16, XFontStyleEx.Bold);
            var headerFont = new XFont("Arial", 14, XFontStyleEx.Bold);

            gfx.DrawString("Students with Unconfirmed Emails Report", titleFont,
                XBrushes.Black, new XRect(50, 50, page.Width - 100, 30), XStringFormats.TopCenter);

            double currentY = 100;
            double leftMargin = 50;
            double col1X = leftMargin;
            double col2X = leftMargin + 200;

            gfx.DrawString("Student Name", headerFont, XBrushes.Black, col1X, currentY);
            gfx.DrawString("Email", headerFont, XBrushes.Black, col2X, currentY);
            currentY += 25;

            foreach (var student in students)
            {
                if (currentY > page.Height - 80)
                {
                    page = document.AddPage();
                    gfx = XGraphics.FromPdfPage(page);
                    currentY = 50;
                    gfx.DrawString("Student Name", headerFont, XBrushes.Black, col1X, currentY);
                    gfx.DrawString("Email", headerFont, XBrushes.Black, col2X, currentY);
                    currentY += 25;
                }
                gfx.DrawString(student.FullName ?? "-", font, XBrushes.Black, col1X, currentY);
                gfx.DrawString(student.Email ?? "-", font, XBrushes.Black, col2X, currentY);
                currentY += 20;
            }

            gfx.DrawString($"Generated on: {DateTime.Now:yyyy-MM-dd HH:mm:ss}", font, XBrushes.Gray, leftMargin, page.Height - 40);

            using var stream = new MemoryStream();
            document.Save(stream, false);
            return stream.ToArray();
        }

        public async Task<byte[]> GenerateUnconfirmedEmailStudentsExcelReportAsync()
        {
            var response = await GetUnconfirmedEmailStudentsAsync();
            if (!response.Success)
            {
                throw new Exception(response.Message);
            }
            var students = response.Data;

            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Unconfirmed Emails");

            worksheet.Cell(1, 1).Value = "Students with Unconfirmed Emails Report";
            worksheet.Cell(1, 1).Style.Font.Bold = true;
            worksheet.Cell(1, 1).Style.Font.FontSize = 16;
            worksheet.Range(1, 1, 1, 2).Merge().Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

            worksheet.Cell(3, 1).Value = "Student Name";
            worksheet.Cell(3, 2).Value = "Email";
            worksheet.Range(3, 1, 3, 2).Style.Font.Bold = true;

            var row = 4;
            foreach (var student in students)
            {
                worksheet.Cell(row, 1).Value = student.FullName;
                worksheet.Cell(row, 2).Value = student.Email;
                row++;
            }

            worksheet.Cell(row + 1, 1).Value = $"Generated on: {DateTime.Now:yyyy-MM-dd HH:mm:ss}";
            worksheet.Cell(row + 1, 1).Style.Font.Italic = true;

            worksheet.Columns().AdjustToContents();

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }
    }
}

using ETutoring.Business.Dtos.Request.Message;
using ETutoring.Business.Dtos.Response;
using ETutoring.Business.Interfaces.Message;
using ETutoring.Business.Interfaces.Students;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using ETutoring.Business.Dtos.Request.Moderator;

namespace ETutoring.API.Controllers.Report
{
    [Route("api/reports")]
    [ApiController]
    [Authorize(Roles = "Moderator,Admin")]
    public class ReportController : ControllerBase
    {
        private readonly IMessageService _messageService;
        private readonly IStudentService _studentService;

        public ReportController(IMessageService messageService, IStudentService studentService)
        {
            _messageService = messageService;
            _studentService = studentService;
        }

        [HttpPost("tutor-performance")]
        public async Task<IActionResult> GetAverageMessagesPerTutor()
        {
            try
            {
                var response = await _messageService.GetAverageMessagesPerTutorAsync();
                return Ok(response);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetAverageMessagesPerTutor: {ex.Message}");
                return StatusCode(500, new { Message = "Internal Server Error", Error = ex.Message });
            }
        }

        [HttpPost("tutor-performance/pdf")]
        public async Task<IActionResult> GetTutorPerformancePdfReport()
        {
            try
            {
                var pdfBytes = await _messageService.GenerateTutorPerformancePdfReportAsync();
                return File(pdfBytes, "application/pdf", "TutorPerformanceReport.pdf");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetTutorPerformancePdfReport: {ex.Message}");
                return StatusCode(500, new { Message = "Internal Server Error", Error = ex.Message });
            }
        }

        [HttpPost("tutor-performance/excel")]
        public async Task<IActionResult> GetTutorPerformanceExcelReport()
        {
            try
            {
                var excelBytes = await _messageService.GenerateTutorPerformanceExcelReportAsync();
                return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "TutorPerformanceReport.xlsx");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetTutorPerformanceExcelReport: {ex.Message}");
                return StatusCode(500, new { Message = "Internal Server Error", Error = ex.Message });
            }
        }

        [HttpPost("students/unassigned")]
        public async Task<IActionResult> GetUnassignedStudents()
        {
            try
            {
                var response = await _studentService.GetUnassignedStudentsAsync();
                return Ok(response);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetUnassignedStudents: {ex.Message}");
                return StatusCode(500, new { Message = "Internal Server Error", Error = ex.Message });
            }
        }



        [HttpPost("students/unassigned/pdf")]
        public async Task<IActionResult> GetUnassignedStudentsPdfReport()
        {
            try
            {
                var pdfBytes = await _studentService.GenerateUnassignedStudentsPdfReportAsync();
                return File(pdfBytes, "application/pdf", "UnassignedStudentsReport.pdf");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetUnassignedStudentsPdfReport: {ex.Message}");
                return StatusCode(500, new { Message = "Internal Server Error", Error = ex.Message });
            }
        }

        [HttpPost("students/unassigned/excel")]
        public async Task<IActionResult> GetUnassignedStudentsExcelReport()
        {
            try
            {
                var excelBytes = await _studentService.GenerateUnassignedStudentsExcelReportAsync();
                return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "UnassignedStudentsReport.xlsx");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetUnassignedStudentsExcelReport: {ex.Message}");
                return StatusCode(500, new { Message = "Internal Server Error", Error = ex.Message });
            }
        }
        [HttpPost("students/inactive")]
        public async Task<IActionResult> GetInactiveStudents([FromBody] InactiveStudentsRequest request)
        {
            try
            {
                var days = request?.Days ?? 7;
                var response = await _studentService.GetInactiveStudentsAsync(days);
                return Ok(response);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetInactiveStudents: {ex.Message}");
                return StatusCode(500, new { Message = "Internal Server Error", Error = ex.Message });
            }
        }
        [HttpPost("students/inactive/pdf")]
        public async Task<IActionResult> GetInactiveStudentsPdfReport([FromBody] InactiveStudentsRequest request)
        {
            try
            {
                var days = request?.Days ?? 7;
                var pdfBytes = await _studentService.GenerateInactiveStudentsPdfReportAsync(days);
                return File(pdfBytes, "application/pdf", "InactiveStudentsReport.pdf");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetInactiveStudentsPdfReport: {ex.Message}");
                return StatusCode(500, new { Message = "Internal Server Error", Error = ex.Message });
            }
        }

        [HttpPost("students/inactive/excel")]
        public async Task<IActionResult> GetInactiveStudentsExcelReport([FromBody] InactiveStudentsRequest request)
        {
            try
            {
                var days = request?.Days ?? 7;
                var excelBytes = await _studentService.GenerateInactiveStudentsExcelReportAsync(days);
                return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "InactiveStudentsReport.xlsx");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetInactiveStudentsExcelReport: {ex.Message}");
                return StatusCode(500, new { Message = "Internal Server Error", Error = ex.Message });
            }
        }

        // --- Students Without Interaction ---

        [HttpPost("students/no-interaction")]
        public async Task<IActionResult> GetStudentsWithoutInteraction([FromBody] InactiveStudentsRequest request) // Reusing InactiveStudentsRequest for Days parameter
        {
            try
            {
                var days = request?.Days ?? 7; // Default to 7 days if not provided
                var response = await _studentService.GetStudentsWithoutInteractionAsync(days);
                return Ok(response);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetStudentsWithoutInteraction: {ex.Message}");
                return StatusCode(500, new { Message = "Internal Server Error", Error = ex.Message });
            }
        }

        [HttpPost("students/no-interaction/pdf")]
        public async Task<IActionResult> GetStudentsWithoutInteractionPdfReport([FromBody] InactiveStudentsRequest request)
        {
            try
            {
                var days = request?.Days ?? 7;
                var pdfBytes = await _studentService.GenerateStudentsWithoutInteractionPdfReportAsync(days);
                return File(pdfBytes, "application/pdf", "StudentsWithoutInteractionReport.pdf");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetStudentsWithoutInteractionPdfReport: {ex.Message}");
                return StatusCode(500, new { Message = "Internal Server Error", Error = ex.Message });
            }
        }

        [HttpPost("students/no-interaction/excel")]
        public async Task<IActionResult> GetStudentsWithoutInteractionExcelReport([FromBody] InactiveStudentsRequest request)
        {
            try
            {
                var days = request?.Days ?? 7;
                var excelBytes = await _studentService.GenerateStudentsWithoutInteractionExcelReportAsync(days);
                return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "StudentsWithoutInteractionReport.xlsx");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetStudentsWithoutInteractionExcelReport: {ex.Message}");
                return StatusCode(500, new { Message = "Internal Server Error", Error = ex.Message });
            }
        }

        // --- Unconfirmed Email Students ---

        [HttpPost("students/unconfirmed-email")]
        public async Task<IActionResult> GetUnconfirmedEmailStudents()
        {
            try
            {
                var response = await _studentService.GetUnconfirmedEmailStudentsAsync();
                return Ok(response);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetUnconfirmedEmailStudents: {ex.Message}");
                return StatusCode(500, new { Message = "Internal Server Error", Error = ex.Message });
            }
        }

        [HttpPost("students/unconfirmed-email/pdf")]
        public async Task<IActionResult> GetUnconfirmedEmailStudentsPdfReport()
        {
            try
            {
                var pdfBytes = await _studentService.GenerateUnconfirmedEmailStudentsPdfReportAsync();
                return File(pdfBytes, "application/pdf", "UnconfirmedEmailStudentsReport.pdf");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetUnconfirmedEmailStudentsPdfReport: {ex.Message}");
                return StatusCode(500, new { Message = "Internal Server Error", Error = ex.Message });
            }
        }

        [HttpPost("students/unconfirmed-email/excel")]
        public async Task<IActionResult> GetUnconfirmedEmailStudentsExcelReport()
        {
            try
            {
                var excelBytes = await _studentService.GenerateUnconfirmedEmailStudentsExcelReportAsync();
                return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "UnconfirmedEmailStudentsReport.xlsx");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetUnconfirmedEmailStudentsExcelReport: {ex.Message}");
                return StatusCode(500, new { Message = "Internal Server Error", Error = ex.Message });
            }
        }
    }
}

using ETutoring.Business.Interfaces.Message;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace ETutoring.API.Controllers.Message
{
    public partial class MessageController : ControllerBase
    {
        [HttpGet("tutor-performance")]
        [Authorize(Roles = "Moderator")]
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

        [HttpGet("tutor-performance/pdf")]
        [Authorize(Roles = "Moderator")]
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

        [HttpGet("tutor-performance/excel")]
        [Authorize(Roles = "Moderator")]
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
    }
}
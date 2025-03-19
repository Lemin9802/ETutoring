using ETutoring.Business.Dtos.Request.Students;
using ETutoring.Business.Dtos.Response.Moderator;
using ETutoring.Business.Interfaces.Students;
using ETutoring.Core.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using ETutoring.Business.Dtos.Response;
using ETutoring.Business.Dtos.Response.Students;

namespace ETutoring.API.Controllers.Students
{
    [Route("api/students")]
    [ApiController]
    [Authorize(Roles = "Student")]
    public partial class StudentController : ControllerBase
    {
        private readonly IStudentService _studentService;

        public StudentController(IStudentService studentService)
        {
            _studentService = studentService;
        }

        [HttpPost("get-tutors")]
        public async Task<ApiResponse<List<GetTutorForStudentResponse>>>GetTutorsForStudent([FromBody] GetTutorsForStudentRequest model)
        {
            return await _studentService.GetTutorsForStudentAsync(model.StudentId);            
        }

        [HttpGet("unassigned")]
        [Authorize(Roles = "Moderator")]
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

        [HttpGet("inactive")]
        [Authorize(Roles = "Moderator")]
        public async Task<IActionResult> GetInactiveStudents([FromQuery] int days = 7)
        {
            try
            {
                var response = await _studentService.GetInactiveStudentsAsync(days);
                return Ok(response);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetInactiveStudents: {ex.Message}");
                return StatusCode(500, new { Message = "Internal Server Error", Error = ex.Message });
            }
        }

        [HttpGet("unassigned/pdf")]
        [Authorize(Roles = "Moderator")]
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

        [HttpGet("unassigned/excel")]
        [Authorize(Roles = "Moderator")]
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

        [HttpGet("inactive/pdf")]
        [Authorize(Roles = "Moderator")]
        public async Task<IActionResult> GetInactiveStudentsPdfReport([FromQuery] int days = 7)
        {
            try
            {
                var pdfBytes = await _studentService.GenerateInactiveStudentsPdfReportAsync(days);
                return File(pdfBytes, "application/pdf", "InactiveStudentsReport.pdf");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetInactiveStudentsPdfReport: {ex.Message}");
                return StatusCode(500, new { Message = "Internal Server Error", Error = ex.Message });
            }
        }

        [HttpGet("inactive/excel")]
        [Authorize(Roles = "Moderator")]
        public async Task<IActionResult> GetInactiveStudentsExcelReport([FromQuery] int days = 7)
        {
            try
            {
                var excelBytes = await _studentService.GenerateInactiveStudentsExcelReportAsync(days);
                return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "InactiveStudentsReport.xlsx");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetInactiveStudentsExcelReport: {ex.Message}");
                return StatusCode(500, new { Message = "Internal Server Error", Error = ex.Message });
            }
        }
    }
}

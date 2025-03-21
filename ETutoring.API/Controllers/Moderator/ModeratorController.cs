using ETutoring.Business.Dtos.Request;
using ETutoring.Business.Dtos.Request.Message;
using ETutoring.Business.Dtos.Request.Moderator;
using ETutoring.Business.Dtos.Response;
using ETutoring.Business.Dtos.Response.User;
using ETutoring.Core.Common;
using ETutoring.Business.Dtos.Students;
using ETutoring.Business.Interfaces.Message;
using ETutoring.Business.Interfaces.Moderator;
using ETutoring.Business.Interfaces.Students;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.JsonWebTokens;
using System.Security.Claims;
using ETutoring.Business.Dtos;
using ETutoring.Business.Dtos.Response.Message;
using ETutoring.Business.Dtos.Response.Moderator;
using ETutoring.Business.Dtos.Response.Students;

namespace ETutoring.API.Controllers.Moderator
{
    [Route("api/moderator")]
    [ApiController]
    [Authorize(Roles = "Admin,Moderator")]
    public class ModeratorController : Controller
    {
        private readonly IModeratorService _moderatorService;
        private readonly IMessageService _messageService;
        private readonly IStudentService _studentService;

        public ModeratorController(IModeratorService moderatorService, IMessageService messageService, IStudentService studentService)
        {
            _moderatorService = moderatorService;
            _messageService = messageService;
            _studentService = studentService;
        }

        [HttpPost("list-tutors")]
        public async Task<ApiResponse<List<UserDto>>> GetAllTutors([FromBody] MetaDataResponse meta)
        {
            return await _moderatorService.GetAllTutorsAsync(meta);
        }

        [HttpPost("get-tutors-users")]
        public async Task<ApiResponse<List<UserDto>>> GetAllTutorsTeachers([FromBody] MetaDataResponse meta)
        {
            return await _moderatorService.GetAllTutorsStudentsAsync(meta);
        }

        [HttpPost("assign-multiple")]
        public async Task<ApiResponse<bool>> AssignTutorToMultipleStudents([FromBody] AssignTutorMultipleStudentsRequest request)
        {
            return await _moderatorService.AssignTutorToMultipleStudentsAsync(request.StudentIds, request.TutorId, request.AssignedBy);
        }

        [HttpPost("management-history")]
        public async Task<ApiResponse<List<StudentTutorManagementHistoryResponse>>> GetManagementHistory([FromBody] MetaDataResponse meta)
        {
            return await _moderatorService.GetManagementHistoryAsync(meta);
        }

        [HttpPost("management-history/details")]
        public async Task<ApiResponse<List<StudentTutorManagementHistoryResponse>>> GetManagementHistoryDetails([FromBody] StudentTutorManagementHistoryRequest model)
        {
            return await _moderatorService.GetDetailsManagementHistoryAsync(model.StudentTutorManagementId);
        }

        [HttpPost("students")]
        public async Task<ApiResponse<List<StudentDto>>> GetAllStudents([FromBody] MetaDataResponse meta)
        {
            return await _moderatorService.GetAllStudentsAsync(meta);
        }

        [HttpPost("assign-chatroom")]
        [Authorize(Roles = "Moderator")]
        public async Task<IActionResult> AssignChatroom([FromBody] AssignChatroomRequest request)
        {
            var response = await _messageService.AssignChatroomAsync(request);
            return StatusCode(200, response);
        }

        [HttpPost("get-all-chatrooms")]
        [Authorize(Roles = "Moderator")]
        public async Task<ApiResponse<List<ChatRoomResponse>>> GetAssignedChatrooms([FromBody] MetaResponse meta)
        {
            return await _messageService.GetAssignedChatroomsAsync(meta);
        }

        [HttpPost("update-assign-chatroom")]
        [Authorize(Roles = "Moderator")]
        public async Task<ApiResponse<UpdateAssignChatroomResponse>> UpdateAssignChatroom([FromBody] UpdateAssignChatroomRequest request)
        {
            return await _messageService.UpdateAssignChatroomAsync(request);
        }

        [HttpPost("delete-assign-chatroom")]
        [Authorize(Roles = "Moderator")]
        public async Task<ApiResponse<DeleteAssignChatroomResponse>> DeleteAssignChatroom([FromBody] DeleteAssignChatroomRequest request)
        {
            return await _messageService.DeleteAssignChatroomAsync(request);
        }

        [HttpGet("students/unassigned")]
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

        [HttpGet("students/inactive")]
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

        [HttpGet("students/unassigned/pdf")]
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

        [HttpGet("students/unassigned/excel")]
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

        [HttpGet("students/inactive/pdf")]
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

        [HttpGet("students/inactive/excel")]
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

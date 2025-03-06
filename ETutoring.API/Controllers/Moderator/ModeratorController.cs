using ETutoring.Business.Dtos.Request;
using ETutoring.Business.Dtos.Request.Message;
using ETutoring.Business.Dtos.Request.Moderator;
using ETutoring.Business.Dtos.Response;
using System.Diagnostics;
using ETutoring.Business.Dtos.Request.Message;
using ETutoring.Business.Dtos.Response.Message;
using ETutoring.Business.Dtos.Response.Moderator;
using ETutoring.Business.Dtos.Response.Students;
using ETutoring.Business.Interfaces.Message;
using ETutoring.Business.Dtos.Response.User;
using ETutoring.Core.Common;
using Org.BouncyCastle.Asn1.Ocsp;
using Amazon.Runtime.Internal;
using ETutoring.Business.Dtos.Students;
using ETutoring.Business.Interfaces.Message;
using ETutoring.Business.Interfaces.Moderator;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.JsonWebTokens;
using System.Diagnostics;
using System.Security.Claims;

namespace ETutoring.API.Controllers.Moderator
{
    [Route("api/moderator")]
    [ApiController]
    [Authorize(Roles = "Admin,Moderator")]
    public class ModeratorController : Controller
    {
        private readonly IModeratorService _moderatorService;
        private readonly IMessageService _messageService;

        public ModeratorController(IModeratorService moderatorService, IMessageService messageService)
        {
            _moderatorService = moderatorService;
            _messageService = messageService;
        }

        [HttpPost("list-tutors")]
        public async Task<ApiResponse<List<UserDto>>> GetAllTutors([FromBody] PaginationRequest request)
        {
            return await _moderatorService.GetAllTutorsAsync(request.Page, request.Size);
        }

        [HttpPost("get-tutors-users")]
        public async Task<ApiResponse<List<UserDto>>> GetAllTutorsTeachers([FromBody] PaginationRequest request)
        {
            return await _moderatorService.GetAllTutorsStudentsAsync(request.Page, request.Size);
        }

        [HttpPost("assign-multiple")]
        public async Task<ApiResponse<bool>> AssignTutorToMultipleStudents([FromBody] AssignTutorMultipleStudentsRequest request)
        {
            return await _moderatorService.AssignTutorToMultipleStudentsAsync(request.StudentIds, request.TutorId, request.AssignedBy);
        }

        [HttpPost("management-history")]
        public async Task<ApiResponse<List<StudentTutorManagementHistoryResponse>>> GetManagementHistory([FromBody] PaginationRequest request)
        {
            return await _moderatorService.GetManagementHistoryAsync(request.Page, request.Size);
        }

        [HttpPost("management-history/details")]
        public async Task<ApiResponse<List<StudentTutorManagementHistoryResponse>>> GetManagementHistoryDetails([FromBody] StudentTutorManagementHistoryRequest model)
        {
            return await _moderatorService.GetDetailsManagementHistoryAsync(model.StudentTutorManagementId);
        }

        [HttpPost("students")]
        public async Task<ApiResponse<List<StudentDto>>> GetAllStudents([FromBody] PaginationRequest request)
        {
            return await _moderatorService.GetAllStudentsAsync(request.Page, request.Size);
        }

        [HttpPost("assign-chatroom")]
        [Authorize(Roles = "Moderator")]
        public async Task<IActionResult> AssignChatroom([FromBody] AssignChatroomRequest request)
        {
            var response = await _messageService.AssignChatroomAsync(request);
            return StatusCode(200, response);
        }

        [HttpPost("assigned-chatrooms")]
        [Authorize(Roles = "Student,Tutor,Moderator")]
        public async Task<ApiResponse<List<ChatRoomResponse>>> GetAssignedChatrooms([FromBody] GetAssignedChatroomsRequest request)
        {
            return await _messageService.GetAssignedChatroomsAsync(request);
        }
    }
}

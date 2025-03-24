using ETutoring.Business.Dtos.Request;
using ETutoring.Business.Dtos.Request.Message;
using ETutoring.Business.Dtos.Request.Moderator;
using ETutoring.Business.Dtos.Response;
using System.Diagnostics;
using ETutoring.Business.Dtos.Request.Message;
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
using ETutoring.Business.Dtos;
using ETutoring.Business.Dtos.Response.Message;
using ETutoring.Business.Dtos.Response.Moderator;
using ETutoring.Business.Dtos.Response.Students;
using ETutoring.Business.Dtos.Response.Moderator;
using ETutoring.Business.Dtos.Response.Students;
using ETutoring.Business.Dtos.Response.Message;

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
            return await _moderatorService.AssignTutorToMultipleStudentsAsync(request);
        }

        [HttpPost("remove-assign-multiple")]
        public async Task<ApiResponse<bool>> RemoveAssignMultipleStudents([FromBody] RemoveTutorMultipleStudentsRequest request)
        {
            return await _moderatorService.RemoveTutorFromMultipleStudentsAsync(request);
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

        [HttpPost("get-list-assign")]
        public async Task<ApiResponse<List<AllocationResponse>>> GetListAssign([FromBody] MetaDataResponse meta)
        {
            return await _moderatorService.GetAllAllocationsAsync(meta);
        }

        [HttpPost("remove-allocations")]
        public async Task<ApiResponse<bool>> RemoveAllocations([FromBody] List<RemoveAllocation> allocations)
        {
            return await _moderatorService.RemoveAllocationsAsync(allocations);
        }
    }
}

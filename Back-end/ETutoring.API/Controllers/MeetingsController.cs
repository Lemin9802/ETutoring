using ETutoring.Business.Dtos.Meetings;
using ETutoring.Business.Exceptions;
using ETutoring.Business.Interfaces;
using ETutoring.Core.Common;
using ETutoring.Core.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.JsonWebTokens;
using System.Security.Claims;

namespace ETutoring.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MeetingsController : ControllerBase
    {
        private readonly IMeetingService _meetingService;

        public MeetingsController(IMeetingService meetingService)
        {
            _meetingService = meetingService;
        }

        [HttpPost("create")]
        public async Task<ActionResult<ApiResponse<CreateMeetingRequest>>> CreateMeeting([FromBody] CreateMeetingRequest request, CancellationToken cancellationToken)
        {
            var creatorId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);

            request.AddCreator(Guid.Parse(creatorId ?? throw new Exception("Not found user in JWT token")));

            var meeting = await _meetingService.CreateMeetingAsync(request, cancellationToken);
            var response = ApiResponse<CreateMeetingRequest>.SuccessResponse(meeting, "Meeting created successfully.");
            return Ok(response);
        }

        [HttpPost("change-status")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<ChangeMeetingStatusRequest>>> ChangeMeetingStatus([FromBody] ChangeMeetingStatusRequest request, CancellationToken cancellationToken)
        {
            var userRole = User.FindFirstValue("role");

            if (userRole != "Tutor")
            {
                throw new AuthErrorException("Only tutors of the meeting can change meeting status.");
            }

            var isSuccess = await _meetingService.ChangeMeetingStatus(request, cancellationToken);

            var response = isSuccess
                ? ApiResponseHandler.SuccessResponse(request, "Meeting status changed successfully.")
                : ApiResponseHandler.FailureResponse<ChangeMeetingStatusRequest>("Failed to change meeting status.");

            if (!isSuccess)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }

        [HttpPost("user")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<IEnumerable<MeetingResponse>>>> GetUserMeetings(CancellationToken cancellationToken)
        {
            var userId = Guid.TryParse(User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value, out var parsedId) ? parsedId : Guid.Empty;

            if (userId == Guid.Empty)
            {
                throw new AuthErrorException("Not found user in JWT token");
            }

            var meetings = await _meetingService.GetUserMeetings(userId, cancellationToken);
            var response = ApiResponse<IEnumerable<MeetingResponse>>.SuccessResponse(meetings, "Meetings retrieved successfully.");
            return Ok(response);
        }

        [HttpPost("all")]
        public async Task<ActionResult<ApiResponse<IEnumerable<MeetingResponse>>>> GetAllMeetings(CancellationToken cancellationToken)
        {
            var meetings = await _meetingService.GetAllMeetings(cancellationToken);
            var response = ApiResponse<IEnumerable<MeetingResponse>>.SuccessResponse(meetings, "Meetings retrieved successfully.");
            return Ok(response);
        }
    }
}
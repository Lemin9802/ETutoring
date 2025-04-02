using ETutoring.Business.Dtos.Meetings;
using ETutoring.Business.Exceptions;
using ETutoring.Business.Interfaces;
using ETutoring.Core.Common;
using ETutoring.Core.Helpers;
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
        public async Task<ActionResult<ApiResponse<ChangeMeetingStatusRequest>>> ChangeMeetingStatus([FromBody] ChangeMeetingStatusRequest request, CancellationToken cancellationToken)
        {
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
        public async Task<ActionResult<ApiResponse<IEnumerable<MeetingResponse>>>> GetUserMeetings(CancellationToken cancellationToken)
        {
            var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            var meetings = await _meetingService.GetUserMeetings(Guid.Parse(userId ?? throw new AuthErrorException("Not found user in JWT token")), cancellationToken);
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
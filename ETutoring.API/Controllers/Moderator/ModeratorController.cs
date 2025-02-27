using ETutoring.Business.Dtos.Students;
using ETutoring.Business.Interfaces.Students;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using ETutoring.Business.Interfaces.Moderator;
using ETutoring.Business.Interfaces.Tutor;
using ETutoring.DataAccess.Services.Students;
using ETutoring.Business.Dtos.Request.Moderator;
using ETutoring.Business.Dtos.Request;
using ETutoring.Business.Dtos.Response;
using System.Diagnostics;

namespace ETutoring.API.Controllers.Moderator
{
    [Route("api/moderator")]
    [ApiController]
    [Authorize(Roles = "Admin,Moderator")]
    public class ModeratorController : Controller
    {
        private readonly IModeratorService _moderatorService;

        public ModeratorController(IModeratorService moderatorService)
        {
            _moderatorService = moderatorService;
        }

        [HttpPost("list-tutors")]
        public async Task<IActionResult> GetAllTutors([FromBody] BaseRequest request)
        {
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            try
            {
                var response = await _moderatorService.GetAllTutorsAsync(request);
                stopwatch.Stop();
                return StatusCode(response.StatusCode, response);
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                return StatusCode(500, new BaseResponse(500, "An error occurred while retrieving tutors.", ex.Message, stopwatch.ElapsedMilliseconds));
            }
        }

        [HttpPost("get-tutors-users")]
        public async Task<IActionResult> GetAllTutorsTeachers([FromBody] BaseRequest request)
        {
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            try
            {
                var response = await _moderatorService.GetAllTutorsStudentsAsync(request);
                stopwatch.Stop();
                return StatusCode(response.StatusCode, response);
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                return StatusCode(500, new BaseResponse(500, "An error occurred while retrieving tutors.", ex.Message, stopwatch.ElapsedMilliseconds));
            }
        }

        [HttpPost("list")]
        [ProducesResponseType(typeof(BaseResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(BaseResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(BaseResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetStudentsWithOrWithoutTutors([FromBody] StudentTutorStatusRequest request)
        {
            var stopwatch = Stopwatch.StartNew();
            try
            {
                var response = await _moderatorService.GetAllStudentsAsync(request);
                stopwatch.Stop();
                return StatusCode(response.StatusCode, response);
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                return StatusCode(500, new BaseResponse(500, "An error occurred while retrieving students.", ex.Message, stopwatch.ElapsedMilliseconds));
            }
        }

        [HttpPost("assign")]
        [ProducesResponseType(typeof(BaseResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(BaseResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(BaseResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> AssignTutorToStudent([FromBody] AssignTutorStudentRequest model)
        {
            if (!ModelState.IsValid)
                return BadRequest(new BaseResponse(400, "Invalid data."));

            var assignedBy = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(assignedBy) || !Guid.TryParse(assignedBy, out var parsedAssignedBy))
                return Unauthorized(new BaseResponse(401, "Invalid user token."));

            var stopwatch = Stopwatch.StartNew();
            try
            {
                var response = await _moderatorService.AssignTutorToStudentAsync(model.StudentId, model.TutorId, parsedAssignedBy);
                stopwatch.Stop();
                return StatusCode(response.StatusCode, response);
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                return StatusCode(500, new BaseResponse(500, "An error occurred while assigning tutor.", ex.Message, stopwatch.ElapsedMilliseconds));
            }
        }

        [HttpPost("assign-multiple")]
        [ProducesResponseType(typeof(BaseResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(BaseResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(BaseResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> AssignTutorToMultipleStudents([FromBody] AssignTutorMultipleStudentsRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new BaseResponse(400, "Invalid data."));

            var assignedBy = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(assignedBy) || !Guid.TryParse(assignedBy, out var parsedAssignedBy))
                    return Unauthorized(new BaseResponse(401, "Invalid user token."));

            var stopwatch = Stopwatch.StartNew();
            try
            {
                var response = await _moderatorService.AssignTutorToMultipleStudentsAsync(request.StudentIds, request.TutorId, parsedAssignedBy);
                stopwatch.Stop();
                return StatusCode(response.StatusCode, response);
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                return StatusCode(500, new BaseResponse(500, "An error occurred while assigning tutor to multiple students.", ex.Message, stopwatch.ElapsedMilliseconds));
            }
        }

        [HttpPost("reassign-tutor")]
        [ProducesResponseType(typeof(BaseResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(BaseResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(BaseResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ReassignStudentToTutor([FromBody] ReassignStudentToTutorRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new BaseResponse(400, "Invalid data."));

            var assignedBy = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(assignedBy) || !Guid.TryParse(assignedBy, out var assignedById))
                return Unauthorized(new BaseResponse(401, "Invalid user token."));

            request.AssignedBy = assignedById;

            var stopwatch = Stopwatch.StartNew();
            try
            {
                var response = await _moderatorService.ReassignTutorToStudentAsync(request);
                stopwatch.Stop();
                return StatusCode(response.StatusCode, response);
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                return StatusCode(500, new BaseResponse(500, "An error occurred while reassigning tutor.", ex.Message, stopwatch.ElapsedMilliseconds));
            }
        }

        [HttpPost("management-history")]
        [ProducesResponseType(typeof(BaseResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(BaseResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(BaseResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetManagementHistory([FromBody] BaseRequest request)
        {
            var stopwatch = Stopwatch.StartNew();
            try
            {
                var response = await _moderatorService.GetManagementHistoryAsync(request);
                stopwatch.Stop();
                return StatusCode(response.StatusCode, response);
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                return StatusCode(500, new BaseResponse(500, "An error occurred while retrieving management history.", ex.Message, stopwatch.ElapsedMilliseconds));
            }
        }

        [HttpPost("management-history/details")]
        [ProducesResponseType(typeof(BaseResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(BaseResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(BaseResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetManagementHistoryDetails([FromBody] StudentTutorManagementHistoryRequest model)
        {
            var stopwatch = Stopwatch.StartNew();
            try
            {
                var response = await _moderatorService.GetDetailsManagementHistoryAsync(model.StudentTutorManagementId);
                stopwatch.Stop();
                return StatusCode(response.StatusCode, response);
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                return StatusCode(500, new BaseResponse(500, "An error occurred while retrieving management history details.", ex.Message, stopwatch.ElapsedMilliseconds));
            }
        }

        [HttpPost("students")]
        [ProducesResponseType(typeof(BaseResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(BaseResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(BaseResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAllStudents([FromBody] BaseRequest request)
        {
            var stopwatch = Stopwatch.StartNew();
            try
            {
                var response = await _moderatorService.GetAllStudentsAsync(request);
                stopwatch.Stop();
                response.Took = stopwatch.ElapsedMilliseconds;
                return StatusCode(response.StatusCode, response);
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                return StatusCode(500, new BaseResponse(500, "An error occurred while retrieving students.", ex.Message, stopwatch.ElapsedMilliseconds));
            }
        }
    }
}

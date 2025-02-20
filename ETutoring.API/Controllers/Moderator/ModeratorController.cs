using ETutoring.Business.Dtos.Students;
using ETutoring.Business.Interfaces.Students;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using ETutoring.Business.Interfaces.Moderator;
using ETutoring.Business.Interfaces.Tutor;
using ETutoring.DataAccess.Services.Students;

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

        [HttpPost("list")]
        public async Task<IActionResult> GetStudentsWithOrWithoutTutors([FromBody] StudentTutorStatusRequest request)
        {
            var students = await _moderatorService.GetAllStudentsAsync(request.HasTutor);

            if (!students.Any())
                return NotFound(new { message = "No students found." });

            return Ok(students);
        }

        [HttpPost("assign")]
        public async Task<IActionResult> AssignTutorToStudent([FromBody] AssignTutorStudentRequest model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var assignedBy = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(assignedBy) || !Guid.TryParse(assignedBy, out var parsedAssignedBy))
                return Unauthorized(new { message = "Invalid user token." });

            var result = await _moderatorService.AssignTutorToStudentAsync(model.StudentId, model.TutorId, parsedAssignedBy);

            if (!result)
                return BadRequest(new { message = "Assignment failed. Student may already have this tutor." });

            return Ok(new { message = "Tutor assigned successfully." });
        }

        [HttpPost("management-history")]
        public async Task<IActionResult> GetManagementHistory()
        {
            var history = await _moderatorService.GetManagementHistoryAsync();

            if (!history.Any())
                return NotFound(new { message = "No management history found." });

            return Ok(history);
        }

        [HttpPost("management-history/details")]
        public async Task<IActionResult> GetManagementHistoryDetails([FromBody] StudentTutorManagementHistoryRequest model)
        {
            var history = await _moderatorService.GetManagementHistoryAsync(model.StudentTutorManagementId);

            if (!history.Any())
                return NotFound(new { message = "No history found for this assignment." });

            return Ok(history);
        }

    }
}

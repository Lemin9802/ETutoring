using ETutoring.Business.Dtos.Students;
using ETutoring.Business.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ETutoring.API.Controllers
{
    [Route("api/students")]
    [ApiController]
    [Authorize(Roles = "Admin,Moderator")]
    public class StudentController : ControllerBase
    {
        private readonly IStudentService _studentService;

        public StudentController(IStudentService studentService)
        {
            _studentService = studentService;
        }

        [HttpPost("list")]
        public async Task<IActionResult> GetAllStudentsWithTutorStatus()
        {
            var students = await _studentService.GetAllStudentsWithTutorStatusAsync();
            return Ok(students);
        }

        [HttpPost("assign")]
        public async Task<IActionResult> AssignTutor([FromBody] AssignTutorStudentRequest model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var assignedBy = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(assignedBy) || !Guid.TryParse(assignedBy, out var assignedById))
                return Unauthorized(new { message = "Invalid user token." });

            var success = await _studentService.AssignTutorToStudentAsync(model.StudentId, model.TutorId, assignedById);
            if (!success)
                return BadRequest(new { message = "Assignment failed. Student already has a tutor." });

            return Ok(new { message = "Tutor assigned successfully." });
        }
    }
}

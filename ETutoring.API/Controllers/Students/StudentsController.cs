using ETutoring.Business.Dtos.Students;
using ETutoring.Business.Interfaces.Students;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ETutoring.API.Controllers.Students
{
    [Route("api/students")]
    [ApiController]
    [Authorize(Roles = "Student")]
    public class StudentController : ControllerBase
    {
        private readonly IStudentService _studentService;

        public StudentController(IStudentService studentService)
        {
            _studentService = studentService;
        }

        [HttpPost("get-tutors")]
        public async Task<IActionResult> GetTutorsForStudent([FromBody] GetTutorsForStudentRequest model)
        {
            var tutors = await _studentService.GetTutorsForStudentAsync(model.StudentId);

            if (!tutors.Any())
                return NotFound(new { message = "This student does not have any tutors assigned." });

            return Ok(tutors);
        }

    }
}

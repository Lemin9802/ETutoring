using ETutoring.Business.Dtos.Request.Students;
using ETutoring.Business.Dtos.Response.Moderator;
using ETutoring.Business.Interfaces.Students;
using ETutoring.Core.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
        public async Task<ActionResult<ApiResponse<IEnumerable<StudentTutorResponse>>>> GetTutorsForStudent([FromBody] GetTutorsForStudentRequest model)
        {
            var response = await _studentService.GetTutorsForStudentAsync(model.StudentId);
            return response;
        }
    }
}
using ETutoring.Business.Dtos.Request.Students;
using ETutoring.Business.Interfaces.Students;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using ETutoring.Business.Dtos.Response;
using System.Net;

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
            var stopwatch = Stopwatch.StartNew();
            try
            {
                var response = await _studentService.GetTutorsForStudentAsync(model.StudentId);
                stopwatch.Stop();
                return StatusCode((int)response.StatusCode, response);
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                return StatusCode((int)HttpStatusCode.InternalServerError,
                    new BaseResponse(HttpStatusCode.InternalServerError.GetHashCode(),
                        "An error occurred while retrieving tutors.",
                        ex.Message,
                        stopwatch.ElapsedMilliseconds));
            }
        }
    }
}
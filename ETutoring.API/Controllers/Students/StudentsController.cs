using ETutoring.Business.Dtos.Request.Students;
using ETutoring.Business.Interfaces.Students;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using ETutoring.Business.Dtos.Response;
using System.Net;
using ETutoring.Core.Common;

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
            try
            {
                var response = await _studentService.GetTutorsForStudentAsync(model.StudentId);

                if (!response.Success)
                {
                    return StatusCode((int)HttpStatusCode.NotFound, response); // 404 if no tutors found
                }

                return StatusCode((int)HttpStatusCode.OK, response); // 200 OK with the list of tutors
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError,
                    new ApiResponse<object>(false, "An error occurred while retrieving tutors.", errors: new List<string> { ex.Message }, data: null));
            }
        }
    }
}

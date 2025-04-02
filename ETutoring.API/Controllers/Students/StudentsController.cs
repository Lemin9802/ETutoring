using ETutoring.Business.Dtos.Request.Students;
using ETutoring.Business.Dtos.Response.Moderator;
using ETutoring.Business.Interfaces.Students;
using ETutoring.Core.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using ETutoring.Business.Dtos.Response;
using ETutoring.Business.Dtos.Response.Students;

namespace ETutoring.API.Controllers.Students
{
    [Route("api/students")]
    [ApiController]
    [Authorize(Roles = "Student")]
    public partial class StudentController : ControllerBase
    {
        private readonly IStudentService _studentService;

        public StudentController(IStudentService studentService)
        {
            _studentService = studentService;
        }

        [HttpPost("get-tutors")]
        public async Task<ApiResponse<List<GetTutorForStudentResponse>>>GetTutorsForStudent([FromBody] GetTutorsForStudentRequest model)
        {
            return await _studentService.GetTutorsForStudentAsync(model);            
        }


    }
}

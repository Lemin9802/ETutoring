using ETutoring.Business.Dtos.Request.Tutor;
using ETutoring.Business.Interfaces.Tutor;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Net;
using ETutoring.Business.Dtos.Response;
using ETutoring.Core.Common;

namespace ETutoring.API.Controllers.Tutor
{
    [Route("api/tutor")]
    [ApiController]
    [Authorize(Roles = "Tutor")]
    public class TutorController : Controller
    {
        private readonly ITutorService _tutorService;

        public TutorController(ITutorService tutorService)
        {
            _tutorService = tutorService;
        }

        [HttpPost("get-students")]
        public async Task<IActionResult> GetStudentsForTutor([FromBody] GetStudentsForTutorRequest model)
        {
            try
            {
                var response = await _tutorService.GetStudentsForTutorAsync(model.TutorId, model.page, model.size);
                if (!response.Success)
                {
                    return StatusCode((int)HttpStatusCode.NotFound, response); // 404 if no students found
                }

                return StatusCode((int)HttpStatusCode.OK, response); // 200 OK with the list of students
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object>(false, "An error occurred while retrieving students.", errors: new List<string> { ex.Message }, data: null));
            }
        }
    }
}
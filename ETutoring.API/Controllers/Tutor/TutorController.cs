using ETutoring.Business.Dtos.Request.Tutor;
using ETutoring.Business.Interfaces.Tutor;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Net;
using ETutoring.Business.Dtos.Response;

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
            var stopwatch = Stopwatch.StartNew();
            try
            {
                var response = await _tutorService.GetStudentsForTutorAsync(model.TutorId);
                stopwatch.Stop();
                return StatusCode(response.StatusCode, response);
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                return StatusCode(500, new BaseResponse(HttpStatusCode.InternalServerError.GetHashCode(), "An error occurred while retrieving students.", ex.Message, stopwatch.ElapsedMilliseconds));
            }
        }
    }
}
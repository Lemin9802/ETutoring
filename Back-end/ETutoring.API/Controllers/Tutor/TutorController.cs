using ETutoring.Business.Dtos.Request.Tutor;
using ETutoring.Business.Interfaces.Tutor;
using ETutoring.Core.Helpers;
using Microsoft.AspNetCore.Mvc;

namespace ETutoring.API.Controllers.Tutor
{
    [Route("api/tutor")]
    [ApiController]
    public class TutorController : Controller
    {
        private readonly ITutorService _tutorService;

        public TutorController(ITutorService tutorService)
        {
            _tutorService = tutorService;
        }

        [HttpPost("get-students")]
        public async Task<IActionResult> GetStudentsForTutor([FromBody] GetStudentsForTutorRequest request)
        {
            var userId = User.GetUserId();
            request.TutorId = userId;

            var response = await _tutorService.GetStudentsForTutorAsync(request.TutorId, request.Meta, request.Search, request.Filters);

            return Ok(response);
        }


    }
}
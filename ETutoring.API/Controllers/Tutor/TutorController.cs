using ETutoring.Business.Dtos.Request.Tutor;
using ETutoring.Business.Exceptions;
using ETutoring.Business.Interfaces.Tutor;
using ETutoring.Core.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.JsonWebTokens;

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
        public async Task<IActionResult> GetStudentsForTutor([FromBody] GetStudentsForTutorRequest request)
        {
             var response = await _tutorService.GetStudentsForTutorAsync(request.TutorId, request.Meta);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

    }
}
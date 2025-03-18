using ETutoring.Business.Dtos.Request.Tutor;
using ETutoring.Business.Exceptions;
using ETutoring.Business.Interfaces.Tutor;
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
        public async Task<IActionResult> GetStudentsForTutor([FromBody] GetStudentsForTutorRequest model)
        {
            var userId = Guid.Parse(User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value ?? throw new AuthErrorException("Cannot find credentials"));

            var response = await _tutorService.GetStudentsForTutorAsync(userId, model.Page, model.Size);

            return Ok(response);
        }
    }
}
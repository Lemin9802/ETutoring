using ETutoring.Business.Dtos.Students;
using ETutoring.Business.Interfaces.Students;
using ETutoring.Business.Interfaces.Tutor;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
            var students = await _tutorService.GetStudentsForTutorAsync(model.TutorId);

            if (!students.Any())
                return NotFound(new { message = "This tutor does not have any students assigned." });

            return Ok(students);
        }

    }
}

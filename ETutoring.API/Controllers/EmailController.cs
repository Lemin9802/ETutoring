using ETutoring.Business.Interfaces.Services;
using ETutoring.Core.Common;
using Microsoft.AspNetCore.Mvc;

namespace ETutoring.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmailController : ControllerBase
    {
        private readonly IEmailService _emailService;

        public EmailController(IEmailService emailService)
        {
            _emailService = emailService;
        }

        [HttpPost]
        public async Task<ActionResult> TestingEmailSending()
        {
            try
            {
                var students = new Dictionary<string, string>
                {
                    { "hoangt@fpt.edu.vn", "Hoang Nguyen" },
                    { "Testing@gmail.com", "Hai Nguyen" }
                };

                var tutorName = "Hai Nguyen";
                var tutorListLink = "http://localhost:3000/users/tutor";

                var emailTemplate = EmailTemplateRequest.CreateEmailsForStudents(students, "Hai Nguyen", "http://localhost:3000/users/tutor");
                await _emailService.SendManyEmailsAsync(emailTemplate);
                return Ok("Good");
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return BadRequest("Not good");
            }
        }

    }
}

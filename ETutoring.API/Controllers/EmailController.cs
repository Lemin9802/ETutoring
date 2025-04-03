
using ETutoring.Business.Dtos.Email;
using ETutoring.Business.Mappers;
using ETutoring.Core.EmailTemplate;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Channels;

namespace ETutoring.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmailController : ControllerBase
    {
        private readonly Channel<EmailTemplateRequest> _queue;

        public EmailController(Channel<EmailTemplateRequest> queue)
        {
            _queue = queue;
        }

        [HttpPost("test-send-emails")]
        public async Task<ActionResult> TestEmailSending()
        {
            try
            {
                var students = new List<EmailStudentInfo>
                {
                    new EmailStudentInfo(Guid.Parse("4c160a23-5d27-4232-98fe-294ee21b0487"), "hoangt@fpt.edu.vn", "Hoang Nguyen"),
                    new EmailStudentInfo(Guid.Parse("5a2eff68-a7e5-45e1-9f37-2d0560b50bfb"), "Testing@gmail.com", "Hai Nguyen"),
                    new EmailStudentInfo(Guid.Parse("01953d7e-ac6b-7f30-b571-81c5cc6cdaee"), "minhhvntcs21024@fpt.edu.vn", "Ngoc Minh")
                };

                var tutorId = Guid.Parse("d8b523ba-629f-41cd-9d19-7ada0817ad9e");
                var tutorEmail = "hainhgcs220074@gmail.com";
                var tutorName = "Hai Nguyen";
                var tutorListLink = "http://localhost:3000/users/tutor";

                if (students.Count > 10)
                {
                    return BadRequest("A tutor cannot be assigned more than 10 students at a time.");
                }

                var emailRequests = EmailTemplateFactory.CreateTutorStudentEmailAllocation(
                    tutorId, tutorEmail, tutorName, students, tutorListLink
                );

                var writeTasks = new List<Task>();
                foreach (var email in emailRequests)
                {
                    writeTasks.Add(_queue.Writer.WriteAsync(email).AsTask());
                }

                await Task.WhenAll(writeTasks);

                return Ok("Emails queued successfully.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EmailController] Error: {ex.Message}");
                return StatusCode(500, "Failed to queue emails.");
            }
        }
    }
}

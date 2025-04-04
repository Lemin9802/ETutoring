using ETutoring.Business.Dtos.Email;
using ETutoring.Business.Mappers;
using ETutoring.Core.EmailTemplate;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Channels;
using ETutoring.Business.Interfaces;

using ETutoring.Business.Interfaces.Services;
namespace ETutoring.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmailController : ControllerBase
    {
        private readonly Channel<EmailTemplateRequest> _queue;

        private readonly IEmailService _emailService;

        public EmailController(Channel<EmailTemplateRequest> queue, IEmailService emailService)
        {
            _queue = queue;
            _emailService = emailService;
        }

        [HttpPost("test-send-emails")]
        public async Task<ActionResult> TestEmailSending()
        {
            try
            {
                var students = new List<EmailStudentInfo>
                {
                    new (Guid.Parse("4c160a23-5d27-4232-98fe-294ee21b0487"), "hoangt@fpt.edu.vn", "Hoang Nguyen"),
                    new (Guid.Parse("5a2eff68-a7e5-45e1-9f37-2d0560b50bfb"), "Testing@gmail.com", "Hai Nguyen"),
                    new (Guid.Parse("01953d7e-ac6b-7f30-b571-81c5cc6cdaee"), "minhhvntcs21024@fpt.edu.vn", "Ngoc Minh")
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

                return Ok("Emails sent successfully.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error assigning students to tutor: {ex.Message}");
                return BadRequest("Failed to assign students to tutor.");
            }
        }
        [HttpPost("get-mail-by-user-id")]
        public async Task<IActionResult> GetEmailsByPost([FromBody] Guid userId)
        {
            try
            {
                if (userId == Guid.Empty)
                {
                    return BadRequest("Invalid user ID provided.");
                }

                var emails = await _emailService.GetAllEmailsAsync();
                var userEmails = emails.Where(e => e.UserId == userId).Select(e => new
                {
                    e.Id,
                    e.Subject,
                    e.Body,
                    CreatedAt = e.CreatedAt.ToString("dd-MM-yyyy")
                }).ToList();

                return Ok(userEmails);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EmailController] Error: {ex.Message}");
                return StatusCode(500, "Failed to queue emails.");
            }
        }

        [HttpPost("mark-as-read")]
        public async Task<IActionResult> MarkEmailAsRead([FromBody] Guid emailId)
        {
            if (emailId == Guid.Empty)
            {
                return BadRequest("Invalid email ID provided.");
            }

            await _emailService.MarkAsReadAsync(emailId);
            return Ok("Email marked as read successfully.");
        }
    }
}

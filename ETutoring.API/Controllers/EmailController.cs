
using ETutoring.Business.Dtos.Email;
using ETutoring.Business.Interfaces.Services;
using ETutoring.Business.Mappers;
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
                // **1. Retrieve Students (Should Include UserId)**
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

                // **2. Generate All Emails (Tutor + Students)**
                var emailRequests = EmailTemplateFactory.CreateTutorStudentEmailAllocation(
                    tutorId, tutorEmail, tutorName, students, tutorListLink
                );

                // **3. Send Emails & Handle Errors Individually**
                var emailTasks = emailRequests.Select(async email =>
                {
                    await _emailService.SendEmailAsync(email);
                });

                await Task.WhenAll(emailTasks);

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
                Console.WriteLine($"Error retrieving emails for user {userId}: {ex.Message}");
                return StatusCode(500, "Internal Server Error");
            }
        }

    }
}

using ETutoring.Core.EmailTemplate;
using ETutoring.Core.Entities;

namespace ETutoring.Business.Interfaces.Services;

public interface IEmailService : IDisposable
{
    Task SendEmailAsync(EmailTemplateRequest emailRequest);
    Task<List<EmailSent>> GetAllEmailsAsync();
}

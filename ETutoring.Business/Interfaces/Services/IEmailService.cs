using ETutoring.Core.EmailTemplate;

namespace ETutoring.Business.Interfaces.Services;

public interface IEmailService
{
    Task SendEmailAsync(EmailTemplateRequest emailRequest);
}

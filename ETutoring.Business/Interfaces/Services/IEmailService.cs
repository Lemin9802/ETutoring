using ETutoring.Core.Common;

namespace ETutoring.Business.Interfaces.Services;

public interface IEmailService
{
    Task SendEmailAsync(EmailTemplateRequest emailRequest);
    Task SendManyEmailsAsync(List<EmailTemplateRequest> emailRequests);
}

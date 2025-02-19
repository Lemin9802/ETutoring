using ETutoring.Business.Interfaces.Services;
using ETutoring.Core.Common;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;

namespace ETutoring.DataAccess.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendManyEmailsAsync(List<EmailTemplateRequest> emailRequests)
    {
        foreach (var emailRequest in emailRequests)
        {
            await SendEmailAsync(emailRequest);
        }
    }

    public async Task SendEmailAsync(EmailTemplateRequest emailRequest)
    {
        var smtpSettings = _configuration.GetSection("SmtpSettings");

        // Load email template and replace placeholders
        string body = await LoadEmailTemplate(emailRequest.TemplateName, emailRequest.Placeholders);

        var emailMessage = new MimeMessage();
        emailMessage.From.Add(new MailboxAddress(smtpSettings["SenderName"], smtpSettings["SenderEmail"]));
        emailMessage.To.Add(new MailboxAddress(emailRequest.To, emailRequest.To));


        emailMessage.Subject = emailRequest.Subject;
        emailMessage.Body = new TextPart("html") { Text = body };

        using var smtpClient = new SmtpClient();
        try
        {
            await smtpClient.ConnectAsync(
                smtpSettings["Server"],
                int.Parse(smtpSettings["Port"]),
                SecureSocketOptions.StartTls
            );

            await smtpClient.AuthenticateAsync(smtpSettings["SenderEmail"], smtpSettings["Password"]);
            await smtpClient.SendAsync(emailMessage);
        }
        finally
        {
            await smtpClient.DisconnectAsync(true);
        }
    }


    private async Task<string> LoadEmailTemplate(string templateName, Dictionary<string, string> placeholders)
    {
        string templatePath = Path.Combine(Directory.GetCurrentDirectory(), "Templates", $"{templateName}.html");

        if (!File.Exists(templatePath))
            throw new FileNotFoundException($"Email template '{templateName}' not found.");

        string templateContent = await File.ReadAllTextAsync(templatePath);

        // Replace placeholders with actual values
        foreach (var placeholder in placeholders)
        {
            templateContent = templateContent.Replace($"{{{{{placeholder.Key}}}}}", placeholder.Value);
        }

        return templateContent;
    }
}

using ETutoring.Business.Constants;
using ETutoring.Business.Interfaces.Services;
using ETutoring.Core.Common;
using ETutoring.Core.EmailTemplate;
using ETutoring.Core.Entities;
using ETutoring.Core.Settings;
using ETutoring.DataAccess.Data;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using MimeKit;

namespace ETutoring.DataAccess.Services;

public class EmailService : IEmailService
{
    private readonly SmtpSettings _smtpSettings;
    private readonly ApplicationDbContext _context;

    public EmailService(IOptions<SmtpSettings> emailSettings, ApplicationDbContext context)
    {
        _context = context;
        _smtpSettings = emailSettings.Value;
    }

    public async Task SendEmailAsync(EmailTemplateRequest emailRequest)
    {
        // **1. Load email template and replace placeholders**
        string body = await LoadEmailTemplate(emailRequest.TemplateName, emailRequest.Placeholders);

        var emailMessage = new MimeMessage();
        emailMessage.From.Add(new MailboxAddress(_smtpSettings.SenderName, _smtpSettings.SenderEmail));
        emailMessage.To.Add(new MailboxAddress(emailRequest.To, emailRequest.To));

        emailMessage.Subject = emailRequest.Subject;
        emailMessage.Body = new TextPart("html") { Text = body };

        using var smtpClient = new SmtpClient();
        try
        {
            // **2. Send Email via SMTP**
            await smtpClient.ConnectAsync(
                _smtpSettings.Server,
                _smtpSettings.Port,
                SecureSocketOptions.StartTls
            );

            await smtpClient.AuthenticateAsync(_smtpSettings.SenderEmail, _smtpSettings.Password);
            await smtpClient.SendAsync(emailMessage);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error sending email to {emailRequest.To}: {ex.Message}");
            throw;
        }
        finally
        {
            await smtpClient.DisconnectAsync(true);
        }

        // **3. Save Email to Database (Only if Sent Successfully)**
        var emailNotification = new EmailSent()
        {
            UserId = emailRequest.UserId,
            Subject = emailRequest.Subject,
            Body = body,
            EmailType = emailRequest.TemplateName.ToString(),
            Status = 0,
            CreatedAt = DateTime.UtcNow
        };

        _context.EmailSent.Add(emailNotification);
        await _context.SaveChangesAsync();

        // **4. Trigger In-App Notification (SignalR, Event, or Background Job)**
        //await _mediator.Publish(new EmailStoredEvent(emailRequest.UserId, emailRequest.Subject));
    }

    private async Task<string> LoadEmailTemplate(EmailTemplateType templateType, Dictionary<string, string> placeholders)
    {
        if (!Email.EmailTemplateMap.TryGetValue(templateType, out var templateFileName))
        {
            throw new ArgumentException($"Email template type {templateType} not found.");
        }

        var templatePath = Path.Combine(Directory.GetCurrentDirectory(), "Templates", templateFileName ?? throw new ApplicationException("Missing Template"));

        if (!File.Exists(templatePath))
            throw new FileNotFoundException($"Email template '{templateFileName}' not found.");

        var templateContent = await File.ReadAllTextAsync(templatePath);

        // Replace placeholders dynamically
        return placeholders.Aggregate(templateContent, (current, placeholder) => current.Replace($"{{{{{placeholder.Key}}}}}", placeholder.Value));
    }
    public async Task<List<EmailSent>> GetAllEmailsAsync()
    {
        return await _context.EmailSent
            .OrderByDescending(e => e.CreatedAt) // Sort by newest sent date
            .ToListAsync();
    }
}

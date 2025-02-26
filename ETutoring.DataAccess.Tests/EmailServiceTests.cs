using System;
using System.Collections.Generic;
using System.Net.Mail;
using System.Threading.Tasks;
using ETutoring.Core.Common;
using ETutoring.Core.EmailTemplate;
using ETutoring.Core.Entities;
using ETutoring.Core.Settings;
using ETutoring.DataAccess.Data;
using ETutoring.DataAccess.Services;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;
using SmtpClient = MailKit.Net.Smtp.SmtpClient;

public class EmailServiceTests
{
	private readonly Mock<ApplicationDbContext> _mockDbContext;
	private readonly Mock<DbSet<EmailSent>> _mockEmailSentDbSet;
	private readonly Mock<IOptions<SmtpSettings>> _mockSmtpSettings;
	private readonly Mock<SmtpClient> _mockSmtpClient;
	private readonly SmtpSettings _smtpSettings;
	private readonly EmailService _emailService;

	public EmailServiceTests()
	{
		// Mock DbContext & DbSet
		_mockDbContext = new Mock<ApplicationDbContext>();
		_mockEmailSentDbSet = new Mock<DbSet<EmailSent>>();
		_mockDbContext.Setup(db => db.Set<EmailSent>()).Returns(_mockEmailSentDbSet.Object);

		// Mock SMTP Settings
		_smtpSettings = new SmtpSettings
		{
			Server = "smtp.example.com",
			Port = 587,
			SenderEmail = "noreply@example.com",
			SenderName = "Test Email Service",
			Password = "testpassword"
		};

		_mockSmtpSettings = new Mock<IOptions<SmtpSettings>>();
		_mockSmtpSettings.Setup(s => s.Value).Returns(_smtpSettings);

		// Mock SMTP Client
		_mockSmtpClient = new Mock<SmtpClient>();

		_emailService = new EmailService(_mockSmtpSettings.Object, _mockDbContext.Object);
	}

	/// <summary>
	/// Test gửi email thành công
	/// </summary>
	[Fact]
	public async Task SendEmailAsync_ShouldSendEmailSuccessfully()
	{
		var emailRequest = new EmailTemplateRequest(
			userId: Guid.NewGuid(),
			to: "testuser@example.com",
			subject: "Test Email",
			templateName: EmailTemplateType.StudentReceiveNewTutor,
			placeholders: new Dictionary<string, string> { { "UserName", "John" } }
		);

		await _emailService.SendEmailAsync(emailRequest);

		// Kiểm tra email được lưu vào database
		_mockEmailSentDbSet.Verify(db => db.Add(It.IsAny<EmailSent>()), Times.Once);
		_mockDbContext.Verify(db => db.SaveChangesAsync(default), Times.Once);
	}

	/// <summary>
	/// Test khi gửi email thất bại do lỗi SMTP
	/// </summary>
	[Fact]
	public async Task SendEmailAsync_ShouldThrowException_WhenSmtpFails()
	{
		var emailRequest = new EmailTemplateRequest(
			userId: Guid.NewGuid(),
			to: "testuser@example.com",
			subject: "Test Email",
			templateName: EmailTemplateType.StudentReceiveNewTutor,
			placeholders: new Dictionary<string, string> { { "UserName", "John" } }
		);

		// Giả lập SMTP lỗi
		_mockSmtpClient
			.Setup(s => s.ConnectAsync(It.IsAny<string>(), It.IsAny<int>(), It.IsAny<SecureSocketOptions>(), default))
			.ThrowsAsync(new Exception("SMTP error"));

		await Assert.ThrowsAsync<Exception>(() => _emailService.SendEmailAsync(emailRequest));
	}
}

using Xunit;
using Moq;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ETutoring.API.Controllers;
using ETutoring.Business.Interfaces.Services;
using ETutoring.Business.Dtos.Email;
using ETutoring.Business.Mappers;
using ETutoring.Core.EmailTemplate;
namespace ETutoring.API.Tests
{
	public class EmailControllerTests
	{
		private readonly Mock<IEmailService> _emailServiceMock;
		private readonly EmailController _controller;

		public EmailControllerTests()
		{
			_emailServiceMock = new Mock<IEmailService>();
			_controller = new EmailController(_emailServiceMock.Object);
		}

		[Fact]
		public async Task TestingEmailSending_ShouldReturnOk_WhenEmailsAreSentSuccessfully()
		{
			// Arrange
			var students = new List<EmailStudentInfo>
	{
		new EmailStudentInfo(Guid.NewGuid(), "hoangt@fpt.edu.vn", "Hoang Nguyen"),
		new EmailStudentInfo(Guid.NewGuid(), "Testing@gmail.com", "Hai Nguyen")
	};

			var emailRequests = new List<EmailTemplateRequest>(); // Sửa kiểu dữ liệu

			_emailServiceMock
				.Setup(s => s.SendEmailAsync(It.IsAny<EmailTemplateRequest>())) // Sửa kiểu dữ liệu
				.Returns(Task.CompletedTask);

			// Act
			var result = await _controller.TestingEmailSending();

			// Assert
			var okResult = Assert.IsType<OkObjectResult>(result);
			Assert.Equal("Emails sent successfully.", okResult.Value);
		}

		[Fact]
		public async Task TestingEmailSending_ShouldReturnBadRequest_WhenExceptionIsThrown()
		{
			// Arrange
			_emailServiceMock
				.Setup(s => s.SendEmailAsync(It.IsAny<EmailTemplateRequest>())) // Sửa kiểu dữ liệu
				.ThrowsAsync(new Exception("Test Exception"));

			// Act
			var result = await _controller.TestingEmailSending();

			// Assert
			var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
			Assert.Equal("Failed to assign students to tutor.", badRequestResult.Value);
		}

	}
}

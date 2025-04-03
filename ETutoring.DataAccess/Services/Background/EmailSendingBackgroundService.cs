using ETutoring.Business.Interfaces.Services;
using ETutoring.Core.EmailTemplate;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System.Threading.Channels;

namespace ETutoring.DataAccess.Services.Background;

public class EmailSendingBackgroundService : BackgroundService
{
    private readonly Channel<EmailTemplateRequest> _queue;
    private readonly IServiceProvider _serviceProvider;

    public EmailSendingBackgroundService(Channel<EmailTemplateRequest> queue, IServiceProvider serviceProvider)
    {
        _queue = queue;
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var emailSender = scope.ServiceProvider.GetRequiredService<IEmailService>();

        await foreach (var email in _queue.Reader.ReadAllAsync(stoppingToken))
        {
            try
            {
                await emailSender.SendEmailAsync(email);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Log: {ex.Message}");

            }
        }

    }
}
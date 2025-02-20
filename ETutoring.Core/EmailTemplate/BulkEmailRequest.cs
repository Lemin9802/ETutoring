namespace ETutoring.Core.EmailTemplate;

public class BulkEmailRequest
{
    public List<EmailTemplateRequest> EmailRequests { get; set; } = new();
}
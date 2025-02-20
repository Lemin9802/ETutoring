using ETutoring.Core.Common;

namespace ETutoring.Core.EmailTemplate;

public record EmailTemplateRequest
{
    public Guid UserId { get; }
    public string To { get; }
    public string Subject { get; }
    public EmailTemplateType TemplateName { get; }
    public Dictionary<string, string> Placeholders { get; }

    public EmailTemplateRequest(Guid userId, string to, string subject, EmailTemplateType templateName, Dictionary<string, string> placeholders)
    {
        UserId = userId;
        To = to;
        Subject = subject;
        TemplateName = templateName;
        Placeholders = placeholders;
    }
}
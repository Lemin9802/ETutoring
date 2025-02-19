namespace ETutoring.Core.Common;

public record EmailTemplateRequest
{
    public string To { get; }
    public string Subject { get; }
    public string TemplateName { get; }
    public Dictionary<string, string> Placeholders { get; }

    public EmailTemplateRequest(string to, string subject, string templateName, Dictionary<string, string> placeholders)
    {
        To = to;
        Subject = subject;
        TemplateName = templateName;
        Placeholders = placeholders;
    }

    public static List<EmailTemplateRequest> CreateEmailsForStudents(Dictionary<string, string> studentEmails, string tutorName, string tutorLink)
    {
        var emailRequests = new List<EmailTemplateRequest>();

        foreach (var student in studentEmails)
        {
            var placeholders = new Dictionary<string, string>
            {
                { "StudentName", student.Value }, // Student Name
                { "TutorName", tutorName },
                { "TutorLink", tutorLink }
            };

            emailRequests.Add(new EmailTemplateRequest(
                student.Key, // Each student gets an individual email
                "New Tutor Assigned",
                "new-student-assigned",
                placeholders
            ));
        }

        return emailRequests;
    }

}

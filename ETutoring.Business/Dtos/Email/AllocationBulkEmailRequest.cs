namespace ETutoring.Business.Dtos.Email;

public record AllocationBulkEmailRequest
{
    public Dictionary<string, string> StudentEmails { get; set; } // Updated to match StudentName with Email

    public string TutorName { get; set; }

    public string TutorLink { get; set; }

    public AllocationBulkEmailRequest(string tutorName, string tutorLink, Dictionary<string, string> studentEmails)
    {
        TutorName = tutorName;
        TutorLink = tutorLink;
        StudentEmails = studentEmails;
    }
}
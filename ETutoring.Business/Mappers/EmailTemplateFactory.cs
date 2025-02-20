using ETutoring.Business.Dtos.Email;
using ETutoring.Core.Common;
using ETutoring.Core.EmailTemplate;

namespace ETutoring.Business.Mappers;

public static class EmailTemplateFactory
{
    public static List<EmailTemplateRequest> CreateTutorStudentEmailAllocation(
        Guid tutorId,
        string tutorEmail,
        string tutorName,
        List<EmailStudentInfo> students,
        string tutorListLink)
    {
        var emailRequests = new List<EmailTemplateRequest>();

        // **1. Create Tutor Email**
        var tutorPlaceholders = new Dictionary<string, string>
        {
            { "TutorName", tutorName },
            { "StudentCount", students.Count.ToString() },
            { "StudentList", string.Join("", students.Select(s => $"<li><strong>{s.Name}</strong></li>")) },
            { "StudentListLink", tutorListLink }
        };

        emailRequests.Add(new EmailTemplateRequest(
            tutorId,
            tutorEmail,
            "New Student Assigned",
            EmailTemplateType.TutorAssignedToStudent,
            tutorPlaceholders));

        // **2. Create Student Emails**
        foreach (var student in students)
        {
            var studentPlaceholders = new Dictionary<string, string>
            {
                { "TutorName", tutorName },
                { "TutorLink", tutorListLink },
                { "studentName", student.Name }
            };

            emailRequests.Add(new EmailTemplateRequest(
                student.UserId,
                student.Email,
                "Tutor Assigned to You",
                EmailTemplateType.StudentReceiveNewTutor,
                studentPlaceholders));
        }

        return emailRequests;
    }
}
using ETutoring.Core.Common;

namespace ETutoring.Business.Constants;

public static class Email
{
    public static readonly Dictionary<EmailTemplateType, string> EmailTemplateMap = new()
    {
        { EmailTemplateType.StudentReceiveNewTutor, "student-receive-new-tutor.html" },
        { EmailTemplateType.TutorAssignedToStudent, "tutor-receive-new-student.html" },
        { EmailTemplateType.DocumentCommentForStudent, "document-comment-student.html" }, 
        { EmailTemplateType.DocumentCommentForTutor, "document-comment-tutor.html" }
    };
}
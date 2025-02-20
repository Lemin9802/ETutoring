using ETutoring.Core.Common;
using ETutoring.Core.Enums;

namespace ETutoring.Core.Entities;

public class EmailSent : BaseEntity
{
    public Guid UserId { get; set; } // Linked to the User who received this email

    public string Subject { get; set; }

    public string Body { get; set; } // HTML

    public string EmailType { get; set; } // E.g., "TutorAssignedToStudent"

    public SendStatus Status { get; set; } = 0; // Sent, Read

    public ApplicationUser User { get; set; }
}
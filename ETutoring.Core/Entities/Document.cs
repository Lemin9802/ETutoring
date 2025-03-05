using ETutoring.Core.Common;
using ETutoring.Core.Enums;

namespace ETutoring.Core.Entities;

public class Document : BaseEntity
{
    public Guid UploaderId { get; set; }

    public Guid TutorId { get; set; }

    public string FileUrl { get; set; } = string.Empty;

    public string FileName { get; set; } = string.Empty;

    public string? Description { get; set; }

    public DocumentStatus Status { get; set; } = DocumentStatus.PendingReview;

    // Navigation properties
    public ApplicationUser Uploader { get; set; }
    public ApplicationUser Tutor { get; set; }
    public ICollection<DocumentComment> Comments { get; set; } = new List<DocumentComment>();
}
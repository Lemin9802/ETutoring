using ETutoring.Core.Common;

namespace ETutoring.Core.Entities;

public class DocumentComment : BaseEntity
{
    public Guid DocumentId { get; set; }

    public Guid CommenterId { get; set; }

    public string Content { get; set; } = string.Empty;

    public Guid? ParentCommentId { get; set; }

    // Navigation properties
    public Document Document { get; set; }
    public ApplicationUser Commenter { get; set; }
    public DocumentComment? ParentComment { get; set; }
    public ICollection<DocumentComment> Replies { get; set; } = new List<DocumentComment>();
}
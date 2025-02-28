namespace ETutoring.Business.Dtos.Documents;

public class CreateDocumentCommentRequest
{
    public Guid DocumentId { get; set; }
    public Guid CommenterId { get; set; }
    public string Content { get; set; } = string.Empty;
    public Guid? ParentCommentId { get; set; }
}

public class UpdateDocumentCommentRequest
{
    public string Content { get; set; } = string.Empty;
}

public class DocumentCommentResponse
{
    public Guid Id { get; set; }
    public Guid DocumentId { get; set; }
    public Guid CommenterId { get; set; }
    public string Content { get; set; } = string.Empty;
    public Guid? ParentCommentId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string CommenterName { get; set; } = string.Empty;
    public List<DocumentCommentResponse> Replies { get; set; } = new();
} 
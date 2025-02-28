namespace ETutoring.Business.Dtos.Documents;

public class DocumentResponse
{
    public Guid Id { get; set; }
    public Guid UploaderId { get; set; }
    public Guid TutorId { get; set; }
    public string FileUrl { get; set; }
    public string FileName { get; set; }
    public string? Description { get; set; }
    public DateTime UploadedAt { get; set; }
} 
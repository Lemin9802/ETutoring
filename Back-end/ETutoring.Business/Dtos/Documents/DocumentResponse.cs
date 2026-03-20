using ETutoring.Core.Enums;

namespace ETutoring.Business.Dtos.Documents;

public record DocumentResponse
{
    public Guid Id { get; set; }
    public Guid UploaderId { get; set; }
    public string RecipientName { get; set; }
    public string FileUrl { get; set; }
    public string Title { get; set; }
    public string? Description { get; set; }
    public DocumentStatus Status { get; init; }
    public DateTime UpdatedAt { get; init; }
}
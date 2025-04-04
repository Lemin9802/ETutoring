using ETutoring.Core.Enums;

namespace ETutoring.Business.Dtos.Documents
{
    public class DocumentDetailResponse
    {
        public Guid Id { get; set; }
        public string? FileUrl { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public DocumentStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Thông tin của người upload
        public Guid UploaderId { get; set; }
        public string? UploaderName { get; set; }
        public string? UploaderEmail { get; set; }

        // Thông tin của tutor
        public Guid TutorId { get; set; }
        public string? TutorName { get; set; }
        public string? TutorEmail { get; set; }
    }
}
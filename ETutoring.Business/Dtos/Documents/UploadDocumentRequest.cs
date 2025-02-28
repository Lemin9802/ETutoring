using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace ETutoring.Business.Dtos.Documents;

public class UploadDocumentRequest
{
    [Required]
    public Guid UploaderId { get; set; }

    [Required]
    public Guid TutorId { get; set; }

    [Required]
    public IFormFile File { get; set; }

    public string? Description { get; set; }
} 
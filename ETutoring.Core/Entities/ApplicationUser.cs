using Microsoft.AspNetCore.Identity;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace ETutoring.Core.Entities;

public class ApplicationUser : IdentityUser<Guid>
{
    //RefreshToken
    public List<RefreshToken> RefreshTokens { get; private set; } = new();

    public string? ProfilePicture { get; set; }

    [Required, StringLength(100, MinimumLength = 3)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    public DateTime DateOfBirth { get; set; }

    [Required, StringLength(10)]
    public string Gender { get; set; } = string.Empty;

    [Required, StringLength(255)]
    public string Address { get; set; } = string.Empty;

    [Required, StringLength(20)]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required, StringLength(50)]
    public string Nationality { get; set; } = string.Empty;

    [Required, StringLength(20)]
    public string IdentificationNumber { get; set; } = string.Empty;

    [Required, DefaultValue(false)]
    public bool IsEmailConfirmed { get; set; } = false;

    [Required, DefaultValue(false)]
    public bool IsPhoneConfirmed { get; set; } = false;

    [Required, DefaultValue(true)]
    public bool IsActive { get; set; } = true;

    public DateTime? LastLoginTime { get; set; }

    public ICollection<EmailSent> EmailNotifications { get; set; } = new List<EmailSent>();

    // Add these new navigation properties
    public ICollection<Document> UploadedDocuments { get; set; } = new List<Document>();
    public ICollection<Document> ReceivedDocuments { get; set; } = new List<Document>();
}
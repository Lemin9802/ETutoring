using ETutoring.Core.Common;
using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel;

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

    [StringLength(100)]
    public string? Major { get; set; }

    public DateTime? EnrollmentDate { get; set; }

    [Range(0, 50)]
    public int? ExperienceYears { get; set; }

    [Range(0, 1000)]
    public decimal? HourlyRate { get; set; }

    [StringLength(100)]
    public string? Position { get; set; }

    [StringLength(100)]
    public string? Department { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? Salary { get; set; }

    [Required, DefaultValue(true)]
    public bool IsActive { get; set; } = true;

    public DateTime? LastLoginTime { get; set; }

    [Required, StringLength(50)]
    public string CreatedBy { get; set; } = string.Empty;

    [StringLength(50)]
    public string? UpdatedBy { get; set; }
}
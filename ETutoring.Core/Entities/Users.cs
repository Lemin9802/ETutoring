using ETutoring.Core.Common;

namespace ETutoring.Core.Entities
{
    internal class Users : BaseEntity
    {

        public string FullName { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public string Gender { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;

        public string Role { get; set; } = string.Empty;

        public string? Major { get; set; }
        public DateTime? EnrollmentDate { get; set; }

        public int? ExperienceYears { get; set; }
        public decimal? HourlyRate { get; set; }

        public string? Position { get; set; }
        public string? Department { get; set; }
        public decimal? Salary { get; set; }
    }
}

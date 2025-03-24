using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ETutoring.Core.Entities
{
    public class StudentTutorManagement
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [Column("student_id")]
        public Guid StudentId { get; set; }

        [Required]
        [Column("tutor_id")]
        public Guid TutorId { get; set; }

        [Required]
        [Column("assigned_by")]
        public Guid AssignedBy { get; set; }

        [Required]
        [Column("assigned_at")]
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

        [Column("action")]
        public string? Action { get; set; }

        public ICollection<StudentTutorManagementHistory> Histories { get; set; }

    }
}
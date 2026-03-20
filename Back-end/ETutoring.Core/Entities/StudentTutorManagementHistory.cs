using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETutoring.Core.Entities
{
    public class StudentTutorManagementHistory
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [Column("student_tutor_management_id")]
        public Guid StudentTutorManagementId { get; set; }

        // Navigation property to the principal
        public StudentTutorManagement StudentTutorManagement { get; set; }

        [Required]
        public Guid StudentId { get; set; }

        [Required]
        public Guid TutorId { get; set; }

        [Required]
        public Guid AssignedBy { get; set; } // Người thực hiện

        [Required]
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

        public string? Action { get; set; } // "Assigned", "Reassigned", "Removed"
    }

}

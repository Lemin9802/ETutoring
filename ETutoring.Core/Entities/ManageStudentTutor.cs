using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETutoring.Core.Entities
{
    public class ManageStudentTutor
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid StudentId { get; set; }

        [Required]
        public Guid TutorId { get; set; }

        [Required]
        public Guid AssignedBy { get; set; } // The moderator/admin who assigned the tutor

        [Required]
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

        public DateTime? EndDate { get; set; }

        [ForeignKey(nameof(StudentId))]
        public ApplicationUser Student { get; set; } = null!;

        [ForeignKey(nameof(TutorId))]
        public ApplicationUser Tutor { get; set; } = null!;
        
    }
}

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETutoring.Core.Entities
{
    public class StudentTutorManagement
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid StudentId { get; set; }

        [Required]
        public Guid TutorId { get; set; }

        [Required]
        public Guid AssignedBy { get; set; } // Người thực hiện

        [Required]
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

        public string? Action { get; set; }

        public ICollection<StudentTutorManagementHistory> History { get; set; } = new List<StudentTutorManagementHistory>();
    }
}

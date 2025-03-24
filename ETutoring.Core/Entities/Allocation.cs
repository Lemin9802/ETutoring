using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETutoring.Core.Entities
{
    public class Allocation
    {
        [Required]
        public Guid StudentId { get; set; }
        public ApplicationUser Student { get; set; }

        [Required]
        public Guid TutorId { get; set; }
        public ApplicationUser Tutor { get; set; }

        [Required]
        public Guid AssignedBy { get; set; }
        public ApplicationUser AssignedUser { get; set; }

        [Required]
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    }
}

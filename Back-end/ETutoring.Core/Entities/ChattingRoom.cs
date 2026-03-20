using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETutoring.Core.Entities
{
    public class ChattingRoom
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid StudentId { get; set; }

        [Required]
        public Guid TutorId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETutoring.Business.Dtos.Request.Moderator
{
    public class RemoveAllocation
    {
        [Required]
        public Guid StudentId { get; set; }

        [Required]
        public Guid TutorId { get; set; }
    }
}

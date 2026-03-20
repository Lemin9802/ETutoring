using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETutoring.Business.Dtos.Request.Moderator
{
    public class RemoveTutorMultipleStudentsRequest
    {
        [Required]
        public List<Guid> StudentIds { get; set; } = new List<Guid>();

        [Required]
        public Guid TutorId { get; set; }
    }
}

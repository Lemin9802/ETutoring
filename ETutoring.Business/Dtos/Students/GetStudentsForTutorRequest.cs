using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETutoring.Business.Dtos.Students
{
    public class GetStudentsForTutorRequest
    {
        [Required]
        public Guid TutorId { get; set; }
    }
}

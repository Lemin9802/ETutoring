using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETutoring.Business.Dtos.Request.Tutor
{
    public class GetStudentsForTutorRequest : BaseRequest
    {
        [Required]
        public Guid TutorId { get; set; }
    }
}

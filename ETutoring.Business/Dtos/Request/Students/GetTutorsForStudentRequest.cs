using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETutoring.Business.Dtos.Request.Students
{
    public class GetTutorsForStudentRequest : BaseRequest
    {
        [Required]
        public Guid StudentId { get; set; }
    }
}

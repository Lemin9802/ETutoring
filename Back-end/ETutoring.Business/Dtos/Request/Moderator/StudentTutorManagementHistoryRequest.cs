using ETutoring.Business.Dtos.Request;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETutoring.Business.Dtos.Students
{
    public class StudentTutorManagementHistoryRequest
    {
        [Required]
        public Guid StudentTutorManagementId { get; set; }
    }
}

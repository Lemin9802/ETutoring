using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETutoring.Business.Dtos.Response.Students
{
    public class StudentTutorStatusResponse : BaseResponse
    {
        public Guid StudentId { get; set; }
        public string StudentName { get; set; }
        public bool HasTutor { get; set; }
    }

}

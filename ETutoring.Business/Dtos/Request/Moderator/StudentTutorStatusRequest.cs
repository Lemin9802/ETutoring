using ETutoring.Business.Dtos.Request;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETutoring.Business.Dtos.Students
{
    public class StudentTutorStatusRequest : BaseRequest
    {
        public bool? HasTutor { get; set; }
    }
}

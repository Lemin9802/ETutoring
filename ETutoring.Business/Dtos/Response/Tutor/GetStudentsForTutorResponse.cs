using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETutoring.Business.Dtos.Response.Tutor
{
    public class GetTutorsForStudentResponse : BaseResponse
    {
        public Guid TutorId { get; set; }
        public string TutorName { get; set; }
        public DateTime AssignedAt { get; set; }
    }

}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETutoring.Business.Dtos.Response.Moderator
{
    // Response sau khi assign tutor cho student
    public class StudentTutorResponse
    {
        public Guid StudentId { get; set; }
        public string StudentName { get; set; }
        public Guid TutorId { get; set; }
        public string TutorName { get; set; }
        public DateTime AssignedAt { get; set; }
        public Guid AssignedBy { get; set; }
    }

}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETutoring.Business.Dtos.Students
{
    public class AssignTutorStudentResponse
    {
        public Guid StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public Guid? TutorId { get; set; }
        public string? TutorName { get; set; } // Nullable to indicate no tutor
        public DateTime? AssignedAt { get; set; }

        public AssignTutorStudentResponse() { }
    }

}

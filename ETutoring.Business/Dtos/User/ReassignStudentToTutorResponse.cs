using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETutoring.Business.Dtos.User
{
    internal class ReassignStudentToTutorResponse
    {
        public ReassignStudentToTutorResponse() { }
        public Guid StudentId { get; set; }
        public string StudentsName { get; set; }
        public Guid? TutorId { get; set; }
        public string? TutorName { get; set; }
        public DateTime? AssignedAt { get; set; }
    }
}

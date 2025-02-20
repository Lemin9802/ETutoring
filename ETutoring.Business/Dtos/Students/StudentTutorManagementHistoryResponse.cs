using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETutoring.Business.Dtos.Students
{
    public class StudentTutorManagementHistoryResponse
    {
        public Guid StudentTutorManagementId { get; set; }
        public Guid StudentId { get; set; }
        public string StudentName { get; set; }
        public Guid TutorId { get; set; }
        public string TutorName { get; set; }
        public Guid AssignedBy { get; set; }
        public string AssignedByName { get; set; }
        public DateTime AssignedAt { get; set; }
        public string? Action { get; set; } // "Assigned", "Reassigned"
    }
}

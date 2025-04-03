using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETutoring.Business.Dtos.Response.Moderator
{
    public class ChatRoomDto
    {
        public Guid Id { get; set; }
        public Guid MessageId { get; set; }
        public Guid StudentId { get; set; }
        public string? StudentName { get; set; }
        public string? StudentEmail { get; set; }
        public Guid TutorId { get; set; }
        public string? TutorName { get; set; }
        public string? TutorEmail { get; set; }
        public DateTime CreatedAt { get; set; }
        public int NumberOfMessages { get; set; }
        public DateTime? LastActivity { get; set; }
        public int NumberOfReports { get; set; }
    }
}



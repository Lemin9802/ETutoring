using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETutoring.Business.Dtos.Response.Message
{
    public class ChatRoomResponse
    {
        public Guid RoomId { get; set; }
        public Guid StudentId { get; set; }
        public string StudentEmail { get; set; } = String.Empty;
        public string StudentName { get; set; } = String.Empty;
        public Guid TutorId { get; set; }
        public string TutorEmail { get; set; } = String.Empty;
        public string TutorName { get; set; } = String.Empty;
        public DateTime CreatedAt { get; set; }
    }

}

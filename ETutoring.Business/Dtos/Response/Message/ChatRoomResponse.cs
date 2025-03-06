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
        public string StudentId { get; set; }
        public string TutorId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}

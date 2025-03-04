using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETutoring.Business.Dtos.Response.Message
{
    public class ConversationResponse
    {
        public Guid ConversationId { get; set; }  // Đảm bảo sử dụng MessageId làm ConversationId
        public Guid ParticipantId { get; set; }   // ID người tham gia
        public string FullName { get; set; }
        public string ProfilePicture { get; set; }
        public string LastMessage { get; set; }
        public DateTime LastMessageTime { get; set; }
        public Guid SenderId { get; set; }    // Thêm SenderId
        public Guid ReceiverId { get; set; }  // Thêm ReceiverId
    }

}

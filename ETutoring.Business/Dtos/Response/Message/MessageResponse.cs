using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETutoring.Business.Dtos.Response.Message
{
    public class MessageListResponse
    {
        public int TotalMessages { get; set; }
        public List<MessageResponse> Messages { get; set; }
    }

    public class MessageResponse
    {
        public Guid Id { get; set; }
        public string SenderId { get; set; }
        public string ReceiverId { get; set; }
        public string Content { get; set; }
        public DateTime Timestamp { get; set; }

        public string? SenderFullName { get; set; }
        public string? SenderEmail { get; set; }
        public string? ReceiverFullName { get; set; }
        public string? ReceiverEmail { get; set; }
    }
}

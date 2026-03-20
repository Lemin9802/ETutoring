using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETutoring.Business.Dtos.Request.Message
{
    public class SendMessageRequest
    {
        public Guid SenderId { get; set; }
        public Guid ReceiverId { get; set; }
        public string Content { get; set; }

        public Guid ChatroomId { get; set; }
    }
}

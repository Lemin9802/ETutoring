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
        public string SenderId { get; set; }
        public string ReceiverId { get; set; }
        public string Content { get; set; }
    }
}

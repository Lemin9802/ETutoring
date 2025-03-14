using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETutoring.Business.Dtos.Response.Message
{

    public class UpdateAssignChatroomResponse
    {
        public Guid RoomId { get; set; }
        public bool Success { get; set; }
        public string Message { get; set; }
    }
}

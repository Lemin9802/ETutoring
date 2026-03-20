using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETutoring.Business.Dtos.Request.Message
{
    public class UpdateAssignChatroomRequest
    {
        public Guid RoomId { get; set; }
        public Guid NewTutorId { get; set; }
        public Guid NewStudentId { get; set; }
    }
}

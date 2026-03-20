using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETutoring.Business.Dtos.Request.Moderator
{
    public class AssignChatroomRequest
    {
        public Guid StudentId { get; set; }
        public Guid TutorId { get; set; }
    }
}

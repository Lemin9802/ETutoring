using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETutoring.Business.Dtos.Request.Moderator
{
    public class AssignTutorRequest
    {
        public List<Guid> StudentIds { get; set; }
        public Guid TutorId { get; set; }
        public Guid AssignedBy { get; set; }
    }

}

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETutoring.Business.Dtos.Request.Message
{
    public class GetMessagesRequest
    {
        [Required]
        public Guid UserId { get; set; }

        [Required]
        public Guid ParticipantId { get; set; }

        public Guid? ChatroomId { get; set; }
    }
}

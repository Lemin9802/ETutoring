using ETutoring.Business.Dtos.Request;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ETutoring.Business.Dtos.Students
{
    public class AssignTutorMultipleStudentsRequest
    {
        [Required]
        public List<Guid> StudentIds { get; set; } = new List<Guid>();

        [Required]
        public Guid TutorId { get; set; }

        [Required]
        public Guid AssignedBy { get; set; }
    }
}

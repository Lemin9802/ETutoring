using System;
using System.Collections.Generic;

namespace ETutoring.Business.Dtos.Response.Students
{
    public class StudentWithoutInteractionResponse
    {
        public string Id { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public DateTime? LastInteractionTime { get; set; } // Nullable if no interaction ever
    }
}

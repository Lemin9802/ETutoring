using System;

namespace ETutoring.Business.Dtos.Response.Students
{
    public class UnassignedStudentResponse
    {
        public Guid Id { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
    }
}

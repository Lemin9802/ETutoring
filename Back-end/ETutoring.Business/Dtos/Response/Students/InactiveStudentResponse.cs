using System;

namespace ETutoring.Business.Dtos.Response.Students
{
    public class InactiveStudentResponse
    {
        public Guid Id { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public DateTime? LastLoginTime { get; set; }
        public int DaysInactive { get; set; }
    }
}
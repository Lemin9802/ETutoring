namespace ETutoring.Business.Dtos.Response.Students
{
    public class GetTutorForStudentResponse
    {
        public Guid TutorId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }
}


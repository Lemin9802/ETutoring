namespace ETutoring.Business.Dtos.Response.Tutor
{
    public class GetStudentsForTutorResponse
    {
        public Guid StudentId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string? Email { get; set; } = string.Empty;
    }

}

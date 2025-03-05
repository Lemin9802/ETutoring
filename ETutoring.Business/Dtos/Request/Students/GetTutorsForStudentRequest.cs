namespace ETutoring.Business.Dtos.Request.Students
{
    public class GetTutorsForStudentRequest
    {
        public Guid StudentId { get; set; }

        public int PageNumber { get; init; }

        public int PageSize { get; init; }
    }
}

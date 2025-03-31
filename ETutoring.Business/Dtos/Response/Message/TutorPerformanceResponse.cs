using System;

namespace ETutoring.Business.Dtos.Response.Message
{
    public class TutorPerformanceResponse
    {
        public Guid TutorId { get; set; }
        public string TutorName { get; set; }
        public int MessageCount { get; set; }
    }

    public class AverageMessagesResponse
    {
        public double AverageMessages { get; set; }
        public List<TutorPerformanceResponse> TutorPerformances { get; set; }
    }
}
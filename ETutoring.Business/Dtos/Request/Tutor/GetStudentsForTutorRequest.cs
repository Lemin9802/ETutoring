using ETutoring.Core.Common;

namespace ETutoring.Business.Dtos.Request.Tutor
{
    public class GetStudentsForTutorRequest
    {
        public Guid TutorId { get; set; }
        public MetaDataResponse Meta { get; set; }
    }
}

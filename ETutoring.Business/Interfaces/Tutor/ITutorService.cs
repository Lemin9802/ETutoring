using ETutoring.Business.Dtos.Request.Tutor;
using ETutoring.Business.Dtos.Response.Tutor;
using ETutoring.Core.Common;

namespace ETutoring.Business.Interfaces.Tutor
{
    public interface ITutorService
    {
        Task<ApiResponse<List<GetStudentsForTutorResponse>>> GetStudentsForTutorAsync(Guid tutorId, MetaDataResponse meta, string search, Filter? filter);
    }
}

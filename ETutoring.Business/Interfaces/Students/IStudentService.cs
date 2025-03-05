using ETutoring.Business.Dtos.Response.Moderator;
using ETutoring.Core.Common;

namespace ETutoring.Business.Interfaces.Students
{
    public interface IStudentService
    {
        Task<ApiResponse<IEnumerable<StudentTutorResponse>>> GetTutorsForStudentAsync(Guid studentId);
    }
}

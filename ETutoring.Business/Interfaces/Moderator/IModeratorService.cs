using ETutoring.Business.Dtos.Request;
using ETutoring.Business.Dtos.Request.Moderator;
using ETutoring.Business.Dtos.Response;
using ETutoring.Business.Dtos.Students;

namespace ETutoring.Business.Interfaces.Moderator
{
    public interface IModeratorService
    {
        Task<BaseResponse> GetAllStudentsAsync(StudentTutorStatusRequest request);
        Task<BaseResponse> GetAllTutorsAsync(BaseRequest request);
        Task<BaseResponse> GetAllTutorsStudentsAsync(BaseRequest request);
        Task<BaseResponse> AssignTutorToStudentAsync(Guid studentId, Guid tutorId, Guid assignedBy);
        Task<BaseResponse> AssignTutorToMultipleStudentsAsync(List<Guid> studentIds, Guid tutorId, Guid assignedBy);
        Task<BaseResponse> GetManagementHistoryAsync(BaseRequest request);
        Task<BaseResponse> GetDetailsManagementHistoryAsync(Guid studentTutorManagementId);
        Task<BaseResponse> ReassignTutorToStudentAsync(ReassignStudentToTutorRequest request);
        Task<BaseResponse> GetAllStudentsAsync(BaseRequest request);
    }
}

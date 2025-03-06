using ETutoring.Business.Dtos.Request;
using ETutoring.Business.Dtos.Request.Moderator;
using ETutoring.Business.Dtos.Response;
using ETutoring.Business.Dtos.Response.Moderator;
using ETutoring.Business.Dtos.Response.Students;
using ETutoring.Business.Dtos.Response.User;
using ETutoring.Business.Dtos.Students;
using ETutoring.Core.Common;

namespace ETutoring.Business.Interfaces.Moderator
{
    public interface IModeratorService
    {
        Task<ApiResponse<List<UserDto>>> GetAllTutorsAsync(int page, int size);
        Task<ApiResponse<List<UserDto>>> GetAllTutorsStudentsAsync(int page, int size);
        Task<ApiResponse<bool>> AssignTutorToMultipleStudentsAsync(List<Guid> studentIds, Guid tutorId, Guid assignedBy);
        Task<ApiResponse<List<StudentTutorManagementHistoryResponse>>> GetManagementHistoryAsync(int page, int size);
        Task<ApiResponse<List<StudentTutorManagementHistoryResponse>>> GetDetailsManagementHistoryAsync(Guid studentTutorManagementId);
        Task<ApiResponse<List<StudentDto>>> GetAllStudentsAsync(int page, int size);
    }
}

using ETutoring.Business.Dtos.Request.Moderator;
using ETutoring.Business.Dtos.Response.Moderator;
using ETutoring.Business.Dtos.Response.Students;
using ETutoring.Business.Dtos.Response.User;
using ETutoring.Business.Dtos.Students;
using ETutoring.Business.Dtos;
using ETutoring.Core.Common;
using ETutoring.Business.Dtos.Response.Message;

namespace ETutoring.Business.Interfaces.Moderator;

public interface IModeratorService
{
    Task<ApiResponse<List<UserDto>>> GetAllTutorsAsync(MetaDataResponse meta);
    Task<ApiResponse<List<UserDto>>> GetAllTutorsStudentsAsync(MetaDataResponse meta);
    Task<ApiResponse<bool>> AssignTutorToMultipleStudentsAsync(AssignTutorMultipleStudentsRequest request);
    Task<ApiResponse<List<StudentTutorManagementHistoryResponse>>> GetManagementHistoryAsync(MetaDataResponse meta);
    Task<ApiResponse<List<StudentTutorManagementHistoryResponse>>> GetDetailsManagementHistoryAsync(Guid studentTutorManagementId);
    Task<ApiResponse<List<StudentDto>>> GetAllStudentsAsync(MetaDataResponse meta);
    Task<ApiResponse<bool>> RemoveTutorFromMultipleStudentsAsync(RemoveTutorMultipleStudentsRequest request);
    Task<ApiResponse<List<AllocationResponse>>> GetAllAllocationsAsync(MetaDataResponse meta);
    Task<ApiResponse<bool>> RemoveAllocationsAsync(List<RemoveAllocation> allocations);
    Task<ApiResponse<List<ChatRoomDto>>> GetAllChatroomsAsync(MetaRequest meta);
    Task<ApiResponse<MessageListResponse>> GetChatroomByIdAsync(Guid chatroomId);
    Task<ApiResponse<bool>> UpdateChatroomStatusAsync(Guid chatroomId, bool isActive);
    Task<ApiResponse<bool>> DeleteChatroomAsync(Guid chatroomId);
}

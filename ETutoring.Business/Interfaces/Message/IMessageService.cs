using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ETutoring.Business.Dtos;
using ETutoring.Business.Dtos.Request.Message;
using ETutoring.Business.Dtos.Request.Moderator;
using ETutoring.Business.Dtos.Response;
using ETutoring.Business.Dtos.Response.Message;
using ETutoring.Core.Common;

namespace ETutoring.Business.Interfaces.Message
{
    public interface IMessageService
    {
        Task<ApiResponse<List<ConversationResponse>>> GetUserConversationsAsync(GetConversationsRequest request);
        Task<ApiResponse<MessageListResponse>> GetUserMessagesAsync(GetMessagesRequest request);
        Task<ApiResponse<SendMessageResponse>> SendMessageAsync(SendMessageRequest request);
        Task<ApiResponse<DeleteMessageResponse>> DeleteMessageAsync(DeleteMessageRequest request);
        Task<ApiResponse<AssignChatroomResponse>> AssignChatroomAsync(AssignChatroomRequest request);
        Task<ApiResponse<List<ChatRoomResponse>>> GetAssignedChatroomsAsync( MetaResponse meta);
        Task<ApiResponse<UpdateAssignChatroomResponse>> UpdateAssignChatroomAsync(UpdateAssignChatroomRequest request);
        Task<ApiResponse<DeleteAssignChatroomResponse>> DeleteAssignChatroomAsync(DeleteAssignChatroomRequest request);
        Task<ApiResponse<AverageMessagesResponse>> GetAverageMessagesPerTutorAsync();
        Task<byte[]> GenerateTutorPerformancePdfReportAsync();
        Task<byte[]> GenerateTutorPerformanceExcelReportAsync();
    }
}

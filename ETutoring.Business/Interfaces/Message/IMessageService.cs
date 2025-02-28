using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ETutoring.Business.Dtos.Request.Message;
using ETutoring.Business.Dtos.Request.Moderator;
using ETutoring.Business.Dtos.Response;
using ETutoring.Business.Dtos.Response.Message;

namespace ETutoring.Business.Interfaces.Message
{
    public interface IMessageService
    {
        Task<List<ConversationResponse>> GetUserConversationsAsync(GetConversationsRequest request);
        Task<MessageListResponse> GetUserMessagesAsync(GetMessagesRequest request);
        Task<SendMessageResponse> SendMessageAsync(SendMessageRequest request);
        Task<DeleteMessageResponse> DeleteMessageAsync(DeleteMessageRequest request);
        Task<AssignChatroomResponse> AssignChatroomAsync(AssignChatroomRequest request);
        Task<List<ChatRoomResponse>> GetAssignedChatroomsAsync(GetAssignedChatroomsRequest request);
    }
}

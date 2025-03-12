using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETutoring.Business.Interfaces.Message
{
        public interface IMessageHubService
        {
            /// <summary>
            /// Gửi tin nhắn từ Sender đến Receiver thông qua SignalR.
            /// </summary>
            Task SendMessage(Guid receiverId, Guid senderId, string message);

            /// <summary>
            /// Gán phòng chat giữa học sinh và gia sư.
            /// </summary>
            Task AssignChatroom(Guid studentId, Guid tutorId);

            /// <summary>
            /// Người dùng tham gia vào phòng chat.
            /// </summary>
            Task JoinChatroom(Guid userId, Guid chatroomId);

            /// <summary>
            /// Người dùng rời khỏi phòng chat.
            /// </summary>
            Task LeaveChatroom(Guid userId, Guid chatroomId);

            Task UpdateAssignChatroom(Guid userId, Guid chatroomId);
    }
}

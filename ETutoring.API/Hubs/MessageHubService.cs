using ETutoring.API.Hubs;
using ETutoring.Business.Interfaces.Message;
using Microsoft.AspNetCore.SignalR;

public class MessageHubService : IMessageHubService
{
    private readonly IHubContext<MessageHub> _hubContext;

    public MessageHubService(IHubContext<MessageHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task SendMessage(Guid receiverId, Guid senderId, string message)
    {
        try
        {
            // Truyền tin nhắn qua SignalR nếu kết nối thành công
            await _hubContext.Clients.All.SendAsync("ReceiveMessage", receiverId.ToString(), senderId.ToString(), message);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error while sending message via SignalR: {ex.Message}");
            // Bạn có thể xử lý lỗi tại đây hoặc trả về thông báo lỗi nếu cần thiết
        }
    }

    public async Task AssignChatroom(Guid studentId, Guid tutorId)
    {
        string roomName = $"{studentId}-{tutorId}";

        try
        {
            await _hubContext.Groups.AddToGroupAsync(studentId.ToString(), roomName);
            await _hubContext.Groups.AddToGroupAsync(tutorId.ToString(), roomName);
            await _hubContext.Clients.Group(roomName).SendAsync("ChatroomAssigned", studentId.ToString(), tutorId.ToString());
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error while assigning chatroom: {ex.Message}");
        }
    }

    public async Task JoinChatroom(Guid userId, Guid chatroomId)
    {
        try
        {
            string roomName = chatroomId.ToString();
            await _hubContext.Groups.AddToGroupAsync(userId.ToString(), roomName);
            await _hubContext.Clients.Group(roomName).SendAsync("UserJoined", userId.ToString());
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error while joining chatroom: {ex.Message}");
        }
    }

    public async Task LeaveChatroom(Guid userId, Guid chatroomId)
    {
        try
        {
            string roomName = chatroomId.ToString();
            await _hubContext.Groups.RemoveFromGroupAsync(userId.ToString(), roomName);
            await _hubContext.Clients.Group(roomName).SendAsync("UserLeft", userId.ToString());
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error while leaving chatroom: {ex.Message}");
        }
    }
}

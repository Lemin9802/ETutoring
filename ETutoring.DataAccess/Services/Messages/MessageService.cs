using ETutoring.Business.Dtos.Request.Message;
using ETutoring.Business.Dtos.Request.Moderator;
using ETutoring.Business.Dtos.Response.Message;
using ETutoring.Business.Interfaces.Message;
using ETutoring.Core.Entities;
using ETutoring.DataAccess.Data;
using Microsoft.EntityFrameworkCore;

public class MessageService : IMessageService
{
    private readonly ApplicationDbContext _context;
    private readonly IMessageHubService _messageHubService;
    public MessageService(ApplicationDbContext context, IMessageHubService messageHubService)
    {
        _context = context;
        _messageHubService = messageHubService;
    }

    public async Task<List<ConversationResponse>> GetUserConversationsAsync(GetConversationsRequest request)
    {
        try
        {
            var conversations = await _context.Messages
                .Where(m => m.SenderId == request.UserId || m.ReceiverId == request.UserId)
                .GroupBy(m => m.SenderId == request.UserId ? m.ReceiverId : m.SenderId)
                .Select(g => new
                {
                    ConversationId = g.FirstOrDefault().Id,
                    ParticipantId = g.Key,
                    LastMessage = g.OrderByDescending(m => m.Timestamp).Select(m => m.Content).FirstOrDefault(),
                    LastMessageTime = g.OrderByDescending(m => m.Timestamp).Select(m => m.Timestamp).FirstOrDefault(),
                    SenderId = g.FirstOrDefault().SenderId,
                    ReceiverId = g.FirstOrDefault().ReceiverId
                })
                .OrderByDescending(c => c.LastMessageTime)
                .ToListAsync();

            var participantIds = conversations.Select(c => Guid.Parse(c.ParticipantId)).ToList();

            var users = await _context.Users
                .Where(u => participantIds.Contains(u.Id))
                .Select(u => new { u.Id, u.FullName, u.ProfilePicture })
                .ToListAsync();

            var conversationResponses = conversations.Select(c => new ConversationResponse
            {
                ConversationId = c.ConversationId,
                ParticipantId = Guid.Parse(c.ParticipantId),
                FullName = users.FirstOrDefault(u => u.Id == Guid.Parse(c.ParticipantId))?.FullName ?? "Unknown",
                ProfilePicture = users.FirstOrDefault(u => u.Id == Guid.Parse(c.ParticipantId))?.ProfilePicture ?? "",
                LastMessage = c.LastMessage,
                LastMessageTime = c.LastMessageTime,
                SenderId = Guid.Parse(c.SenderId),
                ReceiverId = Guid.Parse(c.ReceiverId)
            }).ToList();

            return conversationResponses;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in GetUserConversationsAsync: {ex.Message}");
            return new List<ConversationResponse>();
        }
    }

    public async Task<MessageListResponse> GetUserMessagesAsync(GetMessagesRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.UserId) || string.IsNullOrEmpty(request.ParticipantId))
            {
                throw new ArgumentException("UserId and ParticipantId are required.");
            }

            var messages = await _context.Messages
                .Where(m =>
                    (m.SenderId == request.UserId && m.ReceiverId == request.ParticipantId) ||
                    (m.ReceiverId == request.UserId && m.SenderId == request.ParticipantId))
                .OrderBy(m => m.Timestamp)
                .Select(m => new MessageResponse
                {
                    Id = m.Id,
                    SenderId = m.SenderId,
                    ReceiverId = m.ReceiverId,
                    Content = m.Content,
                    Timestamp = m.Timestamp
                })
                .ToListAsync();

            return new MessageListResponse
            {
                TotalMessages = messages.Count,
                Messages = messages
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in GetUserMessagesAsync: {ex.Message}");
            return new MessageListResponse
            {
                TotalMessages = 0,
                Messages = new List<MessageResponse>()
            };
        }
    }

    public async Task<SendMessageResponse> SendMessageAsync(SendMessageRequest request)
    {
        try
        {
            var message = new Message
            {
                SenderId = request.SenderId,
                ReceiverId = request.ReceiverId,
                Content = request.Content,
                Timestamp = DateTime.UtcNow
            };

            await _context.Messages.AddAsync(message);
            await _context.SaveChangesAsync();

            // Thêm Log gửi tin nhắn qua SignalR
            Console.WriteLine("Sending message via SignalR...");
            await _messageHubService.SendMessage(Guid.Parse(request.SenderId), Guid.Parse(request.ReceiverId), request.Content);
            Console.WriteLine("SignalR message sent!");

            return new SendMessageResponse
            {
                MessageId = message.Id,
                Success = true,
                Message = "Message sent successfully"
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in SendMessageAsync: {ex.Message}");
            return new SendMessageResponse { Success = false, Message = $"Error: {ex.Message}" };
        }
    }

    public async Task<DeleteMessageResponse> DeleteMessageAsync(DeleteMessageRequest request)
    {
        try
        {
            var message = await _context.Messages.FindAsync(request.MessageId);
            if (message == null)
            {
                return new DeleteMessageResponse { Success = false, Message = "Message not found" };
            }

            message.IsDeleted = true;
            await _context.SaveChangesAsync();

            return new DeleteMessageResponse { Success = true, Message = "Message deleted successfully" };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in DeleteMessageAsync: {ex.Message}");
            return new DeleteMessageResponse { Success = false, Message = $"Error: {ex.Message}" };
        }
    }

    public async Task<AssignChatroomResponse> AssignChatroomAsync(AssignChatroomRequest request)
    {
        try
        {
            var chatroom = new ChattingRoom
            {
                StudentId = request.StudentId,
                TutorId = request.TutorId,
                CreatedAt = DateTime.UtcNow
            };

            await _context.ChattingRooms.AddAsync(chatroom);
            await _context.SaveChangesAsync();

            await _messageHubService.AssignChatroom(request.StudentId, request.TutorId);

            return new AssignChatroomResponse { RoomId = chatroom.Id, Success = true, Message = "Chatroom assigned successfully" };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in AssignChatroomAsync: {ex.Message}");
            return new AssignChatroomResponse { Success = false, Message = $"Error: {ex.Message}" };
        }
    }

    public async Task<List<ChatRoomResponse>> GetAssignedChatroomsAsync(GetAssignedChatroomsRequest request)
    {
        try
        {
            if (!Guid.TryParse(request.UserId, out var userId))
            {
                throw new ArgumentException("Invalid UserId format");
            }

            var chatrooms = await _context.ChattingRooms
                .Where(cr => cr.StudentId == userId || cr.TutorId == userId)
                .Select(cr => new ChatRoomResponse
                {
                    RoomId = cr.Id,
                    StudentId = cr.StudentId.ToString(),
                    TutorId = cr.TutorId.ToString(),
                    CreatedAt = cr.CreatedAt
                })
                .ToListAsync();

            return chatrooms;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in GetAssignedChatroomsAsync: {ex.Message}");
            return new List<ChatRoomResponse>();
        }
    }
}

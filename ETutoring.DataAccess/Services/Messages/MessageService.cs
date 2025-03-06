using ETutoring.Business.Dtos.Request.Message;
using ETutoring.Business.Dtos.Request.Moderator;
using ETutoring.Business.Dtos.Response.Message;
using ETutoring.Business.Interfaces.Message;
using ETutoring.Core.Common;
using ETutoring.Core.Entities;
using ETutoring.DataAccess.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ETutoring.DataAccess.Services.Messages
{
    public class MessageService : IMessageService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMessageHubService _messageHubService;

        public MessageService(ApplicationDbContext context, IMessageHubService messageHubService)
        {
            _context = context;
            _messageHubService = messageHubService;
        }

        public async Task<ApiResponse<List<ConversationResponse>>> GetUserConversationsAsync(GetConversationsRequest request)
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

            return ApiResponse<List<ConversationResponse>>.SuccessResponse(conversationResponses);
        }

        public async Task<ApiResponse<MessageListResponse>> GetUserMessagesAsync(GetMessagesRequest request)
        {
            if (string.IsNullOrEmpty(request.UserId) || string.IsNullOrEmpty(request.ParticipantId))
            {
                return ApiResponse<MessageListResponse>.FailureResponse("UserId and ParticipantId are required.");
            }

            var query = _context.Messages
                .Where(m =>
                    (m.SenderId == request.UserId && m.ReceiverId == request.ParticipantId) ||
                    (m.ReceiverId == request.UserId && m.SenderId == request.ParticipantId));

            if (request.ChatroomId.HasValue)
            {
                query = query.Where(m => m.ChatroomId == request.ChatroomId);
            }

            var messages = await query
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

            return ApiResponse<MessageListResponse>.SuccessResponse(new MessageListResponse
            {
                TotalMessages = messages.Count,
                Messages = messages
            });
        }

        public async Task<ApiResponse<SendMessageResponse>> SendMessageAsync(SendMessageRequest request)
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

            await _messageHubService.SendMessage(Guid.Parse(request.SenderId), Guid.Parse(request.ReceiverId),
                request.Content);

            return ApiResponse<SendMessageResponse>.SuccessResponse(new SendMessageResponse
            {
                MessageId = message.Id,
                Success = true,
                Message = "Message sent successfully"
            });
        }

        public async Task<ApiResponse<DeleteMessageResponse>> DeleteMessageAsync(DeleteMessageRequest request)
        {
            var message = await _context.Messages.FindAsync(request.MessageId);
            if (message == null)
            {
                return ApiResponse<DeleteMessageResponse>.FailureResponse("Message not found");
            }

            message.IsDeleted = true;
            await _context.SaveChangesAsync();

            return ApiResponse<DeleteMessageResponse>.SuccessResponse(new DeleteMessageResponse
            {
                Success = true,
                Message = "Message deleted successfully"
            });
        }

        public async Task<ApiResponse<AssignChatroomResponse>> AssignChatroomAsync(AssignChatroomRequest request)
        {
            var chatroom = new ChattingRoom
            {
                StudentId = request.StudentId,
                TutorId = request.TutorId,
                CreatedAt = DateTime.UtcNow
            };

            await _context.ChattingRooms.AddAsync(chatroom);
            await _context.SaveChangesAsync();

            var initialMessage = new Message
            {
                SenderId = request.StudentId.ToString(),
                ReceiverId = request.TutorId.ToString(),
                Content = "Chatroom created. No messages yet.",
                Timestamp = DateTime.UtcNow,
                ChatroomId = chatroom.Id
            };

            await _context.Messages.AddAsync(initialMessage);
            await _context.SaveChangesAsync();

            await _messageHubService.AssignChatroom(request.StudentId, request.TutorId);

            return ApiResponse<AssignChatroomResponse>.SuccessResponse(new AssignChatroomResponse
            {
                RoomId = chatroom.Id,
                Success = true,
                Message = "Chatroom assigned and initial message created"
            });
        }

        public async Task<ApiResponse<List<ChatRoomResponse>>> GetAssignedChatroomsAsync(GetAssignedChatroomsRequest request)
        {
            try
            {
                if (!Guid.TryParse(request.UserId, out var userId))
                {
                    return ApiResponse<List<ChatRoomResponse>>.FailureResponse("Invalid UserId format");
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

                if (chatrooms == null || !chatrooms.Any())
                {
                    return ApiResponse<List<ChatRoomResponse>>.FailureResponse("No chatrooms found for the given user.");
                }

                return ApiResponse<List<ChatRoomResponse>>.SuccessResponse(chatrooms);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetAssignedChatroomsAsync: {ex.Message}");

                return ApiResponse<List<ChatRoomResponse>>.FailureResponse("An error occurred while retrieving chatrooms.");
            }
        }


    }
}

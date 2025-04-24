using ETutoring.Business.Dtos;
using ETutoring.Business.Dtos.Request.Message;
using ETutoring.Business.Dtos.Request.Moderator;
using ETutoring.Business.Dtos.Response.Message;
using ETutoring.Business.Interfaces.Message;
using ETutoring.Core.Common;
using ETutoring.Core.Entities;
using ETutoring.DataAccess.Data;
using Microsoft.EntityFrameworkCore;

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

        public async Task<ApiResponse<AverageMessagesResponse>> GetAverageMessagesPerTutorAsync()
        {
            try
            {
                var tutorIds = await _context.UserRoles
                    .Join(_context.Roles,
                        ur => ur.RoleId,
                        r => r.Id,
                        (ur, r) => new { ur.UserId, RoleName = r.Name })
                    .Where(x => x.RoleName == "Tutor")
                    .Select(x => x.UserId.ToString())
                    .ToListAsync();

                var tutorMessageCounts = await _context.Messages
                    .Where(m => tutorIds.Contains(m.SenderId.ToString()))
                    .GroupBy(m => m.SenderId)
                    .Select(g => new
                    {
                        TutorId = g.Key,
                        MessageCount = g.Count()
                    })
                    .ToListAsync();

                var tutorIdStrs = tutorMessageCounts.Select(t => t.TutorId.ToString()).ToList();
                var tutors = await _context.Users
                    .Where(u => tutorIdStrs.Contains(u.Id.ToString()))
                    .Select(u => new { u.Id, u.FullName })
                    .ToListAsync();

                double averageMessages = tutorMessageCounts.Count > 0
                    ? tutorMessageCounts.Average(t => t.MessageCount)
                    : 0;

                var tutorPerformances = tutorMessageCounts.Select(t => new TutorPerformanceResponse
                {
                    TutorId = t.TutorId,
                    TutorName = tutors.FirstOrDefault(u => u.Id == t.TutorId)?.FullName ?? "Unknown",
                    MessageCount = t.MessageCount
                }).ToList();

                var response = new AverageMessagesResponse
                {
                    AverageMessages = averageMessages,
                    TutorPerformances = tutorPerformances
                };

                return ApiResponse<AverageMessagesResponse>.SuccessResponse(response);
            }
            catch (Exception ex)
            {
                return ApiResponse<AverageMessagesResponse>.FailureResponse($"An error occurred: {ex.Message}");
            }
        }

        public async Task<byte[]> GenerateTutorPerformancePdfReportAsync()
        {
            var tutorPerformanceResponse = await GetAverageMessagesPerTutorAsync();
            if (!tutorPerformanceResponse.Success || tutorPerformanceResponse.Data == null)
                throw new Exception(tutorPerformanceResponse.Message);

            var tutorPerformance = tutorPerformanceResponse.Data;

            using var document = new PdfSharp.Pdf.PdfDocument();
            var page = document.AddPage();
            var gfx = PdfSharp.Drawing.XGraphics.FromPdfPage(page);
            var font = new PdfSharp.Drawing.XFont("Arial", 12);
            var titleFont = new PdfSharp.Drawing.XFont("Arial", 16);
            var headerFont = new PdfSharp.Drawing.XFont("Arial", 14);

            gfx.DrawString("Tutor Performance Report", titleFont, PdfSharp.Drawing.XBrushes.Black,
                new PdfSharp.Drawing.XRect(50, 50, page.Width.Point, 30), PdfSharp.Drawing.XStringFormats.TopLeft);

            gfx.DrawString($"Average Messages Per Tutor: {tutorPerformance.AverageMessages:F2}", headerFont,
                PdfSharp.Drawing.XBrushes.Black, new PdfSharp.Drawing.XRect(50, 90, page.Width.Point, 30), PdfSharp.Drawing.XStringFormats.TopLeft);

            gfx.DrawString("Tutor Name", headerFont, PdfSharp.Drawing.XBrushes.Black, 50, 130);
            gfx.DrawString("Message Count", headerFont, PdfSharp.Drawing.XBrushes.Black, 300, 130);

            var yPos = 160;
            foreach (var tutor in tutorPerformance.TutorPerformances.OrderByDescending(t => t.MessageCount))
            {
                gfx.DrawString(tutor.TutorName, font, PdfSharp.Drawing.XBrushes.Black, 50, yPos);
                gfx.DrawString(tutor.MessageCount.ToString(), font, PdfSharp.Drawing.XBrushes.Black, 300, yPos);
                yPos += 20;

                if (yPos > page.Height.Point - 50)
                {
                    page = document.AddPage();
                    gfx = PdfSharp.Drawing.XGraphics.FromPdfPage(page);
                    yPos = 50;
                }
            }

            gfx.DrawString($"Generated on: {DateTime.Now}", font, PdfSharp.Drawing.XBrushes.Black, 50, page.Height.Point - 50);

            using var stream = new MemoryStream();
            document.Save(stream);
            return stream.ToArray();
        }

        public async Task<byte[]> GenerateTutorPerformanceExcelReportAsync()
        {
            var tutorPerformanceResponse = await GetAverageMessagesPerTutorAsync();
            if (!tutorPerformanceResponse.Success)
                throw new Exception(tutorPerformanceResponse.Message);

            var tutorPerformance = tutorPerformanceResponse.Data;

            using var workbook = new ClosedXML.Excel.XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Tutor Performance");

            worksheet.Cell(1, 1).Value = "Tutor Performance Report";
            worksheet.Cell(1, 1).Style.Font.Bold = true;
            worksheet.Cell(1, 1).Style.Font.FontSize = 16;

            worksheet.Cell(3, 1).Value = "Average Messages Per Tutor:";
            worksheet.Cell(3, 2).Value = tutorPerformance.AverageMessages;
            worksheet.Cell(3, 2).Style.NumberFormat.Format = "0.00";

            worksheet.Cell(5, 1).Value = "Tutor Name";
            worksheet.Cell(5, 2).Value = "Message Count";
            worksheet.Cell(5, 3).Value = "Comparison to Average";
            worksheet.Range(5, 1, 5, 3).Style.Font.Bold = true;

            var row = 6;
            foreach (var tutor in tutorPerformance.TutorPerformances.OrderByDescending(t => t.MessageCount))
            {
                worksheet.Cell(row, 1).Value = tutor.TutorName;
                worksheet.Cell(row, 2).Value = tutor.MessageCount;
                worksheet.Cell(row, 3).FormulaA1 = $"=B{row}/B3*100";
                worksheet.Cell(row, 3).Style.NumberFormat.Format = "0.00%";
                row++;
            }

            worksheet.Cell(row + 2, 1).Value = $"Generated on: {DateTime.Now}";
            worksheet.Columns().AdjustToContents();

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }

        public async Task<ApiResponse<List<ConversationResponse>>> GetUserConversationsAsync(GetConversationsRequest request)
        {
            var userIdStr = request.UserId.ToString();

            // Truy vấn ChattingRoom theo text
            var chatroomsRaw = await _context.ChattingRooms
                .Where(cr => cr.StudentId.ToString() == userIdStr || cr.TutorId.ToString() == userIdStr)
                .Select(cr => new
                {
                    Id = cr.Id.ToString(),
                    StudentId = cr.StudentId.ToString(),
                    TutorId = cr.TutorId.ToString(),
                    CreatedAt = cr.CreatedAt
                })
                .ToListAsync();

            var conversationResponses = new List<ConversationResponse>();

            foreach (var cr in chatroomsRaw)
            {
                var lastMessage = await _context.Messages
                    .Where(m => m.ChatroomId.ToString() == cr.Id && !m.IsDeleted)
                    .OrderByDescending(m => m.Timestamp)
                    .Select(m => new
                    {
                        m.Id,
                        m.Content,
                        m.Timestamp,
                        SenderId = m.SenderId.ToString(),
                        ReceiverId = m.ReceiverId.ToString()
                    })
                    .FirstOrDefaultAsync();

                // Xác định participant
                var participantIdStr = cr.StudentId == userIdStr ? cr.TutorId : cr.StudentId;
                var participant = await _context.Users
                    .Where(u => u.Id.ToString() == participantIdStr)
                    .Select(u => new { u.Id, u.FullName, u.ProfilePicture })
                    .FirstOrDefaultAsync();

                conversationResponses.Add(new ConversationResponse
                {
                    ChatroomId = Guid.Parse(cr.Id),
                    ConversationId = lastMessage?.Id ?? Guid.Empty,
                    ParticipantId = Guid.Parse(participantIdStr),
                    FullName = participant?.FullName ?? "Unknown",
                    ProfilePicture = participant?.ProfilePicture ?? string.Empty,
                    LastMessage = lastMessage?.Content ?? "No messages yet",
                    LastMessageTime = lastMessage?.Timestamp ?? cr.CreatedAt,
                    SenderId = lastMessage != null ? Guid.Parse(lastMessage.SenderId) : Guid.Empty,
                    ReceiverId = lastMessage != null ? Guid.Parse(lastMessage.ReceiverId) : Guid.Empty
                });
            }

            conversationResponses = conversationResponses
                .OrderByDescending(c => c.LastMessageTime)
                .ToList();

            return ApiResponse<List<ConversationResponse>>.SuccessResponse(conversationResponses);
        }


        public async Task<ApiResponse<MessageListResponse>> GetUserMessagesAsync(GetMessagesRequest request)
        {
            if (request.UserId == Guid.Empty || request.ParticipantId == Guid.Empty)
                return ApiResponse<MessageListResponse>.FailureResponse("UserId and ParticipantId are required.");

            var userIdStr = request.UserId.ToString();
            var participantIdStr = request.ParticipantId.ToString();

            var query = _context.Messages
                .Where(m =>
                    (m.SenderId.ToString() == userIdStr && m.ReceiverId.ToString() == participantIdStr) ||
                    (m.SenderId.ToString() == participantIdStr && m.ReceiverId.ToString() == userIdStr));

            if (request.ChatroomId.HasValue)
            {
                var chatroomIdStr = request.ChatroomId.Value.ToString();
                query = query.Where(m => m.ChatroomId.ToString() == chatroomIdStr);
            }

            var messages = await query
                .OrderBy(m => m.Timestamp)
                .Select(m => new
                {
                    m.Id,
                    m.Content,
                    m.Timestamp,
                    SenderId = m.SenderId.ToString(),
                    ReceiverId = m.ReceiverId.ToString()
                })
                .ToListAsync();

            var responseMessages = messages.Select(m => new MessageResponse
            {
                Id = m.Id,
                Content = m.Content,
                Timestamp = m.Timestamp,
                SenderId = Guid.Parse(m.SenderId),
                ReceiverId = Guid.Parse(m.ReceiverId)
            }).ToList();

            return ApiResponse<MessageListResponse>.SuccessResponse(new MessageListResponse
            {
                TotalMessages = responseMessages.Count,
                Messages = responseMessages
            });
        }


        public async Task<ApiResponse<SendMessageResponse>> SendMessageAsync(SendMessageRequest request)
        {
            var messageEntity = new Message
            {
                SenderId = request.SenderId,
                ReceiverId = request.ReceiverId,
                Content = request.Content,
                Timestamp = DateTime.UtcNow,
                ChatroomId = request.ChatroomId
            };

            await _context.Messages.AddAsync(messageEntity);
            await _context.SaveChangesAsync();

            await _messageHubService.SendMessage(request.SenderId, request.ReceiverId, request.Content);

            return ApiResponse<SendMessageResponse>.SuccessResponse(new SendMessageResponse
            {
                MessageId = messageEntity.Id,
                Success = true,
                Message = "Message sent successfully"
            });
        }

        public async Task<ApiResponse<DeleteMessageResponse>> DeleteMessageAsync(DeleteMessageRequest request)
        {
            var message = await _context.Messages.FindAsync(request.MessageId);
            if (message == null)
                return ApiResponse<DeleteMessageResponse>.FailureResponse("Message not found");

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
            var studentIdStr = request.StudentId.ToString();
            var tutorIdStr = request.TutorId.ToString();

            var existingChatroom = await _context.ChattingRooms
                .FirstOrDefaultAsync(cr =>
                    cr.StudentId.ToString() == studentIdStr &&
                    cr.TutorId.ToString() == tutorIdStr);

            if (existingChatroom != null)
                return ApiResponse<AssignChatroomResponse>
                    .FailureResponse("Chatroom between this student and tutor already exists.");

            using var transaction = await _context.Database.BeginTransactionAsync();
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

                var initialMessage = new Message
                {
                    SenderId = request.StudentId,
                    ReceiverId = request.TutorId,
                    Content = "Chatroom created. No messages yet.",
                    Timestamp = DateTime.UtcNow,
                    ChatroomId = chatroom.Id
                };

                await _context.Messages.AddAsync(initialMessage);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                await _messageHubService.AssignChatroom(request.StudentId, request.TutorId);

                return ApiResponse<AssignChatroomResponse>.SuccessResponse(new AssignChatroomResponse
                {
                    RoomId = chatroom.Id,
                    Success = true,
                    Message = "Chatroom assigned and initial message created"
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return ApiResponse<AssignChatroomResponse>
                    .FailureResponse($"An error occurred while assigning the chatroom: {ex.Message}");
            }
        }

        public async Task<ApiResponse<List<ChatRoomResponse>>> GetAssignedChatroomsAsync(MetaRequest meta)
        {
            try
            {
                var query = _context.ChattingRooms
                    .Join(_context.Users,
                        cr => cr.StudentId.ToString(),
                        student => student.Id.ToString(),
                        (cr, student) => new { cr, student })
                    .Join(_context.Users,
                        combined => combined.cr.TutorId.ToString(),
                        tutor => tutor.Id.ToString(),
                        (combined, tutor) => new ChatRoomResponse
                        {
                            RoomId = combined.cr.Id,
                            StudentId = combined.student.Id,
                            StudentEmail = combined.student.Email,
                            StudentName = combined.student.FullName,
                            TutorId = tutor.Id,
                            TutorEmail = tutor.Email,
                            TutorName = tutor.FullName,
                            CreatedAt = combined.cr.CreatedAt
                        });

                var totalItems = await query.CountAsync();
                if (totalItems == 0)
                    return ApiResponse<List<ChatRoomResponse>>.FailureResponse("No chatrooms found.");

                int totalPages = (int)Math.Ceiling((double)totalItems / meta.PageSize);

                var chatrooms = await query
                    .Skip((meta.PageNumber - 1) * meta.PageSize)
                    .Take(meta.PageSize)
                    .ToListAsync();

                var metaData = new MetaDataResponse(meta.PageNumber, meta.PageSize, totalPages, totalItems);
                return ApiResponse<List<ChatRoomResponse>>.SuccessResponseWithMeta(chatrooms, metaData);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetAssignedChatroomsAsync: {ex.Message}");
                return ApiResponse<List<ChatRoomResponse>>.FailureResponse("An error occurred while retrieving chatrooms.");
            }
        }

        public async Task<ApiResponse<UpdateAssignChatroomResponse>> UpdateAssignChatroomAsync(UpdateAssignChatroomRequest request)
        {
            try
            {
                var chatroom = await _context.ChattingRooms.FindAsync(request.RoomId);
                if (chatroom == null)
                    return ApiResponse<UpdateAssignChatroomResponse>.FailureResponse("Chatroom not found.");

                chatroom.TutorId = request.NewTutorId;
                chatroom.StudentId = request.NewStudentId;

                _context.ChattingRooms.Update(chatroom);
                await _context.SaveChangesAsync();

                return ApiResponse<UpdateAssignChatroomResponse>.SuccessResponse(new UpdateAssignChatroomResponse
                {
                    RoomId = chatroom.Id,
                    TutorId = chatroom.TutorId,
                    StudentId = chatroom.StudentId,
                    Success = true,
                    Message = "Chatroom assignment updated successfully."
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in UpdateAssignChatroomAsync: {ex.Message}");
                return ApiResponse<UpdateAssignChatroomResponse>.FailureResponse("An error occurred while updating chatroom assignment.");
            }
        }

        public async Task<ApiResponse<DeleteAssignChatroomResponse>> DeleteAssignChatroomAsync(DeleteAssignChatroomRequest request)
        {
            // Tìm chatroom theo RoomId
            var chatroom = await _context.ChattingRooms.FindAsync(request.RoomId);
            if (chatroom == null)
            {
                return ApiResponse<DeleteAssignChatroomResponse>.FailureResponse("Chatroom not found.");
            }

            // Lấy tất cả các message liên quan đến chatroom này
            var messages = _context.Messages.Where(m => m.ChatroomId == chatroom.Id);
            // Xóa tất cả các message liên quan
            _context.Messages.RemoveRange(messages);

            // Xóa chatroom
            _context.ChattingRooms.Remove(chatroom);

            // Lưu thay đổi
            await _context.SaveChangesAsync();

            return ApiResponse<DeleteAssignChatroomResponse>.SuccessResponse(new DeleteAssignChatroomResponse
            {
                RoomId = chatroom.Id,
                Success = true,
                Message = "Chatroom and its messages deleted successfully."
            });
        }
    }
}

using ETutoring.Business.Dtos;
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
    public partial class MessageService : IMessageService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMessageHubService _messageHubService;

        public async Task<ApiResponse<AverageMessagesResponse>> GetAverageMessagesPerTutorAsync()
        {
            try
            {
                // Get all users with Tutor role
                var tutorIds = await _context.UserRoles
                    .Join(_context.Roles,
                        ur => ur.RoleId,
                        r => r.Id,
                        (ur, r) => new { ur.UserId, RoleName = r.Name })
                    .Where(x => x.RoleName == "Tutor")
                    .Select(x => x.UserId.ToString())
                    .ToListAsync();

                // Get message counts for each tutor
                var tutorMessageCounts = await _context.Messages
                    .Where(m => tutorIds.Contains(m.SenderId))
                    .GroupBy(m => m.SenderId)
                    .Select(g => new
                    {
                        TutorId = g.Key,
                        MessageCount = g.Count()
                    })
                    .ToListAsync();

                // Get tutor names
                var tutorIdGuids = tutorMessageCounts.Select(t => Guid.Parse(t.TutorId)).ToList();
                var tutors = await _context.Users
                    .Where(u => tutorIdGuids.Contains(u.Id))
                    .Select(u => new { u.Id, u.FullName })
                    .ToListAsync();

                // Calculate average
                double averageMessages = 0;
                if (tutorMessageCounts.Count > 0)
                {
                    averageMessages = tutorMessageCounts.Average(t => t.MessageCount);
                }

                // Create response
                var tutorPerformances = tutorMessageCounts.Select(t => new TutorPerformanceResponse
                {
                    TutorId = Guid.Parse(t.TutorId),
                    TutorName = tutors.FirstOrDefault(u => u.Id == Guid.Parse(t.TutorId))?.FullName ?? "Unknown",
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
            {
                throw new Exception(tutorPerformanceResponse.Message);
            }

            var tutorPerformance = tutorPerformanceResponse.Data;

            using var document = new PdfSharp.Pdf.PdfDocument();
            var page = document.AddPage();
            var gfx = PdfSharp.Drawing.XGraphics.FromPdfPage(page);
            var font = new PdfSharp.Drawing.XFont("Arial", 12);
            var titleFont = new PdfSharp.Drawing.XFont("Arial", 16);
            var headerFont = new PdfSharp.Drawing.XFont("Arial", 14);

            // Add title
            gfx.DrawString("Tutor Performance Report", titleFont,
                PdfSharp.Drawing.XBrushes.Black, new PdfSharp.Drawing.XRect(50, 50, page.Width.Point, 30), PdfSharp.Drawing.XStringFormats.TopLeft);

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
            {
                throw new Exception(tutorPerformanceResponse.Message);
            }

            var tutorPerformance = tutorPerformanceResponse.Data;

            using var workbook = new ClosedXML.Excel.XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Tutor Performance");

            // Add title
            worksheet.Cell(1, 1).Value = "Tutor Performance Report";
            worksheet.Cell(1, 1).Style.Font.Bold = true;
            worksheet.Cell(1, 1).Style.Font.FontSize = 16;

            // Add average
            worksheet.Cell(3, 1).Value = "Average Messages Per Tutor:";
            worksheet.Cell(3, 2).Value = tutorPerformance.AverageMessages;
            worksheet.Cell(3, 2).Style.NumberFormat.Format = "0.00";

            // Add headers
            worksheet.Cell(5, 1).Value = "Tutor Name";
            worksheet.Cell(5, 2).Value = "Message Count";
            worksheet.Cell(5, 3).Value = "Comparison to Average";
            worksheet.Range(5, 1, 5, 3).Style.Font.Bold = true;

            // Add data
            var row = 6;
            foreach (var tutor in tutorPerformance.TutorPerformances.OrderByDescending(t => t.MessageCount))
            {
                worksheet.Cell(row, 1).Value = tutor.TutorName;
                worksheet.Cell(row, 2).Value = tutor.MessageCount;
                worksheet.Cell(row, 3).FormulaA1 = $"=B{row}/B3*100";
                worksheet.Cell(row, 3).Style.NumberFormat.Format = "0.00%";
                row++;
            }

            // Add generation date
            worksheet.Cell(row + 2, 1).Value = $"Generated on: {DateTime.Now}";

            // Auto-fit columns
            worksheet.Columns().AdjustToContents();

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }

        public MessageService(ApplicationDbContext context, IMessageHubService messageHubService)
        {
            _context = context;
            _messageHubService = messageHubService;
        }

        public async Task<ApiResponse<List<ConversationResponse>>> GetUserConversationsAsync(GetConversationsRequest request)
        {
            // Lấy tất cả các phòng chat mà người dùng tham gia (dưới dạng ChattingRoom)
            var chatrooms = await _context.ChattingRooms
                .Where(cr => cr.StudentId == request.UserId || cr.TutorId == request.UserId)
                .ToListAsync();

            var conversationResponses = new List<ConversationResponse>();

            foreach (var room in chatrooms)
            {
                // Lấy tin nhắn cuối cùng trong phòng chat (không bao gồm tin nhắn bị xóa)
                var lastMessage = await _context.Messages
                    .Where(m => m.ChatroomId == room.Id && !m.IsDeleted)
                    .OrderByDescending(m => m.Timestamp)
                    .FirstOrDefaultAsync();

                // Xác định đối tác trong phòng chat: nếu user là Student thì đối tác là Tutor, ngược lại.
                Guid participantId = room.StudentId == request.UserId ? room.TutorId : room.StudentId;

                // Lấy thông tin đối tác từ bảng Users
                var participant = await _context.Users
                    .Where(u => u.Id == participantId)
                    .Select(u => new { u.Id, u.FullName, u.ProfilePicture })
                    .FirstOrDefaultAsync();

                conversationResponses.Add(new ConversationResponse
                {
                    ChatroomId = room.Id,
                    ConversationId = lastMessage != null ? lastMessage.Id : Guid.Empty,
                    ParticipantId = participantId,
                    FullName = participant != null ? participant.FullName : "Unknown",
                    ProfilePicture = participant != null ? participant.ProfilePicture : string.Empty,
                    LastMessage = lastMessage != null ? lastMessage.Content : "No messages yet",
                    LastMessageTime = lastMessage != null ? lastMessage.Timestamp : room.CreatedAt,
                    SenderId = lastMessage != null ? Guid.Parse(lastMessage.SenderId) : Guid.Empty,
                    ReceiverId = lastMessage != null ? Guid.Parse(lastMessage.ReceiverId) : Guid.Empty,
                });
            }

            // Sắp xếp theo thời gian tin nhắn cuối cùng giảm dần
            conversationResponses = conversationResponses
                .OrderByDescending(c => c.LastMessageTime)
                .ToList();

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

            await _messageHubService.SendMessage(Guid.Parse(request.SenderId), Guid.Parse(request.ReceiverId), request.Content);

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

        public async Task<ApiResponse<List<ChatRoomResponse>>> GetAssignedChatroomsAsync(MetaResponse meta)
        {
            try
            {
                // Build query join giữa bảng ChattingRooms và Users (2 lần join: lấy thông tin của student và tutor)
                var query = _context.ChattingRooms
                    .Join(
                        _context.Users,
                        cr => cr.StudentId,  // Giả sử StudentId đã là Guid
                        student => student.Id,
                        (cr, student) => new { cr, student }
                    )
                    .Join(
                        _context.Users,
                        combined => combined.cr.TutorId, // Giả sử TutorId đã là Guid
                        tutor => tutor.Id,
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
                        }
                    );

                // Đếm tổng số bản ghi cho phân trang
                var totalItems = await query.CountAsync();
                if (totalItems == 0)
                {
                    return ApiResponse<List<ChatRoomResponse>>.FailureResponse("No chatrooms found.");
                }

                // Tính tổng số trang
                int totalPages = (int)Math.Ceiling((double)totalItems / meta.PageSize);

                // Lấy kết quả phân trang
                var chatrooms = await query
                    .Skip((meta.PageNumber - 1) * meta.PageSize)
                    .Take(meta.PageSize)
                    .ToListAsync();

                // Xây dựng metadata cho phân trang
                var metaData = new MetaDataResponse(meta.PageNumber, meta.PageSize, totalPages, totalItems);

                // Trả về kết quả thành công kèm metadata phân trang
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
                // Tìm chatroom theo RoomId
                var chatroom = await _context.ChattingRooms.FindAsync(request.RoomId);
                if (chatroom == null)
                {
                    return ApiResponse<UpdateAssignChatroomResponse>.FailureResponse("Chatroom not found.");
                }

                // Cập nhật cả TutorId và StudentId
                chatroom.TutorId = request.NewTutorId;
                chatroom.StudentId = request.NewStudentId;

                _context.ChattingRooms.Update(chatroom);
                await _context.SaveChangesAsync();

                // Trả về response bao gồm cả TutorId và StudentId mới
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
            try
            {
                // Tìm chatroom theo RoomId
                var chatroom = await _context.ChattingRooms.FindAsync(request.RoomId);
                if (chatroom == null)
                {
                    return ApiResponse<DeleteAssignChatroomResponse>.FailureResponse("Chatroom not found.");
                }

                // Xóa chatroom. (Nếu có liên quan đến messages, có thể xóa chúng trước nếu cần.)
                _context.ChattingRooms.Remove(chatroom);
                await _context.SaveChangesAsync();

                return ApiResponse<DeleteAssignChatroomResponse>.SuccessResponse(new DeleteAssignChatroomResponse
                {
                    RoomId = chatroom.Id,
                    Success = true,
                    Message = "Chatroom deleted successfully."
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in DeleteAssignChatroomAsync: {ex.Message}");
                return ApiResponse<DeleteAssignChatroomResponse>.FailureResponse("An error occurred while deleting the chatroom.");
            }
        }

    }
}

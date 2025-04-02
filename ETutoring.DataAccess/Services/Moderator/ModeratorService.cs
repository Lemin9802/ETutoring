using ETutoring.Core.Entities;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using ETutoring.Business.Interfaces.Moderator;
using ETutoring.DataAccess.Data;
using ETutoring.Business.Dtos.Request.Moderator;
using ETutoring.Business.Dtos.Response.Moderator;
using ETutoring.Business.Dtos.Request;
using ETutoring.Business.Dtos.Students;
using ETutoring.Business.Dtos.Response;
using ETutoring.Business.Dtos.Response.Students;
using ETutoring.Business.Dtos.Response.Moderator;
using ETutoring.Business.Dtos.Response.User;
using ETutoring.Core.Common;
using Microsoft.AspNetCore.Http.HttpResults;
using ETutoring.Business.Dtos;
using ETutoring.Business.Dtos.Documents;
using Microsoft.AspNetCore.Mvc;
using ETutoring.Business.Interfaces.Services;
using ETutoring.Core.EmailTemplate;
using ETutoring.Business.Dtos.Response.Message;
using ETutoring.Business.Interfaces.Message;
using Amazon.Runtime.Internal.Transform;
using System.Text.Json;

namespace ETutoring.DataAccess.Services.Moderator
{
    public class ModeratorService : IModeratorService
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly IMessageService _messageService;

        public ModeratorService(ApplicationDbContext context, IEmailService emailService, IMessageService messageService)
        {
            _context = context;
            _emailService = emailService;
            _messageService = messageService;
        }

        public async Task<ApiResponse<List<UserDto>>> GetAllTutorsAsync(MetaDataResponse meta)
        {

            var tutorRoleId = await _context.Roles
                .Where(r => r.Name == "Tutor")
                .Select(r => r.Id)
                .FirstOrDefaultAsync();

            if (tutorRoleId == Guid.Empty)
                return ApiResponse<List<UserDto>>.FailureResponse("Tutor role not found.");

            var tutors = await _context.Users
                .Join(_context.UserRoles,
                    user => user.Id,
                    userRole => userRole.UserId,
                    (user, userRole) => new { user, userRole })
                .Where(joined => joined.userRole.RoleId == tutorRoleId)
                .Select(joined => new UserDto
                {
                    Id = joined.user.Id,
                    FullName = joined.user.FullName,
                    Email = joined.user.Email,
                    PhoneNumber = joined.user.PhoneNumber,
                    Address = joined.user.Address,
                    IsActive = joined.user.IsActive,
                    RoleId = joined.userRole.RoleId,
                    RoleName = "Tutor" // since it's a tutor role
                })
                .ToListAsync();

            var totalItems = tutors.Count;

            int totalPages = (int)Math.Ceiling((double)totalItems / meta.PageSize);

            var metaData = new MetaDataResponse(meta.PageNumber, meta.PageSize, totalPages, totalItems);

            return ApiResponse<List<UserDto>>.SuccessResponseWithMeta(tutors, metaData);
        }

        public async Task<ApiResponse<bool>> AssignTutorToMultipleStudentsAsync(AssignTutorMultipleStudentsRequest request)
        {
            var roles = await _context.Roles
                .Where(r => r.Name == "Student" || r.Name == "Tutor")
                .ToDictionaryAsync(r => r.Name, r => r.Id);

            if (!roles.ContainsKey("Student") || !roles.ContainsKey("Tutor"))
                return ApiResponse<bool>.FailureResponse("Roles not found.");

            var studentRoleId = roles["Student"];
            var tutorRoleId = roles["Tutor"];

            var isTutor = await _context.UserRoles.AnyAsync(ur => ur.UserId == request.TutorId && ur.RoleId == tutorRoleId);
            if (!isTutor)
                return ApiResponse<bool>.FailureResponse("Invalid Tutor.");

            var validStudents = await _context.Users
                .Where(u => request.StudentIds.Contains(u.Id))
                .Join(_context.UserRoles.Where(ur => ur.RoleId == studentRoleId),
                      user => user.Id,
                      userRole => userRole.UserId,
                      (user, userRole) => user)
                .ToListAsync();

            if (!validStudents.Any())
                return ApiResponse<bool>.FailureResponse("No valid students found.");

            var tutor = await _context.Users.FindAsync(request.TutorId);
            if (tutor == null)
                return ApiResponse<bool>.FailureResponse("Tutor not found.");

            var existingAllocations = await _context.Allocations
                .Where(a => validStudents.Select(s => s.Id).Contains(a.StudentId))
                .ToListAsync();
            _context.Allocations.RemoveRange(existingAllocations);

            var newAllocations = new List<Allocation>();
            var studentDetails = new List<string>();
            var emailTasks = new List<Task>();
            var chatroomTasks = new List<Task>();

            foreach (var student in validStudents)
            {
                newAllocations.Add(new Allocation
                {
                    StudentId = student.Id,
                    TutorId = request.TutorId,
                    AssignedBy = request.AssignedBy,
                    AssignedAt = DateTime.UtcNow
                });

                studentDetails.Add($"- {student.Email}");

                emailTasks.Add(_emailService.SendEmailAsync(new EmailTemplateRequest(
                    student.Id,
                    student.Email,
                    "You have been assigned a new tutor!",
                    EmailTemplateType.StudentReceiveNewTutor,
                    new Dictionary<string, string>
                    {
                        { "studentName", student.Email },
                        { "TutorName", tutor.Email }
                    }
                )));

                //chatroomTasks.Add(Task.Run(async () =>
                //{
                //    try
                //    {
                //        var assignChatroomRequest = new AssignChatroomRequest
                //        {
                //            StudentId = student.Id,
                //            TutorId = tutor.Id
                //        };
                //        await _messageService.AssignChatroomAsync(assignChatroomRequest);
                //    }
                //    catch (Exception ex)
                //    {
                //        Console.WriteLine($"[ERROR] AssignChatroomAsync failed for Student {student.Email}: {ex.Message}");
                //    }
                //}));
            }

            _context.Allocations.AddRange(newAllocations);
            await _context.SaveChangesAsync();

            emailTasks.Add(_emailService.SendEmailAsync(new EmailTemplateRequest(
                tutor.Id,
                tutor.Email,
                "You have been assigned new students!",
                EmailTemplateType.TutorAssignedToStudent,
                new Dictionary<string, string>
                {
                    { "TutorName", tutor.Email },
                    { "StudentCount", validStudents.Count.ToString() },
                    { "StudentPlural", validStudents.Count > 1 ? "s" : "" },
                    { "StudentList", string.Join("", validStudents.Select(s => $"<li><strong>{s.Email}</strong></li>")) }
                }
            )));


            await Task.WhenAll(emailTasks);
            await Task.WhenAll(chatroomTasks);

            return ApiResponse<bool>.SuccessResponse(true, "Tutor assigned to multiple students successfully.");
        }


        public async Task<ApiResponse<List<UserDto>>> GetAllTutorsStudentsAsync(MetaDataResponse meta)
        {

            var roleIds = await _context.Roles
                .Where(r => r.Name == "Tutor" || r.Name == "Student")
                .Select(r => r.Id)
                .ToListAsync();

            if (!roleIds.Any())
                return ApiResponse<List<UserDto>>.FailureResponse("Tutor or Student role not found.");

            var users = await _context.Users
                .Join(_context.UserRoles,
                    user => user.Id,
                    userRole => userRole.UserId,
                    (user, userRole) => new { user, userRole })
                .Join(_context.Roles,
                    joined => joined.userRole.RoleId,
                    role => role.Id,
                    (joined, role) => new { joined.user, joined.userRole, role })
                .Where(joined => roleIds.Contains(joined.userRole.RoleId))
                .Select(joined => new UserDto
                {
                    Id = joined.user.Id,
                    FullName = joined.user.FullName,
                    Email = joined.user.Email,
                    PhoneNumber = joined.user.PhoneNumber,
                    Address = joined.user.Address,
                    IsActive = joined.user.IsActive,
                    RoleId = joined.userRole.RoleId,
                    RoleName = joined.role.Name
                })
                .ToListAsync();

            var totalItems = users.Count;

            int totalPages = (int)Math.Ceiling((double)totalItems / meta.PageSize);

            var metaData = new MetaDataResponse(meta.PageNumber, meta.PageSize, totalPages, totalItems);

            return ApiResponse<List<UserDto>>.SuccessResponseWithMeta(users, metaData);
        }

        public async Task<ApiResponse<List<StudentTutorManagementHistoryResponse>>> GetManagementHistoryAsync(MetaDataResponse meta)
        {
            var history = await _context.StudentTutorManagementHistories
                .OrderByDescending(log => log.AssignedAt)
                .Select(log => new StudentTutorManagementHistoryResponse
                {
                    StudentId = log.StudentId,
                    StudentName = _context.Users
                        .Where(u => u.Id == log.StudentId)
                        .Select(u => u.FullName)
                        .FirstOrDefault(),
                    TutorId = log.TutorId,
                    TutorName = _context.Users
                        .Where(u => u.Id == log.TutorId)
                        .Select(u => u.FullName)
                        .FirstOrDefault(),
                    AssignedBy = log.AssignedBy,
                    AssignedByName = _context.Users
                        .Where(u => u.Id == log.AssignedBy)
                        .Select(u => u.FullName)
                        .FirstOrDefault(),
                    AssignedAt = log.AssignedAt,
                    Action = log.Action
                })
                .ToListAsync();

            var totalItems = history.Count;

            int totalPages = (int)Math.Ceiling((double)totalItems / meta.PageSize);

            var metaData = new MetaDataResponse(meta.PageNumber, meta.PageSize, totalPages, totalItems);


            return ApiResponse<List<StudentTutorManagementHistoryResponse>>.SuccessResponseWithMeta(history, metaData);
        }

        public async Task<ApiResponse<List<StudentTutorManagementHistoryResponse>>> GetDetailsManagementHistoryAsync(Guid studentTutorManagementId)
        {

            var history = await _context.StudentTutorManagementHistories
                .Where(log => log.StudentTutorManagementId == studentTutorManagementId)
                .OrderByDescending(log => log.AssignedAt)
                .Select(log => new StudentTutorManagementHistoryResponse
                {
                    StudentTutorManagementId = log.StudentTutorManagementId,
                    StudentId = log.StudentId,
                    StudentName = _context.Users
                        .Where(u => u.Id == log.StudentId)
                        .Select(u => u.FullName)
                        .FirstOrDefault(),
                    TutorId = log.TutorId,
                    TutorName = _context.Users
                        .Where(u => u.Id == log.TutorId)
                        .Select(u => u.FullName)
                        .FirstOrDefault(),
                    AssignedBy = log.AssignedBy,
                    AssignedByName = _context.Users
                        .Where(u => u.Id == log.AssignedBy)
                        .Select(u => u.FullName)
                        .FirstOrDefault(),
                    AssignedAt = log.AssignedAt,
                    Action = log.Action
                })
                .ToListAsync();

            if (!history.Any())
                return ApiResponse<List<StudentTutorManagementHistoryResponse>>.FailureResponse("No history found for the given assignment.");

            return ApiResponse<List<StudentTutorManagementHistoryResponse>>.SuccessResponse(history, "Assignment history retrieved successfully.");
        }

        public async Task<ApiResponse<List<StudentDto>>> GetAllStudentsAsync(MetaDataResponse meta)
        {
            try
            {
                var studentRoleId = await _context.Roles
                    .Where(r => r.Name == "Student")
                    .Select(r => r.Id)
                    .FirstOrDefaultAsync();

                var query = _context.Users
                    .Join(_context.UserRoles,
                        user => user.Id,
                        userRole => userRole.UserId,
                        (user, userRole) => new { User = user, UserRole = userRole })
                    .Where(u => u.UserRole.RoleId == studentRoleId)
                    .Select(u => new StudentDto
                    {
                        Id = u.User.Id,
                        FullName = u.User.FullName,
                        Email = u.User.Email,
                        Gender = u.User.Gender,
                        PhoneNumber = u.User.PhoneNumber,
                        Address = u.User.Address,
                        Nationality = u.User.Nationality,
                        IdentificationNumber = u.User.IdentificationNumber,
                        IsActive = u.User.IsActive,
                        LastLoginTime = u.User.LastLoginTime
                    });

                var totalRecords = await query.CountAsync(); // Lấy tổng số bản ghi
                var students = await query
                    .ToListAsync();

                var totalItems = students.Count;

                int totalPages = (int)Math.Ceiling((double)totalItems / meta.PageSize);

                var metaData = new MetaDataResponse(meta.PageNumber, meta.PageSize, totalPages, totalItems);

                return ApiResponse<List<StudentDto>>.SuccessResponseWithMeta(students, metaData);
            }
            catch (Exception ex)
            {
                return ApiResponse<List<StudentDto>>.FailureResponse("An error occurred while retrieving students.", new List<string> { ex.Message });
            }
        }

        public async Task<ApiResponse<bool>> RemoveTutorFromMultipleStudentsAsync(RemoveTutorMultipleStudentsRequest request)
        {
            // Lấy Role ID của Student
            var studentRoleId = await _context.Roles
                .Where(r => r.Name == "Student")
                .Select(r => r.Id)
                .FirstOrDefaultAsync();

            // Lấy danh sách student hợp lệ (có vai trò Student)
            var validStudents = await _context.Users
                .Join(_context.UserRoles,
                      user => user.Id,
                      userRole => userRole.UserId,
                      (user, userRole) => new { user, userRole })
                .Where(joined => request.StudentIds.Contains(joined.user.Id) && joined.userRole.RoleId == studentRoleId)
                .Select(joined => joined.user.Id)
                .ToListAsync();

            if (!validStudents.Any())
                return ApiResponse<bool>.FailureResponse("No valid students found.");

            var existingAllocations = await _context.Allocations
                .Where(a => validStudents.Contains(a.StudentId) && a.TutorId == request.TutorId)
                .ToListAsync();

            if (!existingAllocations.Any())
                return ApiResponse<bool>.FailureResponse("No allocations found for the provided tutor and students.");

            _context.Allocations.RemoveRange(existingAllocations);
            await _context.SaveChangesAsync();

            return ApiResponse<bool>.SuccessResponse(true, "Tutor removed from multiple students successfully.");
        }

        public async Task<ApiResponse<List<AllocationResponse>>> GetAllAllocationsAsync(MetaDataResponse meta)
        {
            var allocations = await _context.Allocations
                .Include(a => a.Student)
                .Include(a => a.Tutor)
                .Include(a => a.AssignedUser)
                .OrderByDescending(a => a.AssignedAt)
                .Select(a => new AllocationResponse
                {
                    StudentId = a.StudentId,
                    StudentName = a.Student.Email,
                    TutorId = a.TutorId,
                    TutorName = a.Tutor.Email,
                    AssignedBy = a.AssignedBy,
                    AssignedByName = a.AssignedUser.Email,
                    AssignedAt = a.AssignedAt
                })
                .ToListAsync();

            var totalItems = allocations.Count;
            int totalPages = (int)Math.Ceiling((double)totalItems / meta.PageSize);
            var metaData = new MetaDataResponse(meta.PageNumber, meta.PageSize, totalPages, totalItems);

            return ApiResponse<List<AllocationResponse>>.SuccessResponseWithMeta(allocations, metaData);
        }

        public async Task<ApiResponse<bool>> RemoveAllocationsAsync(List<RemoveAllocation> allocations)
        {
            if (allocations == null || !allocations.Any())
                return ApiResponse<bool>.FailureResponse("No allocations provided.");

            var allocationPairs = allocations
                .Select(a => new { a.TutorId, a.StudentId })
                .ToList();

            var allAllocations = await _context.Allocations.ToListAsync();

            var allocationEntities = allAllocations
                .Where(a => allocationPairs.Any(req => req.TutorId == a.TutorId && req.StudentId == a.StudentId))
                .ToList();

            if (!allocationEntities.Any())
                return ApiResponse<bool>.FailureResponse("No matching allocations found.");

            _context.Allocations.RemoveRange(allocationEntities);
            await _context.SaveChangesAsync();

            return ApiResponse<bool>.SuccessResponse(true);
        }
        public async Task<ApiResponse<List<ChatRoomDto>>> GetAllChatroomsAsync(MetaResponse meta)
        {
            var query = _context.ChattingRooms
                .Select(cr => new ChatRoomDto
                {
                    Id = cr.Id,
                    StudentId = cr.StudentId,
                    TutorId = cr.TutorId,
                    CreatedAt = cr.CreatedAt,
                    // Lấy tên đầy đủ và email của học sinh
                    StudentName = _context.Users
                        .Where(u => u.Id == cr.StudentId)
                        .Select(u => u.FullName)
                        .FirstOrDefault(),
                    StudentEmail = _context.Users
                        .Where(u => u.Id == cr.StudentId)
                        .Select(u => u.Email)
                        .FirstOrDefault(),
                    // Lấy tên đầy đủ và email của gia sư
                    TutorName = _context.Users
                        .Where(u => u.Id == cr.TutorId)
                        .Select(u => u.FullName)
                        .FirstOrDefault(),
                    TutorEmail = _context.Users
                        .Where(u => u.Id == cr.TutorId)
                        .Select(u => u.Email)
                        .FirstOrDefault(),
                    NumberOfMessages = _context.Messages
                        .Count(m => m.ChatroomId == cr.Id && !m.IsDeleted),
                    LastActivity = _context.Messages
                        .Where(m => m.ChatroomId == cr.Id && !m.IsDeleted)
                        .Max(m => (DateTime?)m.Timestamp),
                    // Lấy MessageId của tin nhắn cuối cùng nếu có, ngược lại Guid.Empty
                    MessageId = _context.Messages
                        .Where(m => m.ChatroomId == cr.Id && !m.IsDeleted)
                        .OrderByDescending(m => m.Timestamp)
                        .Select(m => m.Id)
                        .FirstOrDefault(),
                    NumberOfReports = 0 // Gán cố định vì không có dữ liệu report
                });

            var totalItems = await query.CountAsync();
            int totalPages = (int)Math.Ceiling((double)totalItems / meta.PageSize);

            var chatrooms = await query
                .OrderByDescending(c => c.LastActivity)
                .Skip((meta.PageNumber - 1) * meta.PageSize)
                .Take(meta.PageSize)
                .ToListAsync();

            var metaData = new MetaDataResponse(meta.PageNumber, meta.PageSize, totalPages, totalItems);
            return ApiResponse<List<ChatRoomDto>>.SuccessResponseWithMeta(chatrooms, metaData);
        }

        public async Task<ApiResponse<MessageListResponse>> GetChatroomByIdAsync(Guid chatroomId)
        {
            var messages = await _context.Messages
                .Where(m => m.ChatroomId == chatroomId && !m.IsDeleted)
                .OrderBy(m => m.Timestamp)
                .Select(m => new MessageResponse
                {
                    Id = m.Id,
                    SenderId = m.SenderId,
                    ReceiverId = m.ReceiverId,
                    Content = m.Content,
                    Timestamp = m.Timestamp,
                    // Lấy thông tin của người gửi
                    SenderFullName = _context.Users
                        .Where(u => u.Id.ToString() == m.SenderId)
                        .Select(u => u.FullName)
                        .FirstOrDefault(),
                    SenderEmail = _context.Users
                        .Where(u => u.Id.ToString() == m.SenderId)
                        .Select(u => u.Email)
                        .FirstOrDefault(),
                    // Lấy thông tin của người nhận
                    ReceiverFullName = _context.Users
                        .Where(u => u.Id.ToString() == m.ReceiverId)
                        .Select(u => u.FullName)
                        .FirstOrDefault(),
                    ReceiverEmail = _context.Users
                        .Where(u => u.Id.ToString() == m.ReceiverId)
                        .Select(u => u.Email)
                        .FirstOrDefault()
                })
                .ToListAsync();

            if (messages == null || messages.Count == 0)
            {
                return ApiResponse<MessageListResponse>.FailureResponse("No messages found for the chatroom.");
            }

            var response = new MessageListResponse
            {
                TotalMessages = messages.Count,
                Messages = messages
            };

            return ApiResponse<MessageListResponse>.SuccessResponse(response);
        }

        public async Task<ApiResponse<bool>> UpdateChatroomStatusAsync(Guid chatroomId, bool isActive)
        {
            return ApiResponse<bool>.FailureResponse("Function under development");
            return ApiResponse<bool>.FailureResponse("Chat room status updates are not supported (ChattingRoom does not have a status column).");        }
        public async Task<ApiResponse<bool>> DeleteChatroomAsync(Guid chatroomId)
        {
            var chatRoom = await _context.ChattingRooms
                .FirstOrDefaultAsync(cr => cr.Id == chatroomId);


                if (chatRoom == null)
                    return ApiResponse<bool>.FailureResponse("Chat room not found.");
            _context.ChattingRooms.Remove(chatRoom);
            await _context.SaveChangesAsync();

            return ApiResponse<bool>.SuccessResponse(true, "Delete chatrooms success");
        }
    }
}

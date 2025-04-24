using ETutoring.Business.Dtos;
using ETutoring.Business.Dtos.Request.Moderator;
using ETutoring.Business.Dtos.Response.Message;
using ETutoring.Business.Dtos.Response.Moderator;
using ETutoring.Business.Dtos.Response.Students;
using ETutoring.Business.Dtos.Response.User;
using ETutoring.Business.Dtos.Students;
using ETutoring.Business.Interfaces.Moderator;
using ETutoring.Core.Common;
using ETutoring.Core.EmailTemplate;
using ETutoring.Core.Entities;
using ETutoring.DataAccess.Data;
using Microsoft.EntityFrameworkCore;
using System.Threading.Channels;
using ETutoring.Business.Interfaces.Message;

namespace ETutoring.DataAccess.Services.Moderator
{
    public class ModeratorService : IModeratorService
    {
        private readonly ApplicationDbContext _context;
        private readonly Channel<EmailTemplateRequest> _queue;
        private readonly IMessageService _messageService;

        public ModeratorService(ApplicationDbContext context, Channel<EmailTemplateRequest> queue, IMessageService messageService)
        {
            _context = context;
            _queue = queue;
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
            // Step 1: Get required roles
            var roles = await _context.Roles
                .Where(r => r.Name == "Student" || r.Name == "Tutor")
                .ToDictionaryAsync(r => r.Name, r => r.Id);

            if (!roles.TryGetValue("Tutor", out var tutorRoleId) ||
                !roles.TryGetValue("Student", out var studentRoleId))
            {
                return ApiResponse<bool>.FailureResponse("Roles not found.");
            }

            // Step 2: Validate tutor
            var isTutor = await _context.UserRoles.AnyAsync(ur => ur.UserId == request.TutorId && ur.RoleId == tutorRoleId);
            if (!isTutor)
                return ApiResponse<bool>.FailureResponse("Invalid Tutor.");

            var tutor = await _context.Users.FindAsync(request.TutorId);
            if (tutor == null)
                return ApiResponse<bool>.FailureResponse("Tutor not found.");

            // Step 3: Get valid students (must exist + have Student role)
            var validStudents = await _context.Users
                .Where(u => request.StudentIds.Contains(u.Id))
                .Join(_context.UserRoles.Where(ur => ur.RoleId == studentRoleId),
                      user => user.Id,
                      userRole => userRole.UserId,
                      (user, _) => user)
                .ToListAsync();

            if (!validStudents.Any())
                return ApiResponse<bool>.FailureResponse("No valid students found.");

            // Step 4: Remove existing allocations for those students
            var existingAllocations = await _context.Allocations
                .Where(a => validStudents.Select(s => s.Id).Contains(a.StudentId))
                .ToListAsync();

            _context.Allocations.RemoveRange(existingAllocations);

            // Step 5: Create new allocations and queue emails
            var now = DateTime.UtcNow;
            var newAllocations = validStudents.Select(student => new Allocation
            {
                StudentId = student.Id,
                TutorId = tutor.Id,
                AssignedBy = request.AssignedBy,
                AssignedAt = now
            }).ToList();

            _context.Allocations.AddRange(newAllocations);

            // Step 6: Queue emails to students
            var emailTasks = validStudents.Select(student =>
                _queue.Writer.WriteAsync(new EmailTemplateRequest(
                    student.Id,
                    student.Email,
                    "You have been assigned a new tutor!",
                    EmailTemplateType.StudentReceiveNewTutor,
                    new Dictionary<string, string>
                    {
                { "studentName", student.Email },
                { "TutorName", tutor.Email }
                    }
                )).AsTask()
            ).ToList();

            // Step 7: Queue email to tutor
            var studentListHtml = string.Join("", validStudents.Select(s => $"<li><strong>{s.Email}</strong></li>"));

            emailTasks.Add(_queue.Writer.WriteAsync(new EmailTemplateRequest(
                tutor.Id,
                tutor.Email,
                "You have been assigned new students!",
                EmailTemplateType.TutorAssignedToStudent,
                new Dictionary<string, string>
                {
            { "TutorName", tutor.Email },
            { "StudentCount", validStudents.Count.ToString() },
            { "StudentPlural", validStudents.Count > 1 ? "s" : "" },
            { "StudentList", studentListHtml }
                }
            )).AsTask());

            // Step 8: Save changes and send emails first
            await _context.SaveChangesAsync();
            await Task.WhenAll(emailTasks);

            // Step 9: Process chatroom assignments sequentially to avoid concurrency issues
            foreach (var student in validStudents)
            {
                try
                {
                    await _messageService.AssignChatroomAsync(new AssignChatroomRequest
                    {
                        StudentId = student.Id,
                        TutorId = tutor.Id
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[ERROR] AssignChatroomAsync failed for Student {student.Email}: {ex.Message}");
                }
            }

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

        public async Task<ApiResponse<List<ChatRoomDto>>> GetAllChatroomsAsync(MetaRequest meta)
        {
            // 1) Truy vấn mọi thứ với Guid → string
            var raw = await _context.ChattingRooms
                .Select(cr => new
                {
                    IdText = cr.Id.ToString(),
                    StudentIdText = cr.StudentId.ToString(),
                    TutorIdText = cr.TutorId.ToString(),
                    cr.CreatedAt,

                    StudentName = _context.Users
                        .Where(u => u.Id.ToString() == cr.StudentId.ToString())
                        .Select(u => u.FullName)
                        .FirstOrDefault(),
                    StudentEmail = _context.Users
                        .Where(u => u.Id.ToString() == cr.StudentId.ToString())
                        .Select(u => u.Email)
                        .FirstOrDefault(),
                    TutorName = _context.Users
                        .Where(u => u.Id.ToString() == cr.TutorId.ToString())
                        .Select(u => u.FullName)
                        .FirstOrDefault(),
                    TutorEmail = _context.Users
                        .Where(u => u.Id.ToString() == cr.TutorId.ToString())
                        .Select(u => u.Email)
                        .FirstOrDefault(),

                    NumberOfMessages = _context.Messages.Count(m =>
                        m.ChatroomId.HasValue
                        && m.ChatroomId.Value.ToString() == cr.Id.ToString()
                        && !m.IsDeleted
                    ),

                    LastActivity = _context.Messages
                        .Where(m =>
                            m.ChatroomId.HasValue
                            && m.ChatroomId.Value.ToString() == cr.Id.ToString()
                            && !m.IsDeleted
                        )
                        .Max(m => (DateTime?)m.Timestamp),

                    MessageIdText = _context.Messages
                        .Where(m =>
                            m.ChatroomId.HasValue
                            && m.ChatroomId.Value.ToString() == cr.Id.ToString()
                            && !m.IsDeleted
                        )
                        .OrderByDescending(m => m.Timestamp)
                        .Select(m => m.Id.ToString())
                        .FirstOrDefault()
                })
                .AsNoTracking()
                .ToListAsync();

            // 2) Map in-memory string → Guid và paging/order
            var dtos = raw
                .Select(r => new ChatRoomDto
                {
                    Id = Guid.Parse(r.IdText),
                    StudentId = Guid.Parse(r.StudentIdText),
                    TutorId = Guid.Parse(r.TutorIdText),
                    CreatedAt = r.CreatedAt,
                    StudentName = r.StudentName,
                    StudentEmail = r.StudentEmail,
                    TutorName = r.TutorName,
                    TutorEmail = r.TutorEmail,
                    NumberOfMessages = r.NumberOfMessages,
                    LastActivity = r.LastActivity,
                    MessageId = string.IsNullOrEmpty(r.MessageIdText)
                                        ? Guid.Empty
                                        : Guid.Parse(r.MessageIdText),
                    NumberOfReports = 0
                })
                .OrderByDescending(d => d.LastActivity)
                .ToList();

            var totalItems = dtos.Count;
            var totalPages = (int)Math.Ceiling((double)totalItems / meta.PageSize);
            var paged = dtos
                .Skip((meta.PageNumber - 1) * meta.PageSize)
                .Take(meta.PageSize)
                .ToList();

            var metaData = new MetaDataResponse(meta.PageNumber, meta.PageSize, totalPages, totalItems);
            return ApiResponse<List<ChatRoomDto>>.SuccessResponseWithMeta(paged, metaData);
        }


        public async Task<ApiResponse<MessageListResponse>> GetChatroomByIdAsync(Guid chatroomId)
        {
            var idText = chatroomId.ToString();

            // 1) Lấy messages với Guid → string
            var msgsRaw = await _context.Messages
                .Where(m =>
                    m.ChatroomId.HasValue &&
                    m.ChatroomId.Value.ToString() == idText &&
                    !m.IsDeleted
                )
                .Select(m => new
                {
                    IdText = m.Id.ToString(),
                    SenderIdText = m.SenderId.ToString(),
                    ReceiverIdText = m.ReceiverId.ToString(),
                    m.Content,
                    m.Timestamp
                })
                .AsNoTracking()
                .ToListAsync();

            if (!msgsRaw.Any())
                return ApiResponse<MessageListResponse>.FailureResponse("No messages found for the chatroom.");

            // 2) Lấy danh sách user liên quan (in-memory)
            var userIds = msgsRaw
                .SelectMany(m => new[] { m.SenderIdText, m.ReceiverIdText })
                .Distinct()
                .ToList();

            var usersRaw = await _context.Users
                .Where(u => userIds.Contains(u.Id.ToString()))
                .Select(u => new
                {
                    IdText = u.Id.ToString(),
                    u.FullName,
                    u.Email
                })
                .AsNoTracking()
                .ToListAsync();

            var userDict = usersRaw.ToDictionary(u => u.IdText, u => u);

            // 3) Map in-memory sang DTO
            var messages = msgsRaw
                .OrderBy(m => m.Timestamp)
                .Select(m =>
                {
                    userDict.TryGetValue(m.SenderIdText, out var s);
                    userDict.TryGetValue(m.ReceiverIdText, out var r);
                    return new MessageResponse
                    {
                        Id = Guid.Parse(m.IdText),
                        SenderId = Guid.Parse(m.SenderIdText),
                        ReceiverId = Guid.Parse(m.ReceiverIdText),
                        Content = m.Content,
                        Timestamp = m.Timestamp,
                        SenderFullName = s?.FullName,
                        SenderEmail = s?.Email,
                        ReceiverFullName = r?.FullName,
                        ReceiverEmail = r?.Email
                    };
                })
                .ToList();

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
        }

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

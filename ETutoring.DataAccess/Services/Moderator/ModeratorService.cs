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

namespace ETutoring.DataAccess.Services.Moderator
{
    public class ModeratorService : IModeratorService
    {
        private readonly ApplicationDbContext _context;

        public ModeratorService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<List<UserDto>>> GetAllTutorsAsync(int page, int size)
        {
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();

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
                .Skip((page - 1) * size)
                .Take(size)
                .ToListAsync();

            stopwatch.Stop();

            return ApiResponse<List<UserDto>>.SuccessResponse(tutors, "Tutors retrieved successfully.");
        }

        public async Task<ApiResponse<bool>> AssignTutorToMultipleStudentsAsync(List<Guid> studentIds, Guid tutorId, Guid assignedBy)
        {
            var studentRoleId = await _context.Roles
                .Where(r => r.Name == "Student")
                .Select(r => r.Id)
                .FirstOrDefaultAsync();

            var tutorRoleId = await _context.Roles
                .Where(r => r.Name == "Tutor")
                .Select(r => r.Id)
                .FirstOrDefaultAsync();

            var isTutor = await _context.UserRoles.AnyAsync(ur => ur.UserId == tutorId && ur.RoleId == tutorRoleId);
            if (!isTutor)
                return ApiResponse<bool>.FailureResponse("Invalid Tutor.");

            var validStudents = await _context.Users
                .Join(_context.UserRoles,
                    user => user.Id,
                    userRole => userRole.UserId,
                    (user, userRole) => new { user, userRole })
                .Where(joined => studentIds.Contains(joined.user.Id) && joined.userRole.RoleId == studentRoleId)
                .Select(joined => joined.user.Id)
                .ToListAsync();

            if (!validStudents.Any())
                return ApiResponse<bool>.FailureResponse("No valid students found.");

            var existingAssignments = await _context.StudentTutorManagements
                .Where(stm => validStudents.Contains(stm.StudentId))
                .ToListAsync();

            foreach (var studentId in validStudents)
            {
                var existingManagement = existingAssignments.FirstOrDefault(stm => stm.StudentId == studentId);
                string action = existingManagement != null ? "Reassigned" : "Assigned";

                if (existingManagement != null)
                {
                    _context.StudentTutorManagementHistories.Add(new StudentTutorManagementHistory
                    {
                        StudentTutorManagementId = existingManagement.Id,
                        StudentId = studentId,
                        TutorId = existingManagement.TutorId,
                        AssignedBy = assignedBy,
                        AssignedAt = DateTime.UtcNow,
                        Action = "Reassigned"
                    });

                    existingManagement.TutorId = tutorId;
                    _context.StudentTutorManagements.Update(existingManagement);
                }
                else
                {
                    var newManagement = new StudentTutorManagement
                    {
                        StudentId = studentId,
                        TutorId = tutorId,
                        AssignedBy = assignedBy,
                        AssignedAt = DateTime.UtcNow,
                        Action = "Assigned"
                    };

                    _context.StudentTutorManagements.Add(newManagement);
                }

                _context.StudentTutorManagementHistories.Add(new StudentTutorManagementHistory
                {
                    StudentTutorManagementId = existingManagement?.Id ?? Guid.NewGuid(),
                    StudentId = studentId,
                    TutorId = tutorId,
                    AssignedBy = assignedBy,
                    AssignedAt = DateTime.UtcNow,
                    Action = action
                });
            }

            await _context.SaveChangesAsync();

            return ApiResponse<bool>.SuccessResponse(true, "Tutor assigned to multiple students successfully.");
        }

        public async Task<ApiResponse<List<UserDto>>> GetAllTutorsStudentsAsync(int page, int size)
        {
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();

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
                .Skip((page - 1) * size)
                .Take(size)
                .ToListAsync();

            stopwatch.Stop();

            return ApiResponse<List<UserDto>>.SuccessResponse(users, "Tutors and Students retrieved successfully.");
        }

        public async Task<ApiResponse<List<StudentTutorManagementHistoryResponse>>> GetManagementHistoryAsync(int page, int size)
        {
            var stopwatch = Stopwatch.StartNew();
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
                .Skip((page - 1) * size)
                .Take(size)
                .ToListAsync();

            return ApiResponse<List<StudentTutorManagementHistoryResponse>>.SuccessResponse(history, "Management history retrieved successfully.");
        }

        public async Task<ApiResponse<List<StudentTutorManagementHistoryResponse>>> GetDetailsManagementHistoryAsync(Guid studentTutorManagementId)
        {
            var stopwatch = Stopwatch.StartNew();

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

            stopwatch.Stop();

            if (!history.Any())
                return ApiResponse<List<StudentTutorManagementHistoryResponse>>.FailureResponse("No history found for the given assignment.");

            return ApiResponse<List<StudentTutorManagementHistoryResponse>>.SuccessResponse(history, "Assignment history retrieved successfully.");
        }

        public async Task<ApiResponse<List<StudentDto>>> GetAllStudentsAsync(int page, int size)
        {
            var stopwatch = Stopwatch.StartNew();
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
                    .Skip((page - 1) * size)
                    .Take(size)
                    .ToListAsync();

                stopwatch.Stop();
                return ApiResponse<List<StudentDto>>.SuccessResponse(students, "Students retrieved successfully.");
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                return ApiResponse<List<StudentDto>>.FailureResponse("An error occurred while retrieving students.", new List<string> { ex.Message });
            }
        }
    }
}

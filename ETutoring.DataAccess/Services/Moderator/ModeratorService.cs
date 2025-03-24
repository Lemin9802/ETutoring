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

namespace ETutoring.DataAccess.Services.Moderator
{
    public class ModeratorService : IModeratorService
    {
        private readonly ApplicationDbContext _context;

        public ModeratorService(ApplicationDbContext context)
        {
            _context = context;
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
            // Lấy Role ID của Student và Tutor
            var studentRoleId = await _context.Roles
                .Where(r => r.Name == "Student")
                .Select(r => r.Id)
                .FirstOrDefaultAsync();

            var tutorRoleId = await _context.Roles
                .Where(r => r.Name == "Tutor")
                .Select(r => r.Id)
                .FirstOrDefaultAsync();

            // Kiểm tra tutor có vai trò Tutor không
            var isTutor = await _context.UserRoles.AnyAsync(ur => ur.UserId == request.TutorId && ur.RoleId == tutorRoleId);
            if (!isTutor)
                return ApiResponse<bool>.FailureResponse("Invalid Tutor.");

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
                .Where(a => validStudents.Contains(a.StudentId))
                .ToListAsync();

            foreach (var studentId in validStudents)
            {
                var existingAllocation = existingAllocations.FirstOrDefault(a => a.StudentId == studentId);

                if (existingAllocation != null)
                {
                    existingAllocation.TutorId = request.TutorId;
                    existingAllocation.AssignedBy = request.AssignedBy;
                    existingAllocation.AssignedAt = DateTime.UtcNow;
                    _context.Allocations.Update(existingAllocation);
                }
                else
                {
                    var newAllocation = new Allocation
                    {
                        StudentId = studentId,
                        TutorId = request.TutorId,
                        AssignedBy = request.AssignedBy,
                        AssignedAt = DateTime.UtcNow
                    };
                    _context.Allocations.Add(newAllocation);
                }
            }

            await _context.SaveChangesAsync();

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

    }
}

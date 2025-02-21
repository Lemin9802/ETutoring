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
using StudentTutorStatusResponse = ETutoring.Business.Dtos.Response.Moderator.StudentTutorStatusResponse;

namespace ETutoring.DataAccess.Services.Moderator
{
    public class ModeratorService : IModeratorService
    {
        private readonly ApplicationDbContext _context;

        public ModeratorService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<BaseResponse> GetAllStudentsAsync(StudentTutorStatusRequest request)
        {
            var stopwatch = Stopwatch.StartNew();

            var studentRoleId = await _context.Roles
                .Where(r => r.Name == "Student")
                .Select(r => r.Id)
                .FirstOrDefaultAsync();

            var query = from student in _context.Users
                        join userRole in _context.UserRoles on student.Id equals userRole.UserId
                        join studentTutor in _context.StudentTutorManagements on student.Id equals studentTutor.StudentId into tutorMapping
                        from studentTutor in tutorMapping.DefaultIfEmpty()
                        where userRole.RoleId == studentRoleId
                        select new StudentTutorStatusResponse
                        {
                            Id = student.Id,
                            FullName = student.FullName,
                            Address = student.Address,
                            PhoneNumber = student.PhoneNumber,
                            Email = student.Email,
                            HasTutor = studentTutor != null
                        };

            if (request.HasTutor.HasValue)
            {
                query = query.Where(s => s.HasTutor == request.HasTutor.Value);
            }

            var students = await query.Skip((request.Page - 1) * request.Size).Take(request.Size).ToListAsync();
            stopwatch.Stop();

            return new BaseResponse(200, "Students retrieved successfully.", students, stopwatch.ElapsedMilliseconds);
        }

        public async Task<BaseResponse> AssignTutorToStudentAsync(Guid studentId, Guid tutorId, Guid assignedBy)
        {
            var studentRoleId = await _context.Roles
                .Where(r => r.Name == "Student")
                .Select(r => r.Id)
                .FirstOrDefaultAsync();

            var tutorRoleId = await _context.Roles
                .Where(r => r.Name == "Tutor")
                .Select(r => r.Id)
                .FirstOrDefaultAsync();

            var isStudent = await _context.UserRoles.AnyAsync(ur => ur.UserId == studentId && ur.RoleId == studentRoleId);
            var isTutor = await _context.UserRoles.AnyAsync(ur => ur.UserId == tutorId && ur.RoleId == tutorRoleId);

            if (!isStudent || !isTutor)
                return new BaseResponse(400, "Invalid Student or Tutor.");

            var existingManagement = await _context.StudentTutorManagements
                .FirstOrDefaultAsync(st => st.StudentId == studentId);

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

            await _context.SaveChangesAsync();

            return new BaseResponse(200, "Tutor assigned successfully.");
        }

        public async Task<BaseResponse> GetManagementHistoryAsync(BaseRequest request)
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
                .Skip((request.Page - 1) * request.Size)
                .Take(request.Size)
                .ToListAsync();

            stopwatch.Stop();
            return new BaseResponse(200, "Management history retrieved successfully.", history, stopwatch.ElapsedMilliseconds);
        }

        public async Task<BaseResponse> ReassignTutorToStudentAsync(ReassignStudentToTutorRequest request)
        {
            var existingAssignment = await _context.StudentTutorManagements.FirstOrDefaultAsync(st => st.StudentId == request.StudentId);

            if (existingAssignment == null)
                return new BaseResponse(400, "Student does not have a tutor assigned.");

            existingAssignment.TutorId = request.TutorId;
            existingAssignment.AssignedBy = request.AssignedBy;
            existingAssignment.AssignedAt = DateTime.UtcNow;

            _context.StudentTutorManagements.Update(existingAssignment);
            await _context.SaveChangesAsync();

            return new BaseResponse(200, "Tutor reassigned successfully.");
        }

        public async Task<BaseResponse> GetDetailsManagementHistoryAsync(Guid studentTutorManagementId)
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
                return new BaseResponse(404, "No history found for the given assignment.", null, stopwatch.ElapsedMilliseconds);

            return new BaseResponse(200, "Assignment history retrieved successfully.", history, stopwatch.ElapsedMilliseconds);
        }

        public async Task<BaseResponse> GetAllStudentsAsync(BaseRequest request)
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

                var students = await query
                    .Skip((request.Page - 1) * request.Size)
                    .Take(request.Size)
                    .ToListAsync();

                stopwatch.Stop();
                return new StudentsResponse(200, "Students retrieved successfully.", students, stopwatch.ElapsedMilliseconds);
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                return new BaseResponse(500, "An error occurred while retrieving students.", ex.Message, stopwatch.ElapsedMilliseconds);
            }
        }
    }
}

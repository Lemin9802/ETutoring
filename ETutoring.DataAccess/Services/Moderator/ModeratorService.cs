using ETutoring.Business.Dtos.Students;
using ETutoring.Core.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ETutoring.Business.Interfaces.Moderator;
using ETutoring.DataAccess.Data;

namespace ETutoring.DataAccess.Services.Moderator
{
    public class ModeratorService : IModeratorService
    {
        private readonly ApplicationDbContext _context;

        public ModeratorService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<StudentTutorStatusResponse>> GetAllStudentsAsync(bool? hasTutor)
        {
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

            // Filter based on request parameter (true = with tutor, false = without tutor, null = all students)
            if (hasTutor.HasValue)
            {
                query = query.Where(s => s.HasTutor == hasTutor.Value);
            }

            return await query.ToListAsync();
        }

        public async Task<bool> AssignTutorToStudentAsync(Guid studentId, Guid tutorId, Guid assignedBy)
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
                return false;

            var existingManagement = await _context.StudentTutorManagements
                .FirstOrDefaultAsync(st => st.StudentId == studentId);

            string action = existingManagement != null ? "Reassigned" : "Assigned";

            if (existingManagement != null)
            {
                // Ghi vào history trước khi cập nhật tutor mới
                _context.StudentTutorManagementHistories.Add(new StudentTutorManagementHistory
                {
                    StudentTutorManagementId = existingManagement.Id,
                    StudentId = studentId,
                    TutorId = existingManagement.TutorId,
                    AssignedBy = assignedBy,
                    AssignedAt = DateTime.UtcNow,
                    Action = "Reassigned"
                });

                // Cập nhật tutor mới
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

            // Lưu vào history cho bản ghi mới nhất
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

            return true;
        }

        public async Task<List<StudentTutorManagementHistoryResponse>> GetManagementHistoryAsync()
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

            return history;
        }

        public async Task<List<StudentTutorManagementHistoryResponse>> GetManagementHistoryAsync(Guid studentTutorManagementId)
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

            return history;
        }


    }
}

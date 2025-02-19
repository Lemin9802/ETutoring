using ETutoring.Business.Interfaces;
using ETutoring.DataAccess.Data;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ETutoring.Business.Dtos.Students;
using Microsoft.EntityFrameworkCore;
using ETutoring.Core.Entities;

namespace ETutoring.DataAccess.Services
{
    public class StudentService : IStudentService
    {
        private readonly ApplicationDbContext _context;

        public StudentService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<StudentTutorStatusResponse>> GetAllStudentsWithTutorStatusAsync()
        {
            var studentRoleId = await _context.Roles
                .Where(r => r.Name == "Student")
                .Select(r => r.Id)
                .FirstOrDefaultAsync();

            var studentsWithTutors = await (
                from student in _context.Users
                join userRole in _context.UserRoles on student.Id equals userRole.UserId
                join studentTutor in _context.ManageStudentTutors on student.Id equals studentTutor.StudentId into tutorMapping
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
                }
            ).ToListAsync();

            return studentsWithTutors;
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

            var existingAssignment = await _context.ManageStudentTutors
                .FirstOrDefaultAsync(st => st.StudentId == studentId);

            if (existingAssignment != null)
                return false;

            var assignment = new ManageStudentTutor
            {
                StudentId = studentId,
                TutorId = tutorId,
                AssignedBy = assignedBy
            };

            _context.ManageStudentTutors.Add(assignment);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}

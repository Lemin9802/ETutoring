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
using ETutoring.DataAccess.Migrations;
using ETutoring.Business.Interfaces.Students;

namespace ETutoring.DataAccess.Services.Students
{
    public class StudentService : IStudentService
    {
        private readonly ApplicationDbContext _context;

        public StudentService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<StudentTutorResponse>> GetTutorsForStudentAsync(Guid studentId)
        {
            var tutors = await (
                from management in _context.StudentTutorManagements
                join tutor in _context.Users on management.TutorId equals tutor.Id
                where management.StudentId == studentId
                select new StudentTutorResponse
                {
                    TutorId = tutor.Id,
                    TutorName = tutor.FullName,
                    AssignedAt = management.AssignedAt,
                    AssignedBy = management.AssignedBy
                }
            ).ToListAsync();

            return tutors;
        }
    }
}

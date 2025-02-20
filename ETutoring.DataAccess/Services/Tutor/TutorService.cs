using ETutoring.Business.Dtos.Students;
using ETutoring.DataAccess.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ETutoring.Business.Interfaces.Tutor;

namespace ETutoring.DataAccess.Services.Tutor
{
    public class TutorService : ITutorService
    {
        private readonly ApplicationDbContext _context;

        public TutorService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<StudentTutorResponse>> GetStudentsForTutorAsync(Guid tutorId)
        {
            var students = await (
            from management in _context.StudentTutorManagements
                join student in _context.Users on management.StudentId equals student.Id
                where management.TutorId == tutorId
                select new StudentTutorResponse
                {
                    StudentId = student.Id,
                    StudentName = student.FullName,
                    AssignedAt = management.AssignedAt,
                    AssignedBy = management.AssignedBy
                }
            ).ToListAsync();

            return students;
        }
    }
}

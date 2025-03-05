using ETutoring.Business.Dtos.Response.Moderator;
using ETutoring.Business.Exceptions;
using ETutoring.Business.Interfaces.Students;
using ETutoring.Core.Common;
using ETutoring.DataAccess.Data;
using Microsoft.EntityFrameworkCore;

namespace ETutoring.DataAccess.Services.Students
{
    public class StudentService : IStudentService
    {
        private readonly ApplicationDbContext _context;

        public StudentService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<IEnumerable<StudentTutorResponse>>> GetTutorsForStudentAsync(Guid studentId)
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

            if (!tutors.Any())
                throw new EntityNotHaveDataException("Student", studentId);

            return ApiResponse<IEnumerable<StudentTutorResponse>>.SuccessResponse(tutors);
        }
    }
}

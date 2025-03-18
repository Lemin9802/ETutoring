using ETutoring.Business.Dtos.Response.Tutor;
using ETutoring.Business.Exceptions;
using ETutoring.Business.Interfaces.Tutor;
using ETutoring.Core.Common;
using ETutoring.DataAccess.Data;
using Microsoft.EntityFrameworkCore;

namespace ETutoring.DataAccess.Services.Tutor
{
    public class TutorService : ITutorService
    {
        private readonly ApplicationDbContext _context;

        public TutorService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<List<GetStudentsForTutorResponse>>> GetStudentsForTutorAsync(Guid tutorId, int page, int size)
        {
            var students = await _context.StudentTutorManagements
                .Where(management => management.TutorId == tutorId)
                .Join(_context.Users,
                    management => management.StudentId,
                    student => student.Id,
                    (management, student) => new GetStudentsForTutorResponse
                    {
                        StudentId = student.Id,
                        FullName = student.FullName,
                        Address = student.Address,
                        PhoneNumber = student.PhoneNumber,
                        Email = student.Email
                    })
                .Skip((page - 1) * size)
                .Take(size)
                .ToListAsync();

            if (!students.Any())
                throw new EntityNotYetHaveDataException("This tutor does not have any students assigned");

            return ApiResponse<List<GetStudentsForTutorResponse>>.SuccessResponse(students, "Students retrieved successfully.");

        }
    }
}

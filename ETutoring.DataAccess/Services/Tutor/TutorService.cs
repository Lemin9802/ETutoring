using ETutoring.DataAccess.Data;
using Microsoft.EntityFrameworkCore;
using ETutoring.Business.Interfaces.Tutor;
using ETutoring.Business.Dtos.Response;
using System.Diagnostics;
using System.Net;
using ETutoring.Business.Dtos.Response.Moderator;
using ETutoring.Business.Dtos.Response.Tutor;
using ETutoring.Core.Common;

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
            try
            {
                var students = await (
                        from management in _context.StudentTutorManagements
                        join student in _context.Users on management.StudentId equals student.Id
                        where management.TutorId == tutorId
                        select new GetStudentsForTutorResponse
                        {
                            StudentId = student.Id,
                            FullName = student.FullName,
                            Address = student.Address,
                            PhoneNumber = student.PhoneNumber,
                            Email = student.Email
                        }
                    ).Skip((page - 1) * size)
                    .Take(size)
                    .ToListAsync();

                if (!students.Any())
                    return ApiResponse<List<GetStudentsForTutorResponse>>.FailureResponse("This tutor does not have any students assigned.");

                return ApiResponse<List<GetStudentsForTutorResponse>>.SuccessResponse(students, "Students retrieved successfully.");
            }
            catch (Exception ex)
            {
                return ApiResponse<List<GetStudentsForTutorResponse>>.FailureResponse($"An error occurred while retrieving students: {ex.Message}");
            }
        }
    }
}

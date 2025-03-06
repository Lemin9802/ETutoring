using ETutoring.DataAccess.Data;
using Microsoft.EntityFrameworkCore;
using ETutoring.Business.Interfaces.Students;
using ETutoring.Business.Dtos.Response;
using System.Diagnostics;
using System.Net;
using ETutoring.Business.Dtos.Response.Moderator;
using ETutoring.Business.Dtos.Response.Students;
using ETutoring.Core.Common;

namespace ETutoring.DataAccess.Services.Students
{
    public class StudentService : IStudentService
    {
        private readonly ApplicationDbContext _context;

        public StudentService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<List<GetTutorForStudentResponse>>> GetTutorsForStudentAsync(Guid studentId)
        {
            var stopwatch = Stopwatch.StartNew();
            try
            {
                var tutors = await (
                    from management in _context.StudentTutorManagements
                    join tutor in _context.Users on management.TutorId equals tutor.Id
                    where management.StudentId == studentId
                    select new GetTutorForStudentResponse
                    {
                        TutorId = tutor.Id,
                        FullName = tutor.FullName,
                        Address = tutor.Address,
                        PhoneNumber = tutor.PhoneNumber,
                        Email = tutor.Email
                    }
                ).ToListAsync();

                stopwatch.Stop();

                if (!tutors.Any())
                    return ApiResponse<List<GetTutorForStudentResponse>>.FailureResponse("This student does not have any tutors assigned.");

                return ApiResponse<List<GetTutorForStudentResponse>>.SuccessResponse(tutors, "Tutors retrieved successfully.");
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                return ApiResponse<List<GetTutorForStudentResponse>>.FailureResponse($"An error occurred while retrieving tutors: {ex.Message}");
            }
        }
    }
}


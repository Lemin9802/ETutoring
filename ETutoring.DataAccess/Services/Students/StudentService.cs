using ETutoring.DataAccess.Data;
using Microsoft.EntityFrameworkCore;
using ETutoring.Business.Interfaces.Students;
using ETutoring.Business.Dtos.Response;
using System.Diagnostics;
using System.Net;
using ETutoring.Business.Dtos.Response.Moderator;

namespace ETutoring.DataAccess.Services.Students
{
    public class StudentService : IStudentService
    {
        private readonly ApplicationDbContext _context;

        public StudentService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<BaseResponse> GetTutorsForStudentAsync(Guid studentId)
        {
            var stopwatch = Stopwatch.StartNew();
            try
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

                stopwatch.Stop();

                if (!tutors.Any())
                    return new BaseResponse(HttpStatusCode.NotFound.GetHashCode(),
                        "This student does not have any tutors assigned.",
                        null,
                        stopwatch.ElapsedMilliseconds);

                return new BaseResponse(HttpStatusCode.OK.GetHashCode(),
                    "Tutors retrieved successfully.",
                    tutors,
                    stopwatch.ElapsedMilliseconds);
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                return new BaseResponse(HttpStatusCode.InternalServerError.GetHashCode(),
                    "An error occurred while retrieving tutors.",
                    ex.Message,
                    stopwatch.ElapsedMilliseconds);
            }
        }
    }
}

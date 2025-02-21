using ETutoring.DataAccess.Data;
using Microsoft.EntityFrameworkCore;
using ETutoring.Business.Interfaces.Tutor;
using ETutoring.Business.Dtos.Response;
using System.Diagnostics;
using System.Net;
using ETutoring.Business.Dtos.Response.Moderator;

namespace ETutoring.DataAccess.Services.Tutor
{
    public class TutorService : ITutorService
    {
        private readonly ApplicationDbContext _context;

        public TutorService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<BaseResponse> GetStudentsForTutorAsync(Guid tutorId)
        {
            var stopwatch = Stopwatch.StartNew();
            try
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

                stopwatch.Stop();

                if (!students.Any())
                    return new BaseResponse(HttpStatusCode.NotFound.GetHashCode(),
                        "This tutor does not have any students assigned.",
                        null,
                        stopwatch.ElapsedMilliseconds);

                return new BaseResponse(HttpStatusCode.OK.GetHashCode(),
                    "Students retrieved successfully.",
                    students,
                    stopwatch.ElapsedMilliseconds);
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                return new BaseResponse(HttpStatusCode.InternalServerError.GetHashCode(),
                    "An error occurred while retrieving students.",
                    ex.Message,
                    stopwatch.ElapsedMilliseconds);
            }
        }
    }
}

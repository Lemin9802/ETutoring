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

        public async Task<ApiResponse<List<GetStudentsForTutorResponse>>> GetStudentsForTutorAsync(Guid tutorId, MetaDataResponse meta)
        {
            var studentsQuery = _context.Allocations
                .Where(a => a.TutorId == tutorId)
                .Include(a => a.Student)
                .Select(a => new GetStudentsForTutorResponse
                {
                    StudentId = a.Student.Id,
                    FullName = a.Student.FullName,
                    Address = a.Student.Address,
                    PhoneNumber = a.Student.PhoneNumber,
                    Email = a.Student.Email
                });

            var totalItems = await studentsQuery.CountAsync();
            var totalPages = (int)Math.Ceiling((double)totalItems / meta.PageSize);
            var metaData = new MetaDataResponse(meta.PageNumber, meta.PageSize, totalPages, totalItems);

            var students = await studentsQuery
                .Skip((meta.PageNumber - 1) * meta.PageSize)
                .Take(meta.PageSize)
                .ToListAsync();

            if (!students.Any())
                return ApiResponse<List<GetStudentsForTutorResponse>>.FailureResponse("This tutor does not have any students assigned");

            return ApiResponse<List<GetStudentsForTutorResponse>>.SuccessResponseWithMeta(students, metaData);
        }
    }
}

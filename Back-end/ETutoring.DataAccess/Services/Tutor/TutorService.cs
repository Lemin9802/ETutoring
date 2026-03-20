using ETutoring.Business.Dtos.Request.Tutor;
using ETutoring.Business.Dtos.Response.Tutor;
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

        public async Task<ApiResponse<List<GetStudentsForTutorResponse>>> GetStudentsForTutorAsync(Guid tutorId, MetaDataResponse meta, string search, Filter? filters)
        {
            var isActiveState = filters.Status?.ToLower() switch
            {
                "active" => true,
                "inactive" => false,
                _ => (bool?)null // covers "all", null, or any other input
            };

            // Assign date range if valid
            DateTime? fromDate = null;
            DateTime? toDate = null;
            if (filters.LoginDateRange?.Length == 2)
            {
                fromDate = filters.LoginDateRange[0];
                toDate = filters.LoginDateRange[1];
            }


            var studentsQuery = _context.Allocations
                .Where(a => a.TutorId == tutorId)
                .Include(a => a.Student)
                .Where(a => string.IsNullOrWhiteSpace(search) || a.Student.Email.Contains(search))
                .Where(a => !isActiveState.HasValue || a.Student.IsActive == isActiveState.Value)
                .Where(a =>
                    (!fromDate.HasValue || a.Student.LastLoginTime >= fromDate.Value) &&
                    (!toDate.HasValue || a.Student.LastLoginTime <= toDate.Value))
                .Select(a => new GetStudentsForTutorResponse
                {
                    StudentId = a.Student.Id,
                    FullName = a.Student.FullName,
                    Address = a.Student.Address,
                    PhoneNumber = a.Student.PhoneNumber,
                    Email = a.Student.Email,
                    LastLogin = a.Student.LastLoginTime,
                    Status = a.Student.IsActive ? "active" : "inactive"
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

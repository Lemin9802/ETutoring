using ETutoring.Business.Dtos.Response.Moderator;
using ETutoring.Business.Exceptions;
using ETutoring.Business.Interfaces.Students;
using Microsoft.EntityFrameworkCore;
using ETutoring.Business.Dtos.Response;
using System.Diagnostics;
using System.Net;
using ETutoring.Business.Dtos.Response.Moderator;
using ETutoring.Business.Dtos.Response.Students;
using ETutoring.Core.Common;
using ETutoring.DataAccess.Data;

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
            try
            {
                var tutors = await _context.Allocations
                    .Where(a => a.StudentId == studentId)
                    .Join(
                        _context.Users,
                        allocation => allocation.TutorId,
                        user => user.Id,
                        (allocation, tutor) => new GetTutorForStudentResponse
                        {
                            TutorId = tutor.Id,
                            FullName = tutor.FullName,
                            Address = tutor.Address,
                            PhoneNumber = tutor.PhoneNumber,
                            Email = tutor.Email
                        }
                    )
                    .ToListAsync();

                if (!tutors.Any())
                {
                    return ApiResponse<List<GetTutorForStudentResponse>>.FailureResponse("Sinh viên này chưa được phân tutor.");
                }

                return ApiResponse<List<GetTutorForStudentResponse>>.SuccessResponse(tutors, "Lấy danh sách tutor thành công.");
            }
            catch (Exception ex)
            {
                return ApiResponse<List<GetTutorForStudentResponse>>.FailureResponse($"Đã có lỗi khi lấy danh sách tutor: {ex.Message}");
            }
        }
    }
}


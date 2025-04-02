using ETutoring.Business.Dtos.Response;
using ETutoring.Business.Interfaces;
using ETutoring.DataAccess.Data;
using Microsoft.EntityFrameworkCore;

namespace ETutoring.DataAccess.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly ApplicationDbContext _context;

        public DashboardService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardDataDto> GetDashboardDataAsync()
        {
            var totalStudents = await _context.UserRoles
                .Join(_context.Roles,
                    ur => ur.RoleId,
                    r => r.Id,
                    (ur, r) => new { ur, r })
                .Where(x => x.r.Name == "Student")
                .Select(x => x.ur.UserId)
                .Distinct()
                .CountAsync();

            // Lấy số lượng gia sư (Tutor) sử dụng method syntax
            var totalTutors = await _context.UserRoles
                .Join(_context.Roles,
                    ur => ur.RoleId,
                    r => r.Id,
                    (ur, r) => new { ur, r })
                .Where(x => x.r.Name == "Tutor")
                .Select(x => x.ur.UserId)
                .Distinct()
                .CountAsync();

            return new DashboardDataDto
            {
                TotalStudents = totalStudents,
                TotalTutors = totalTutors
            };
        }
    }
}

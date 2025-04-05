using ETutoring.Business.Dtos;
using ETutoring.Business.Interfaces;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ETutoring.DataAccess.Data;

namespace ETutoring.DataAccess.Services
{
    public class RoleService : IRoleService
    {
        private readonly ApplicationDbContext _context;

        public RoleService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<IdentityRole<Guid>>> GetRolesAsync(MetaRequest request)
        {
            var query = _context.Roles
                .Where(role => role.Name != null && role.Name.ToLower() != "admin")
                .AsQueryable();

            var roles = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            return roles;
        }
    }
}

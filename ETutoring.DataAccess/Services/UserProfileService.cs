using ETutoring.Core.Entities;
using ETutoring.DataAccess.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ETutoring.Business.Dtos.Auth;
using Microsoft.EntityFrameworkCore;

namespace ETutoring.DataAccess.Services
{
    public class UserProfileService : IUserProfileService
    {
        private readonly ApplicationDbContext _context;

        public UserProfileService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ApplicationUser?> GetUserProfileAsync(Guid userId)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        }

        public async Task<ApplicationUser?> UpdateUserProfileAsync(Guid userId, UpdateProfileRequest model)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                return null;

            user.FullName = model.FullName ?? user.FullName;
            user.Address = model.Address ?? user.Address;
            user.PhoneNumber = model.PhoneNumber ?? user.PhoneNumber;
            user.ProfilePicture = model.ProfilePicture ?? user.ProfilePicture;
            user.Gender = model.Gender ?? user.Gender;
            user.Nationality = model.Nationality ?? user.Nationality;
            user.UpdatedBy = model.UpdatedBy;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            return user;
        }
    }
}

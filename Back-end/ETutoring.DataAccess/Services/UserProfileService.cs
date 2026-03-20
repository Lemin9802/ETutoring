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

        public async Task<ApplicationUser?> GetUserProfileAsync(Guid userId, UserProfileRequest model)
        {
            // Implement the method as per your requirements
            return await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        }

        public async Task<ApplicationUser?> UpdateUserProfileAsync(Guid userId, UpdateProfileRequest model)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                return null;

            // Update string properties only if a non-empty value is provided
            user.FullName = string.IsNullOrWhiteSpace(model.FullName) ? user.FullName : model.FullName;
            user.Address = string.IsNullOrWhiteSpace(model.Address) ? user.Address : model.Address;
            user.PhoneNumber = string.IsNullOrWhiteSpace(model.PhoneNumber) ? user.PhoneNumber : model.PhoneNumber;
            user.ProfilePicture = string.IsNullOrWhiteSpace(model.ProfilePicture) ? user.ProfilePicture : model.ProfilePicture;
            user.Gender = string.IsNullOrWhiteSpace(model.Gender) ? user.Gender : model.Gender;
            user.Nationality = string.IsNullOrWhiteSpace(model.Nationality) ? user.Nationality : model.Nationality;
            user.IdentificationNumber = string.IsNullOrWhiteSpace(model.IdentificationNumber) ? user.IdentificationNumber : model.IdentificationNumber;

            // Update DateOfBirth if a valid (non-default) date is provided
            if (model.DateOfBirth != default(DateTime))
            {
                user.DateOfBirth = model.DateOfBirth;
            }

            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            return user;
        }
    }
}

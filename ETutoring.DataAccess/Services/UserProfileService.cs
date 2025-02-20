using ETutoring.Core.Entities;
using ETutoring.DataAccess.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ETutoring.Business.Dtos.Auth;
using Microsoft.EntityFrameworkCore;
using ETutoring.Business.Dtos.User;

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

        public async Task<bool> ReassignTutorToStudentAsync(ReassignStudentToTutorRequest request)
        {
            var studentRoleId = await _context.Roles
                .Where(r => r.Name == "Student")
                .Select(r => r.Id)
                .FirstOrDefaultAsync();

            var tutorRoleId = await _context.Roles
                .Where(r => r.Name == "Tutor")
                .Select(r => r.Id)
                .FirstOrDefaultAsync();

            var isStudent = await _context.UserRoles.AnyAsync(ur => ur.UserId == request.StudentId && ur.RoleId == studentRoleId);
            var isTutor = await _context.UserRoles.AnyAsync(ur => ur.UserId == request.TutorId && ur.RoleId == tutorRoleId);

            if (!isStudent || !isTutor)
                return false;

            var existingAssignment = await _context.ManageStudentTutors.FirstOrDefaultAsync(st => st.StudentId == request.StudentId);

            if (existingAssignment != null)
            {
                _context.ManageStudentTutors.Remove(existingAssignment);
                await _context.SaveChangesAsync();
            }

            var newAssignment = new ManageStudentTutor
            {
                StudentId = request.StudentId,
                TutorId = request.TutorId,
                AssignedBy = request.AssignedBy
            };

            _context.ManageStudentTutors.Add(newAssignment);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}

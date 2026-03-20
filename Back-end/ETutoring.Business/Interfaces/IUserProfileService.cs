using ETutoring.Business.Dtos.Auth;
using ETutoring.Core.Entities;

namespace ETutoring.DataAccess.Services
{
    public interface IUserProfileService
    {
        Task<ApplicationUser?> GetUserProfileAsync(Guid id, UserProfileRequest modal);
        Task<ApplicationUser?> UpdateUserProfileAsync(Guid id, UpdateProfileRequest model);

    }
}

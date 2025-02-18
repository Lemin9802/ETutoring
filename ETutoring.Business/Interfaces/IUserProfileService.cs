using ETutoring.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ETutoring.Business.Dtos.Auth;

namespace ETutoring.DataAccess.Services
{
    public interface IUserProfileService
    {
        Task<ApplicationUser?> GetUserProfileAsync(Guid userId);
        Task<ApplicationUser?> UpdateUserProfileAsync(Guid userId, UpdateProfileRequest model);
    }
}

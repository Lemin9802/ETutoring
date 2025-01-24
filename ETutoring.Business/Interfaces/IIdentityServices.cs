using ETutoring.Business.Dtos.Auth;
using ETutoring.Core.Utilities;
using ETutoring.DataAccess.Entities;
using Microsoft.AspNetCore.Identity.Data;

namespace ETutoring.Business.Interfaces;

public interface IIdentityServices
{
    Task<AuthResult<(string AccessToken, string RefreshToken)>> LoginAsync(LoginRequest model);

    Task<AuthResult<(string AccessToken, string RefreshToken)>> RefreshTokenAsync(string refreshToken);

    Task<AuthResult<ApplicationUser>> SyncGoogleUserAsync(GoogleUserRequest request);
}
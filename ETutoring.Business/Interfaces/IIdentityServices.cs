using ETutoring.Business.Dtos.Auth;
using ETutoring.Core.Utilities;

namespace ETutoring.Business.Interfaces;

public interface IIdentityServices
{
    Task<AuthResult<TokenResponse>> LoginAsync(LoginRequest model);

    Task<AuthResult<Guid>> CreateUserAsync(string userEmail, string password);

    Task<AuthResult<TokenResponse>> RefreshTokenAsync(string refreshToken);

    Task<AuthResult<TokenResponse>> SyncGoogleUserAsync(GoogleUserRequest request);

    Task<AuthResult<string>> AssignRoleAsync(Guid userId, Guid roleId);
}
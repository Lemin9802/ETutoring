using ETutoring.Business.Dtos;
using ETutoring.Business.Dtos.Auth;
using ETutoring.Core.Entities;
using ETutoring.Core.Utilities;

namespace ETutoring.Business.Interfaces;

public interface IIdentityServices
{
    Task<AuthResult<TokenResponse>> LoginAsync(LoginRequest model);

    Task<AuthResult<Guid>> CreateUserAsync(string userEmail, string password);

    Task<AuthResult<TokenResponse>> RefreshTokenAsync(string refreshToken);

    Task<AuthResult<TokenResponse>> SyncGoogleUserAsync(GoogleUserRequest request);

    Task<AuthResult<string>> AssignRoleAsync(Guid userId, Guid roleId);

    Task<AuthResult<ApplicationUser>> GetUserByIdAsync(Guid userId);

    Task<IEnumerable<string?>> GetUsersByEmailAsync(string email, MetaRequest meta);

    Task<List<Guid>> FindUsersByEmailsAsync(List<string> email, CancellationToken cancellationToken);
}
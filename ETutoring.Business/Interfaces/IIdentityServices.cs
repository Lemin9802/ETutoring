using ETutoring.Business.Dtos.Auth;
using ETutoring.Core.Utilities;

namespace ETutoring.Business.Interfaces;

public interface IIdentityServices
{
    Task<Result<(string AccessToken, string RefreshToken)>> LoginAsync(LoginDto model);

    Task<Result<(string AccessToken, string RefreshToken)>> RefreshTokenAsync(string refreshToken);
}
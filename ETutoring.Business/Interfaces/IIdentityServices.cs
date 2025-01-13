using ETutoring.Business.Dtos.Auth;
using ETutoring.Core.Utilities;

namespace ETutoring.Business.Interfaces;

public interface IIdentityServices
{
    Task<ServiceResult<(string AccessToken, string RefreshToken)>> LoginAsync(LoginDto model);
}
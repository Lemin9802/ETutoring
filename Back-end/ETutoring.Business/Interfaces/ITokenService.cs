using ETutoring.Core.Entities;

namespace ETutoring.Business.Interfaces;

public interface ITokenService
{
    Task<string> GenerateToken(ApplicationUser user);
    string GenerateRefreshToken();
}
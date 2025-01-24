using ETutoring.DataAccess.Entities;

namespace ETutoring.Business.Interfaces;

public interface ITokenService
{
    Task<string> GenerateToken(ApplicationUser user);
    string GenerateRefreshToken();
}
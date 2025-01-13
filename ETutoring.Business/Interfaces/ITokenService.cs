using ETutoring.DataAccess.Entities;
using System.Security.Claims;

namespace ETutoring.Business.Interfaces;

public interface ITokenService
{
    Task<string> GenerateToken(ApplicationUser user);
    string GenerateRefreshToken();
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
}
using Microsoft.AspNetCore.Identity;

namespace ETutoring.DataAccess.Entities;

public class ApplicationUser : IdentityUser<Guid>
{
    //RefreshToken
    public string? RefreshToken { get; private set; }

    public DateTime? RefreshTokenExpiryTime { get; private set; }


    public void SetRefreshToken(string refreshToken, DateTime expiryTime)
    {
        RefreshToken = refreshToken;
        RefreshTokenExpiryTime = expiryTime;
    }
}
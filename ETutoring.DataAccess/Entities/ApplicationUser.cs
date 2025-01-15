using Microsoft.AspNetCore.Identity;

namespace ETutoring.DataAccess.Entities;

public class ApplicationUser : IdentityUser<Guid>
{
    //RefreshToken
    public List<RefreshToken> RefreshTokens { get; private set; } = new();

    public DateTime? RefreshTokenExpiryTime { get; private set; }


    public void AddRefreshToken(string token, DateTime expiryTime)
    {
        // Optionally: Remove expired tokens to keep the list clean
        RefreshTokens.RemoveAll(rt => rt.ExpiryTime <= DateTime.UtcNow);

        RefreshTokens.Add(new RefreshToken(token, expiryTime));
    }
}
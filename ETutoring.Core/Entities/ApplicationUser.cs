using Microsoft.AspNetCore.Identity;

namespace ETutoring.Core.Entities;

public class ApplicationUser : IdentityUser<Guid>
{
    //RefreshToken
    public List<RefreshToken> RefreshTokens { get; private set; } = new();

    public string? ProfilePicture { get; set; }
}
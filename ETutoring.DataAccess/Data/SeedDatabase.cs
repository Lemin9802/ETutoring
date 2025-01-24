using ETutoring.Core.Common;
using Microsoft.AspNetCore.Identity;

namespace ETutoring.DataAccess.Data;

public static class SeedDatabase
{
    public static async Task SeedRolesAsync(this RoleManager<IdentityRole<Guid>> roleManager)
    {
        var roles = new[] { Constants.ADMIN_ROLE, Constants.MODERATOR_ROLE, Constants.TUTOR_ROLE, Constants.STUDENT_ROLE };

        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole<Guid>(role));
            }
        }
    }

}
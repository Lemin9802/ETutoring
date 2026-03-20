using System.Security.Claims;

namespace ETutoring.Core.Helpers
{
    public static class ClaimsPrincipalExtensions
    {
        public static Guid GetUserId(this ClaimsPrincipal user)
        {
            var userIdClaim = user.FindFirst("sub")?.Value;
            return userIdClaim != null ? Guid.Parse(userIdClaim) : Guid.Empty;
        }
        public static bool IsAdmin(this ClaimsPrincipal user)
        {
            return user.IsInRole("Admin");
        }

        public static bool IsModerator(this ClaimsPrincipal user)
        {
            return user.IsInRole("Moderator");
        }

        public static bool IsTutor(this ClaimsPrincipal user)
        {
            return user.IsInRole("Tutor");
        }

        public static bool IsStudent(this ClaimsPrincipal user)
        {
            return user.IsInRole("Student");
        }
    }
}
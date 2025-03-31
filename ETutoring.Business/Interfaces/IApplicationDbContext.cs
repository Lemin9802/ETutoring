using ETutoring.Core.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ETutoring.Business.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Blog> Blogs { get; set; }

    DbSet<Comment> Comments { get; set; }

    DbSet<BlogComment> BlogsComments { get; set; }

    DbSet<RefreshToken> RefreshTokens { get; set; }

    DbSet<Document> Documents { get; set; }

    DbSet<DocumentComment> DocumentComments { get; set; }

    DbSet<Meeting> Meetings { get; set; }

    DbSet<ApplicationUser> Users { get; set; }

    DbSet<IdentityUserRole<Guid>> UserRoles { get; set; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
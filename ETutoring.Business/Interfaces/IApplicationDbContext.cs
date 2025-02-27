using ETutoring.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace ETutoring.Business.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Blog> Blogs { get; set; }

    DbSet<RefreshToken> RefreshTokens { get; set; }

    DbSet<Document> Documents { get; set; }

    DbSet<DocumentComment> DocumentComments { get; set; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
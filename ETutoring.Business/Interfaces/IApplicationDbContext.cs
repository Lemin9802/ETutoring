using ETutoring.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace ETutoring.Business.Interfaces;

public interface IApplicationDbContext
{
    DbSet<RefreshToken> RefreshTokens { get; set; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
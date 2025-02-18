using ETutoring.Business.Interfaces;
using ETutoring.Core.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace ETutoring.DataAccess.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Blog> Blogs { get; set; }

    public DbSet<RefreshToken> RefreshTokens { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // Use snake_case naming convention for PostgreSQL
        //builder.HasAnnotation("Relational:DefaultSchema", "public");

        builder.Entity<ApplicationUser>(b => b.ToTable("users"));
        builder.Entity<IdentityRole<Guid>>(b => b.ToTable("roles"));
        builder.Entity<IdentityUserRole<Guid>>(b => b.ToTable("user_roles"));
        builder.Entity<IdentityUserClaim<Guid>>(b => b.ToTable("user_claims"));
        builder.Entity<IdentityUserLogin<Guid>>(b => b.ToTable("user_logins"));
        builder.Entity<IdentityRoleClaim<Guid>>(b => b.ToTable("role_claims"));
        builder.Entity<IdentityUserToken<Guid>>(b => b.ToTable("user_tokens"));
    }

}
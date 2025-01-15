using ETutoring.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ETutoring.DataAccess.Configurations;

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        // Set Token as required and unique
        builder.Property(rt => rt.Token)
            .IsRequired()
            .HasMaxLength(500);

        // Ensure UserId is indexed for fast lookups
        builder.HasIndex(rt => rt.UserId);
    }
}
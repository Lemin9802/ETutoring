using ETutoring.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ETutoring.DataAccess.Configurations;

public class BlogConfiguration : IEntityTypeConfiguration<Blog>
{
    public void Configure(EntityTypeBuilder<Blog> builder)
    {
        builder.Property(b => b.Title).HasMaxLength(100).IsRequired();

        builder.Property(b => b.Content).IsRequired();

        builder.HasOne(b => b.User)
            .WithMany()
            .HasForeignKey(b => b.UserId);

        builder.HasQueryFilter(b => b.DeletedAt == null);
    }
}
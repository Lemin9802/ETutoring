using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ETutoring.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ETutoring.DataAccess.Configurations
{
    public class BlogLikeConfiguration : IEntityTypeConfiguration<BlogLike>
    {
        public void Configure(EntityTypeBuilder<BlogLike> builder)
        {
            builder.HasKey(bl => new { bl.BlogId, bl.UserId });
            builder
                .HasOne(bl => bl.Blog)
                .WithMany(b => b.Likes)
                .HasForeignKey(bl => bl.BlogId)
                .OnDelete(DeleteBehavior.Cascade);
            builder
                .HasOne(bl => bl.User)
                .WithMany()
                .HasForeignKey(bl => bl.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}




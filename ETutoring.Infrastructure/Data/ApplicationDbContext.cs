using Microsoft.EntityFrameworkCore;
using ETutoring.Core.Entities;
using ETutoring.DataAccess.Configurations;

namespace ETutoring.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public DbSet<DocumentComment> DocumentComments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Apply configurations
            modelBuilder.ApplyConfiguration(new DocumentCommentConfiguration());
            
            modelBuilder.Entity<DocumentComment>()
                .HasOne(dc => dc.Document)
                .WithMany(d => d.Comments)
                .HasForeignKey(dc => dc.DocumentId)
                .OnDelete(DeleteBehavior.Cascade);
                
            modelBuilder.Entity<DocumentComment>()
                .HasOne(dc => dc.Commenter)
                .WithMany()
                .HasForeignKey(dc => dc.CommenterId)
                .OnDelete(DeleteBehavior.Restrict);
                
            modelBuilder.Entity<DocumentComment>()
                .HasOne(dc => dc.ParentComment)
                .WithMany(dc => dc.Replies)
                .HasForeignKey(dc => dc.ParentCommentId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
} 
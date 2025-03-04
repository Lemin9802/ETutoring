using ETutoring.Business.Dtos.Blogs;
using ETutoring.Business.Interfaces;
using ETutoring.Business.Interfaces.Services;
using ETutoring.Core.Entities;
using Google;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace ETutoring.Business.Services
{
    public class CommentService : ICommentService
    {
        private readonly IApplicationDbContext _context;

        public CommentService(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Comment> CreateCommentAsync(CreateCommentRequest request, CancellationToken cancellationToken)
        {
            var blog = await _context.Blogs.FindAsync(request.BlogId);
            if (blog == null)
                throw new Exception("Blog not found");

            var comment = new Comment
            {
                Id = Guid.NewGuid(),
                Content = request.Content,
                UserId = request.UserId,
                BlogComments = new List<BlogComment>
                {
                    new BlogComment { BlogId = request.BlogId }
                },
                CreatedAt = DateTime.UtcNow
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync(cancellationToken);

            return comment;
        }

        // Service Get All Comment by specific blog
        public async Task<List<Comment>> GetCommentsByBlogIdAsync(Guid blogId, CancellationToken cancellationToken)
        {
            var comments = await _context.BlogsComments
                .Where(bc => bc.BlogId == blogId)
                .Include(bc => bc.Comment)
                .ThenInclude(c => c.User) // Load thông tin User nếu cần
                .Select(bc => new Comment
                {
                    Id = bc.Comment.Id,
                    Content = bc.Comment.Content,
                    UserId = bc.Comment.UserId,
                    CreatedAt = bc.Comment.CreatedAt
                })
                .ToListAsync(cancellationToken);

            return comments;
        }

        //Service for Owner update comment
        public async Task<Comment> UpdateCommentAsync(Guid commentId, Guid userId, string newContent, CancellationToken cancellationToken)
        {
            var comment = await _context.Comments.FindAsync(commentId);
            Console.WriteLine("This is commentId: ", commentId);
            if (comment == null)
            {
                throw new Exception("Comment not found");
            }

            if (comment.UserId != userId)
            {
                throw new UnauthorizedAccessException("You are not allowed to update this comment.");
            }

            comment.Content = newContent;
            comment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            return comment;
        }

        // Service Delete comments for owner
        // Service Delete comments for owner (Admin can remove any comments)
        public async Task<bool> DeleteCommentAsync(Guid commentId, Guid userId, CancellationToken cancellationToken)
        {
            var comment = await _context.Comments
                .Include(c => c.BlogComments)
                .FirstOrDefaultAsync(c => c.Id == commentId, cancellationToken);

            if (comment == null)
            {
                throw new Exception("Comment not found");
            }

            // Lấy role của Admin
            var adminRoleId = await _context.Roles
                .Where(r => r.Name == "Admin")
                .Select(r => r.Id)
                .FirstOrDefaultAsync();

            // Kiểm tra xem user có phải Admin không
            var isAdmin = await _context.UserRoles
                .AnyAsync(ur => ur.UserId == userId && ur.RoleId == adminRoleId);

            if (comment.UserId != userId)
            {
                throw new UnauthorizedAccessException("You are not allowed to delete this comment.");
            }

            _context.BlogsComments.RemoveRange(comment.BlogComments);

            _context.Comments.Remove(comment);

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

    }
}

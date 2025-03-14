using ETutoring.Business.Dtos.Blogs;
using ETutoring.Business.Interfaces;
using ETutoring.Business.Interfaces.Services;
using ETutoring.Core.Common;
using ETutoring.Core.Entities;
using ETutoring.Core.Helpers;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ETutoring.Business.Services
{
    public class BlogService : IBlogService
    {
        private readonly IApplicationDbContext _context;

        public BlogService(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Blog> CreateBlogAsync(CreateBlogRequest request, CancellationToken cancellationToken)
        {
            var blog = new Blog
            {
                Id = Guid.NewGuid(),
                Title = request.Title,
                Content = request.Content,
                UserId = request.UserId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Blogs.Add(blog);
            await _context.SaveChangesAsync(cancellationToken);
            return blog;
        }

        public async Task<List<Blog>> GetAllBlogsAsync(Guid userId, bool isAdmin, CancellationToken cancellationToken)
        {
            return isAdmin
                ? await _context.Blogs.ToListAsync(cancellationToken)
                : await _context.Blogs.Where(b => b.UserId == userId).ToListAsync(cancellationToken);
        }

        public async Task<Blog?> GetBlogByIdAsync(Guid blogId, Guid userId, bool isAdmin, CancellationToken cancellationToken)
        {
            var blog = await _context.Blogs.FindAsync(new object[] { blogId }, cancellationToken);
            return (blog != null && (isAdmin || blog.UserId == userId)) ? blog : null;
        }

        public async Task<Blog?> UpdateBlogAsync(Guid blogId, UpdateBlogRequest request, Guid userId, bool isAdmin, CancellationToken cancellationToken)
        {
            var blog = await _context.Blogs.FindAsync(new object[] { blogId }, cancellationToken);
            if (blog == null || (!isAdmin && blog.UserId != userId))
                return null;

            blog.Title = request.Title;
            blog.Content = request.Content;
            blog.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);
            return blog;
        }

        public async Task<bool> DeleteBlogAsync(Guid blogId, Guid userId, bool isAdmin, CancellationToken cancellationToken)
        {
            var blog = await _context.Blogs.FindAsync(new object[] { blogId }, cancellationToken);
            if (blog == null || (!isAdmin && blog.UserId != userId))
                return false;

            _context.Blogs.Remove(blog);
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
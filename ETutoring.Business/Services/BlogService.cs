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

        // ✅ Create a new blog
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

        public async Task<List<GetAllBlogRequest>> GetAllBlogsAsync(CancellationToken cancellationToken)
        {
            return await _context.Blogs
                .Include(b => b.User)
                .Select(b => new GetAllBlogRequest
                {
                    Id = b.Id,
                    Title = b.Title,
                    Content = b.Content,
                    UserId = b.UserId,
                    UserFullName = b.User.FullName,
                    CreatedAt = b.CreatedAt
                })
                .ToListAsync(cancellationToken);
        }

        public async Task<List<GetAllBlogRequest>> GetBlogByIdAsync(Guid userId, CancellationToken cancellationToken)
        {
            return await _context.Blogs
                .Include(b => b.User)
                .Where(b => b.UserId == userId)
                .Select(b => new GetAllBlogRequest
                {
                    Id = b.Id,
                    Title = b.Title,
                    Content = b.Content,
                    UserId = b.UserId,
                    UserFullName = b.User.FullName,
                    CreatedAt = b.CreatedAt
                })
                .ToListAsync(cancellationToken);
        }

        public async Task<Blog?> UpdateBlogAsync(Guid blogId, UpdateBlogRequest request, bool isAdmin, CancellationToken cancellationToken)
        {
            var blog = await _context.Blogs.FindAsync(new object[] { blogId }, cancellationToken);
            if (blog == null)
                return null;

            blog.Title = request.Title;
            blog.Content = request.Content;
            blog.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);
            return blog;
        }
        public async Task<bool> DeleteBlogAsync(Guid blogId, bool isAdmin, CancellationToken cancellationToken)
        {
            var blog = await _context.Blogs.FindAsync(new object[] { blogId }, cancellationToken);
            if (blog == null)
                return false;

            _context.Blogs.Remove(blog);
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }


    }

}
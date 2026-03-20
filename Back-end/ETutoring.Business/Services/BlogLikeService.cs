using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ETutoring.Business.Interfaces;
using ETutoring.Business.Dtos.Blogs;
using ETutoring.Business.Interfaces.Services;
using ETutoring.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace ETutoring.Business.Services
{
    public class BlogLikeService : IBlogLikeService
    {
        private readonly IApplicationDbContext _context;

        public BlogLikeService(IApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<(bool IsLiked, string Message)> ProcessLikeAsync(
            LikeBlogRequest request,
            CancellationToken cancellationToken)
        {
            Console.WriteLine($"[BlogLikeService] Received BlogId = {request.BlogId}, UserId = {request.UserId}");
            var blog = await _context.Blogs
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(b => b.Id == request.BlogId, cancellationToken);

            if (blog == null)
            {
                Console.WriteLine($"[BlogLikeService] Blog {request.BlogId} NOT FOUND in database");
                return (false, "Blog not found");
            }
            Console.WriteLine($"[BlogLikeService] Blog {request.BlogId} FOUND: Title = '{blog.Title}'");
            var existing = await _context.BlogLikes
                .FindAsync(new object[] { request.BlogId, request.UserId }, cancellationToken);
            if (existing != null)
            {
                _context.BlogLikes.Remove(existing);
                await _context.SaveChangesAsync(cancellationToken);
                Console.WriteLine($"[BlogLikeService] Removed like for Blog {request.BlogId} by User {request.UserId}");
                return (false, "Blog unliked successfully");
            }
            _context.BlogLikes.Add(new BlogLike
            {
                BlogId = request.BlogId,
                UserId = request.UserId
            });
            await _context.SaveChangesAsync(cancellationToken);
            Console.WriteLine($"[BlogLikeService] Added like for Blog {request.BlogId} by User {request.UserId}");
            return (true, "Blog liked successfully");
        }
        public async Task<List<GetAllBlogRequest>> GetLikedBlogsAsync(Guid userId, CancellationToken cancellationToken)
        {
            return await _context.BlogLikes
                .Where(bl => bl.UserId == userId)
                .Include(bl => bl.Blog)
                .ThenInclude(b => b.User)
                .Select(bl => new GetAllBlogRequest
                {
                    Id = bl.Blog.Id,
                    Title = bl.Blog.Title,
                    Content = bl.Blog.Content,
                    UserId = bl.Blog.UserId,
                    UserFullName = bl.Blog.User.FullName,
                    CreatedAt = bl.Blog.CreatedAt
                })
                .ToListAsync(cancellationToken);
        }
    }
}


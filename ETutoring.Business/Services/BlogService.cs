using ETutoring.Business.Dtos.Blogs;
using ETutoring.Business.Interfaces;
using ETutoring.Business.Interfaces.Services;
using ETutoring.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace ETutoring.Business.Services;

public class BlogService : IBlogService
{
    private readonly IApplicationDbContext _context;

    public BlogService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Blog> CreateBlogAsync(CreateBlogRequest blog, CancellationToken cancellationToken)
    {
        var newBlog = new Blog
        {
            Title = blog.Title,
            Content = blog.Content,
            UserId = blog.UserId
        };

        await _context.Blogs.AddAsync(newBlog, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);

        return newBlog;
    }
    public async Task<List<Blog>> GetAllBlogsAsync(CancellationToken cancellationToken)
    {
        return await _context.Blogs.ToListAsync(cancellationToken);
    }
    public async Task<Blog?> GetBlogByIdAsync(Guid blogId, CancellationToken cancellationToken)
    {
        return await _context.Blogs.FirstOrDefaultAsync(b => b.Id == blogId, cancellationToken);
    }
    public async Task<Blog?> UpdateBlogAsync(UpdateBlogRequest request, Guid userId, bool isAdmin, CancellationToken cancellationToken)
    {
        var blog = await _context.Blogs.FirstOrDefaultAsync(b => b.Id == request.BlogId, cancellationToken);

        if (blog == null)
            return null;

        if (!isAdmin && blog.UserId != userId)
            return null;

        blog.Title = request.Title;
        blog.Content = request.Content;

        await _context.SaveChangesAsync(cancellationToken);

        return blog;
    }
    public async Task<bool> DeleteBlogAsync(DeleteBlogRequest request, Guid userId, bool isAdmin, CancellationToken cancellationToken)
    {
        var blog = await _context.Blogs.FirstOrDefaultAsync(b => b.Id == request.BlogId, cancellationToken);

        if (blog == null)
            return false;

        if (!isAdmin && blog.UserId != userId)
            return false;

        _context.Blogs.Remove(blog);
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }

}
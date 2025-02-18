using ETutoring.Business.Dtos.Blogs;
using ETutoring.Business.Interfaces;
using ETutoring.Business.Interfaces.Services;
using ETutoring.Core.Entities;

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
}
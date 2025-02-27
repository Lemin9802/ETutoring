using ETutoring.Business.Dtos.Blogs;
using ETutoring.Core.Entities;

namespace ETutoring.Business.Interfaces.Services;

public interface IBlogService
{
    public Task<Blog> CreateBlogAsync(CreateBlogRequest blog, CancellationToken cancellationToken);
    public Task<List<Blog>> GetAllBlogsAsync(Guid userId, bool isAdmin, CancellationToken cancellationToken);
    public Task<Blog?> GetBlogByIdAsync(Guid blogId, CancellationToken cancellationToken);
    public Task<Blog?> UpdateBlogAsync(UpdateBlogRequest request, Guid userId, bool isAdmin, CancellationToken cancellationToken);
    public Task<bool> DeleteBlogAsync(DeleteBlogRequest request, Guid userId, bool isAdmin, CancellationToken cancellationToken);
}
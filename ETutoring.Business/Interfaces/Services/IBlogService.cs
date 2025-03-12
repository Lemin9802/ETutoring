using ETutoring.Business.Dtos.Blogs;
using ETutoring.Core.Entities;

namespace ETutoring.Business.Interfaces.Services
{
    public interface IBlogService
    {
        Task<Blog> CreateBlogAsync(CreateBlogRequest request, CancellationToken cancellationToken);
        Task<List<Blog>> GetAllBlogsAsync(Guid userId, bool isAdmin, CancellationToken cancellationToken);
        Task<Blog?> GetBlogByIdAsync(Guid blogId, Guid userId, bool isAdmin, CancellationToken cancellationToken);
        Task<Blog?> UpdateBlogAsync(Guid blogId, UpdateBlogRequest request, Guid userId, bool isAdmin, CancellationToken cancellationToken);
        Task<bool> DeleteBlogAsync(Guid blogId, Guid userId, bool isAdmin, CancellationToken cancellationToken);
    }
}
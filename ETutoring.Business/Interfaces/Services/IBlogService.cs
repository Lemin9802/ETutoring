using ETutoring.Core.Entities;
using ETutoring.Business.Dtos.Blogs;

namespace ETutoring.Business.Interfaces.Services
{
    public interface IBlogService
    {
        Task<Blog> CreateBlogAsync(CreateBlogRequest request, CancellationToken cancellationToken);
        Task<List<GetAllBlogRequest>> GetAllBlogsAsync(CancellationToken cancellationToken);
        Task<List<GetAllBlogRequest>> GetBlogByIdAsync(Guid userId, CancellationToken cancellationToken);
        Task<Blog?> UpdateBlogAsync(Guid blogId, UpdateBlogRequest request, bool isAdmin, CancellationToken cancellationToken);
        Task<bool> DeleteBlogAsync(Guid blogId, Guid userId, bool isAdmin, CancellationToken cancellationToken);

    }

}
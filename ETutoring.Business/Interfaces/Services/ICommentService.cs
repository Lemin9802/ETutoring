using ETutoring.Business.Dtos.Blogs;
using ETutoring.Core.Entities;


namespace ETutoring.Business.Interfaces.Services
{
    public interface ICommentService
    {
        Task<bool> DeleteCommentAsync(Guid commentId, Guid userId, CancellationToken cancellationToken);
        Task<Comment> UpdateCommentAsync(Guid commentId, Guid userId, string newContent, CancellationToken cancellationToken);
        Task<List<Comment>> GetCommentsByBlogIdAsync(Guid blogId, CancellationToken cancellationToken);
        Task<Comment> CreateCommentAsync(CreateCommentRequest request, CancellationToken cancellationToken);
    }
}

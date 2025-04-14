using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Threading;
using ETutoring.Business.Dtos.Blogs;

namespace ETutoring.Business.Interfaces.Services
{
    public interface IBlogLikeService
    {
        Task<(bool IsLiked, string Message)> ProcessLikeAsync(LikeBlogRequest request, CancellationToken cancellationToken);
        Task<List<GetAllBlogRequest>> GetLikedBlogsAsync(Guid userId, CancellationToken cancellationToken);
    }
}
using ETutoring.Business.Dtos.Blogs;
using ETutoring.Core.Entities;

namespace ETutoring.Business.Interfaces.Services;

public interface IBlogService
{
    public Task<Blog> CreateBlogAsync(CreateBlogRequest blog, CancellationToken cancellationToken);

}
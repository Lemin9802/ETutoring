using ETutoring.Business.Dtos.Blogs;
using ETutoring.Business.Interfaces.Services;
using ETutoring.Core.Common;
using ETutoring.Core.Entities;
using ETutoring.Core.Helpers;
using Microsoft.AspNetCore.Mvc;

namespace ETutoring.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BlogsController : ControllerBase
    {
        private readonly IBlogService _blogService;

        public BlogsController(IBlogService blogService)
        {
            _blogService = blogService;
        }


        [HttpPost("create")]
        public async Task<ActionResult<ApiResponse<Blog>>> CreateBlogAsync([FromBody] CreateBlogRequest request, CancellationToken cancellationToken = default)
        {
            var blog = await _blogService.CreateBlogAsync(request, cancellationToken);
            return Ok(ApiResponseHandler.SuccessResponse(blog, "Blog Created Successfully"));
        }

        [HttpPost("get-all")]
        public async Task<ActionResult<ApiResponse<List<Blog>>>> GetAllBlogsAsync(CancellationToken cancellationToken)
        {
            var blogs = await _blogService.GetAllBlogsAsync(cancellationToken);
            return Ok(ApiResponseHandler.SuccessResponse(blogs, "Retrieved all blogs successfully"));
        }
        public class GetBlogByIdRequest
        {
            public Guid BlogId { get; set; }
        }

        [HttpPost("get-by-id")]
        public async Task<ActionResult<ApiResponse<Blog?>>> GetBlogByIdAsync([FromBody] GetBlogByIdRequest request, CancellationToken cancellationToken)
        {
            var blog = await _blogService.GetBlogByIdAsync(request.BlogId, cancellationToken);

            if (blog == null)
                return NotFound(ApiResponseHandler.FailureResponse<Blog?>("Blog not found"));

            return Ok(ApiResponseHandler.SuccessResponse(blog, "Retrieved blog successfully"));
        }
        [HttpPost("update")]
        public async Task<ActionResult<ApiResponse<Blog?>>> UpdateBlogAsync([FromBody] UpdateBlogRequest request, CancellationToken cancellationToken)
        {
            var updatedBlog = await _blogService.UpdateBlogAsync(request, cancellationToken);

            if (updatedBlog == null)
                return NotFound(ApiResponseHandler.FailureResponse<Blog?>("Blog not found"));

            return Ok(ApiResponseHandler.SuccessResponse(updatedBlog, "Blog updated successfully"));
        }
        [HttpPost("delete")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteBlogAsync([FromBody] DeleteBlogRequest request, CancellationToken cancellationToken)
        {
            var isDeleted = await _blogService.DeleteBlogAsync(request, cancellationToken);

            if (!isDeleted)
                return NotFound(ApiResponseHandler.FailureResponse<bool>("Blog not found"));

            return Ok(ApiResponseHandler.SuccessResponse(true, "Blog deleted successfully"));
        }

    }
}

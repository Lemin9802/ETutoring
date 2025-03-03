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
        public class GetAllBlogsRequest
        {
            public Guid UserId { get; set; }
            public bool IsAdmin { get; set; }
        }

        [HttpPost("get-all")]
        public async Task<ActionResult<ApiResponse<List<Blog>>>> GetAllBlogsAsync(
            [FromBody] GetAllBlogsRequest request,
            CancellationToken cancellationToken)
        {
            Console.WriteLine($"📌 Received Request - UserID: {request.UserId}, IsAdmin: {request.IsAdmin}");

            var blogs = await _blogService.GetAllBlogsAsync(request.UserId, request.IsAdmin, cancellationToken);

            Console.WriteLine($"📌 Total Blogs Found: {blogs.Count}");

            return Ok(ApiResponseHandler.SuccessResponse(blogs, "Retrieved blogs successfully"));
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
            var userId = User.GetUserId();  
            var isAdmin = User.IsAdmin();   

            var updatedBlog = await _blogService.UpdateBlogAsync(request, userId, isAdmin, cancellationToken);

            if (updatedBlog == null)
                return Forbid("You do not have permission to edit this blog");

            return Ok(ApiResponseHandler.SuccessResponse(updatedBlog, "Blog updated successfully"));
        }
        [HttpPost("delete")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteBlogAsync([FromBody] DeleteBlogRequest request, CancellationToken cancellationToken)
        {
            var userId = User.GetUserId();  
            var isAdmin = User.IsAdmin();   

            var isDeleted = await _blogService.DeleteBlogAsync(request, userId, isAdmin, cancellationToken);

            if (!isDeleted)
                return Forbid("You do not have permission to delete this blog");

            return Ok(ApiResponseHandler.SuccessResponse(true, "Blog deleted successfully"));
        }

    }
}

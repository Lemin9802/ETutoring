using ETutoring.Business.Dtos.Blogs;
using ETutoring.Business.Interfaces.Services;
using ETutoring.Core.Common;
using ETutoring.Core.Entities;
using ETutoring.Core.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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
        [Authorize]
        public async Task<ActionResult<ApiResponse<List<Blog>>>> GetAllBlogsAsync(CancellationToken cancellationToken = default)
        {
            var userId = User.GetUserId();
            var isAdmin = User.IsAdmin();

            var blogs = await _blogService.GetAllBlogsAsync(userId, isAdmin, cancellationToken);
            return Ok(ApiResponseHandler.SuccessResponse(blogs, "Blogs Retrieved Successfully"));
        }

        [HttpPost("get-by-id")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<Blog>>> GetBlogByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var userId = User.GetUserId();
            var isAdmin = User.IsAdmin();

            var blog = await _blogService.GetBlogByIdAsync(id, userId, isAdmin, cancellationToken);
            if (blog == null)
                return NotFound(ApiResponseHandler.FailureResponse<Blog>("Blog not found"));

            return Ok(ApiResponseHandler.SuccessResponse(blog, "Blog Retrieved Successfully"));
        }

        [HttpPost("update")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<Blog>>> UpdateBlogAsync(Guid id, [FromBody] UpdateBlogRequest request, CancellationToken cancellationToken = default)
        {
            var userId = User.GetUserId();
            var isAdmin = User.IsAdmin();

            var updatedBlog = await _blogService.UpdateBlogAsync(id, request, userId, isAdmin, cancellationToken);
            if (updatedBlog == null)
                return NotFound(ApiResponseHandler.FailureResponse<Blog>("Blog not found or not authorized to update"));

            return Ok(ApiResponseHandler.SuccessResponse(updatedBlog, "Blog Updated Successfully"));
        }

        [HttpPost("delete")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteBlogAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var userId = User.GetUserId();
            var isAdmin = User.IsAdmin();

            var result = await _blogService.DeleteBlogAsync(id, userId, isAdmin, cancellationToken);
            if (!result)
                return NotFound(ApiResponseHandler.FailureResponse<bool>("Blog not found or not authorized to delete"));

            return Ok(ApiResponseHandler.SuccessResponse(true, "Blog Deleted Successfully"));
        }
    }
}

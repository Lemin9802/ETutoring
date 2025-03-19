using ETutoring.Business.Dtos.Blogs;
using ETutoring.Business.Interfaces.Services;
using ETutoring.Core.Common;
using ETutoring.Core.Entities;
using ETutoring.Core.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.JsonWebTokens;
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

        // ✅ Create blog
        [HttpPost("create")]
        public async Task<ActionResult<ApiResponse<Blog>>> CreateBlogAsync([FromBody] CreateBlogRequest request, CancellationToken cancellationToken = default)
        {
            var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException("Not found user in JWT token");

            request.UserId = Guid.Parse(userId);
            var blog = await _blogService.CreateBlogAsync(request, cancellationToken);
            return Ok(ApiResponseHandler.SuccessResponse(blog, "Blog Created Successfully"));
        }

        [HttpPost("get-all")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<List<Blog>>>> GetAllBlogsAsync(CancellationToken cancellationToken = default)
        {
            var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException("Not found user in JWT token");

            var isAdmin = User.IsAdmin();
            var blogs = await _blogService.GetAllBlogsAsync(Guid.Parse(userId), isAdmin, cancellationToken);
            return Ok(ApiResponseHandler.SuccessResponse(blogs, "Blogs Retrieved Successfully"));
        }

        // ✅ Get blog by ID (Search & View Detail)
        [HttpPost("get-by-id")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<Blog>>> GetBlogByIdAsync(
        [FromBody] Guid id,
        CancellationToken cancellationToken = default)
            {
                Console.WriteLine($"🔍 Fetching Blog ID: {id}");

                var isAdmin = User.IsAdmin();
                var blog = await _blogService.GetBlogByIdAsync(id, isAdmin, cancellationToken);

                if (blog == null)
                    return NotFound(ApiResponseHandler.FailureResponse<Blog>("Blog not found"));

                return Ok(ApiResponseHandler.SuccessResponse(blog, "Blog Retrieved Successfully"));
            }
        [HttpPost("update")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<Blog>>> UpdateBlogAsync(
        [FromQuery] Guid id,
        [FromBody] UpdateBlogRequest request,
        CancellationToken cancellationToken = default)
            {
                var isAdmin = User.IsAdmin();
                var updatedBlog = await _blogService.UpdateBlogAsync(id, request, isAdmin, cancellationToken);

                if (updatedBlog == null)
                    return NotFound(ApiResponseHandler.FailureResponse<Blog>("Blog not found or not authorized to update"));

                return Ok(ApiResponseHandler.SuccessResponse(updatedBlog, "Blog Updated Successfully"));
            }
        [HttpPost("delete")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteBlogAsync(
        [FromBody] Guid id,
        CancellationToken cancellationToken = default)
            {
                var isAdmin = User.IsAdmin();
                if (!isAdmin)
                    return Forbid();

                var result = await _blogService.DeleteBlogAsync(id, isAdmin, cancellationToken);
                if (!result)
                    return NotFound(ApiResponseHandler.FailureResponse<bool>("Blog not found or not authorized to delete"));

                return Ok(ApiResponseHandler.SuccessResponse(true, "Blog Deleted Successfully"));
            }

    }
}

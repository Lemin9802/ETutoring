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
        public async Task<ActionResult<ApiResponse<List<GetAllBlogRequest>>>> GetAllBlogsAsync(CancellationToken cancellationToken = default)
        {
            var blogs = await _blogService.GetAllBlogsAsync(cancellationToken);
            return Ok(ApiResponseHandler.SuccessResponse(blogs, "All blogs retrieved successfully"));
        }

        // ✅ Get blog by User ID 
        [HttpPost("get-by-id")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<List<GetAllBlogRequest>>>> GetBlogsOfCurrentUser(CancellationToken cancellationToken = default)
        {
            var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException("User not found in JWT token");

            var blogs = await _blogService.GetBlogByIdAsync(Guid.Parse(userId), cancellationToken);
            return Ok(ApiResponseHandler.SuccessResponse(blogs, "Your blogs retrieved successfully"));
        }
        [HttpPost("update")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<Blog>>> UpdateBlogAsync(
        [FromBody] UpdateBlogRequest request,
        CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                var errors = string.Join("; ", ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage));

                return BadRequest($"Invalid model: {errors}");
            }

            var isAdmin = User.IsAdmin();
            var updatedBlog = await _blogService.UpdateBlogAsync(
                request.Id,             
                request,
                isAdmin,
                cancellationToken
            );

            if (updatedBlog == null)
                return NotFound(ApiResponseHandler.FailureResponse<Blog>("Blog not found or not authorized to update"));

            return Ok(ApiResponseHandler.SuccessResponse(updatedBlog, "Blog Updated Successfully"));
        }
        [HttpPost("delete")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteBlogAsync(
            [FromBody] DeleteBlogRequest request,
            CancellationToken cancellationToken = default)
        {
            var isAdmin = User.IsAdmin();
            if (!isAdmin)
                return Forbid();

            var result = await _blogService.DeleteBlogAsync(request.Id, isAdmin, cancellationToken);
            if (!result)
                return NotFound(ApiResponseHandler.FailureResponse<bool>("Blog not found or not authorized to delete"));

            return Ok(ApiResponseHandler.SuccessResponse(true, "Blog Deleted Successfully"));
        }

    }
}

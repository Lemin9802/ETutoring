using ETutoring.Business.Dtos.Blogs;
using ETutoring.Business.Interfaces.Services;
using ETutoring.Core.Common;
using ETutoring.Core.Entities;
using ETutoring.Core.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.JsonWebTokens;
using System.Security.Claims;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ETutoring.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BlogsController : ControllerBase
    {
        private readonly IBlogService _blogService;
        private readonly IBlogLikeService _blogLikeService;
        public BlogsController(IBlogService blogService, IBlogLikeService blogLikeService)
        {
            _blogService = blogService;
            _blogLikeService = blogLikeService;
        }
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
            var userIdString = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            if (string.IsNullOrEmpty(userIdString))
                throw new UnauthorizedAccessException("User not found in JWT token");
            var currentUserId = Guid.Parse(userIdString);

            var blogs = await _blogService.GetAllBlogsAsync(currentUserId, cancellationToken);
            return Ok(ApiResponseHandler.SuccessResponse(blogs, "All blogs retrieved successfully"));
        }
        [HttpPost("get-by-id")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<List<GetAllBlogRequest>>>> GetBlogsOfCurrentUser(CancellationToken cancellationToken = default)
        {
            var userIdString = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            if (string.IsNullOrEmpty(userIdString))
                throw new UnauthorizedAccessException("User not found in JWT token");
            var currentUserId = Guid.Parse(userIdString);
            var blogs = await _blogService.GetBlogByIdAsync(currentUserId, cancellationToken);
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
            var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            var isAdmin = User.IsAdmin();

            var result = await _blogService.DeleteBlogAsync(
                request.Id,
                Guid.Parse(userId!),
                isAdmin,
                cancellationToken
            );
            if (!result)
                return Forbid();

            return Ok(ApiResponseHandler.SuccessResponse(true, "Blog Deleted Successfully"));
        }
        [HttpPost("like-process")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<object>>> ProcessLikeAsync(
            [FromBody] LikeBlogRequest request,
            CancellationToken cancellationToken = default)
        {
            var userId = User.GetUserId();
            if (userId == Guid.Empty)
                return Unauthorized(ApiResponseHandler.FailureResponse<object>("User not found"));
            request.UserId = userId;
            var (isLiked, message) = await _blogLikeService.ProcessLikeAsync(request, cancellationToken);
            if (message == "Blog not found")
                return NotFound(ApiResponseHandler.FailureResponse<object>(message));
            return Ok(ApiResponseHandler.SuccessResponse(new { IsLiked = isLiked }, message));
        }
        [HttpPost("liked")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<List<GetAllBlogRequest>>>> GetLikedBlogsAsync(CancellationToken cancellationToken = default)
        {
            var userId = User.GetUserId();
            if (userId == Guid.Empty)
                return Unauthorized(ApiResponseHandler.FailureResponse<List<GetAllBlogRequest>>("User not found"));
            var liked = await _blogLikeService.GetLikedBlogsAsync(userId, cancellationToken);
            return Ok(ApiResponseHandler.SuccessResponse(liked, "Liked blogs retrieved successfully"));
        }
    }
}

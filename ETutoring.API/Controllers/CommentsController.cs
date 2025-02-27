using ETutoring.Business.Dtos.Blogs;
using ETutoring.Business.Interfaces.Services;
using ETutoring.Core.Common;
using ETutoring.Core.Entities;
using ETutoring.Core.Helpers;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace ETutoring.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommentsController : ControllerBase
    {
        private readonly ICommentService _commentService;

        public CommentsController(ICommentService commentService)
        {
            _commentService = commentService;
        }

        [HttpPost("create")]
        public async Task<ActionResult<ApiResponse<Comment>>> CreateCommentAsync([FromBody] CreateCommentRequest request, CancellationToken cancellationToken = default)
        {
            var comment = await _commentService.CreateCommentAsync(request, cancellationToken);
            return Ok(ApiResponseHandler.SuccessResponse(comment, "Comment created successfully"));
        }

        [HttpPost("get-by-blog")]
        public async Task<ActionResult<ApiResponse<List<Comment>>>> GetCommentsByBlogIdAsync([FromBody] Guid blogId, CancellationToken cancellationToken)
        {
            var comments = await _commentService.GetCommentsByBlogIdAsync(blogId, cancellationToken);
            return Ok(ApiResponseHandler.SuccessResponse(comments, "Retrieved comments successfully"));
        }

        [HttpPost("update")]
        public async Task<ActionResult<ApiResponse<Comment>>> UpdateCommentAsync([FromBody] Guid commentId,  string newContent,  CancellationToken cancellationToken)
        {
            var userId = User.GetUserId();
            var isAdmin = User.IsAdmin();

            var updatedComment = await _commentService.UpdateCommentAsync(commentId, userId, newContent, cancellationToken);

            if (updatedComment == null)
                return NotFound(ApiResponseHandler.FailureResponse<Comment>("Comment not found"));

            return Ok(ApiResponseHandler.SuccessResponse(updatedComment, "Comment updated successfully"));
        }


        [HttpPost("delete")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteCommentAsync([FromBody] Guid commentId, CancellationToken cancellationToken)
        {
            var userId = User.GetUserId();
            var isAdmin = User.IsAdmin();

            var isDeleted = await _commentService.DeleteCommentAsync(commentId, userId, isAdmin, cancellationToken);
            if (!isDeleted)
                return Forbid("You do not have permission to delete this comment");

            return Ok(ApiResponseHandler.SuccessResponse(true, "Comment deleted successfully"));
        }
    }
}

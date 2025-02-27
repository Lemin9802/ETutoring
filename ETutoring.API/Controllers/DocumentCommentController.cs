using ETutoring.Business.Dtos.Documents;
using ETutoring.Business.Interfaces.Services;
using ETutoring.Core.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ETutoring.API.Controllers;

[Authorize]
[ApiController]
[Route("api/documents/comments")]
[Produces("application/json")]
public class DocumentCommentController : ControllerBase
{
    private readonly IDocumentCommentService _commentService;

    public DocumentCommentController(IDocumentCommentService commentService)
    {
        _commentService = commentService;
    }

    /// <summary>
    /// Gets all comments for a specific document
    /// </summary>
    /// <param name="documentId">The ID of the document</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of document comments with their replies</returns>
    [HttpPost("get/{documentId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<List<DocumentCommentResponse>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<List<DocumentCommentResponse>>>> GetDocumentComments(
        Guid documentId,
        CancellationToken cancellationToken)
    {
        var result = await _commentService.GetDocumentCommentsAsync(documentId, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Creates a new comment for a document
    /// </summary>
    /// <param name="request">The comment creation request</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success response if comment is created</returns>
    [HttpPost("create")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<Unit>>> CreateComment(
        [FromBody] CreateDocumentCommentRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _commentService.CreateCommentAsync(request, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, result);
    }

    /// <summary>
    /// Updates an existing comment
    /// </summary>
    /// <param name="commentId">The ID of the comment to update</param>
    /// <param name="request">The comment update request</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Updated comment</returns>
    [HttpPost("update/{commentId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<DocumentCommentResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<DocumentCommentResponse>>> UpdateComment(
        Guid commentId,
        [FromBody] UpdateDocumentCommentRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _commentService.UpdateCommentAsync(commentId, request, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Deletes a comment and all its replies
    /// </summary>
    /// <param name="commentId">The ID of the comment to delete</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success response if comment is deleted</returns>
    [HttpPost("delete/{commentId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<Unit>>> DeleteComment(
        Guid commentId,
        CancellationToken cancellationToken)
    {
        var result = await _commentService.DeleteCommentAsync(commentId, cancellationToken);
        return Ok(result);
    }
} 
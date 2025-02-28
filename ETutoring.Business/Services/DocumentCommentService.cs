using ETutoring.Business.Dtos.Documents;
using ETutoring.Business.Interfaces;
using ETutoring.Business.Interfaces.Services;
using ETutoring.Core.Common;
using ETutoring.Core.Entities;
using ETutoring.Core.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace ETutoring.Business.Services;

public class DocumentCommentService : IDocumentCommentService
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityServices _identityServices;

    public DocumentCommentService(IApplicationDbContext context, IIdentityServices identityServices)
    {
        _context = context;
        _identityServices = identityServices;
    }

    public async Task<ApiResponse<Unit>> CreateCommentAsync(CreateDocumentCommentRequest request, CancellationToken cancellationToken)
    {
        // Validate document exists
        var document = await _context.Documents
            .FirstOrDefaultAsync(d => d.Id == request.DocumentId, cancellationToken);
        if (document == null)
            throw new NotFoundException("Document not found");

        // Validate parent comment if provided
        if (request.ParentCommentId.HasValue)
        {
            var parentComment = await _context.DocumentComments
                .FirstOrDefaultAsync(c => c.Id == request.ParentCommentId, cancellationToken);
            if (parentComment == null)
                throw new NotFoundException("Parent comment not found");
        }

        var comment = new DocumentComment
        {
            DocumentId = request.DocumentId,
            CommenterId = request.CommenterId,
            Content = request.Content,
            ParentCommentId = request.ParentCommentId
        };

        await _context.DocumentComments.AddAsync(comment, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.SuccessResponse(Unit.Value);
    }

    public async Task<ApiResponse<DocumentCommentResponse>> UpdateCommentAsync(Guid commentId, UpdateDocumentCommentRequest request, CancellationToken cancellationToken)
    {
        var comment = await _context.DocumentComments
            .FirstOrDefaultAsync(c => c.Id == commentId, cancellationToken);
        if (comment == null)
            throw new NotFoundException("Comment not found");

        comment.Content = request.Content;
        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<DocumentCommentResponse>.SuccessResponse(
            await MapToResponseAsync(comment, cancellationToken));
    }

    public async Task<ApiResponse<Unit>> DeleteCommentAsync(Guid commentId, CancellationToken cancellationToken)
    {
        var comment = await _context.DocumentComments
            .Include(c => c.Replies)
            .FirstOrDefaultAsync(c => c.Id == commentId, cancellationToken);
        if (comment == null)
            throw new NotFoundException("Comment not found");

        // Remove all replies first
        _context.DocumentComments.RemoveRange(comment.Replies);

        // Remove the comment
        _context.DocumentComments.Remove(comment);
        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.SuccessResponse(Unit.Value);
    }

    public async Task<ApiResponse<List<DocumentCommentResponse>>> GetDocumentCommentsAsync(Guid documentId, CancellationToken cancellationToken)
    {
        var comments = await _context.DocumentComments
            .Include(c => c.Replies)
            .Include(c => c.Commenter)
            .Where(c => c.DocumentId == documentId && c.ParentCommentId == null)
            .ToListAsync(cancellationToken);

        var responses = new List<DocumentCommentResponse>();
        foreach (var comment in comments)
        {
            responses.Add(await MapToResponseAsync(comment, cancellationToken));
        }

        return ApiResponse<List<DocumentCommentResponse>>.SuccessResponse(responses);
    }

    private async Task<DocumentCommentResponse> MapToResponseAsync(DocumentComment comment, CancellationToken cancellationToken)
    {
        var commenter = await _identityServices.GetUserByIdAsync(comment.CommenterId);
        var response = new DocumentCommentResponse
        {
            Id = comment.Id,
            DocumentId = comment.DocumentId,
            CommenterId = comment.CommenterId,
            Content = comment.Content,
            ParentCommentId = comment.ParentCommentId,
            CreatedAt = comment.CreatedAt,
            UpdatedAt = comment.UpdatedAt,
            CommenterName = commenter?.Data.FullName ?? "Unknown User",
            Replies = new List<DocumentCommentResponse>()
        };

        foreach (var reply in comment.Replies)
        {
            response.Replies.Add(await MapToResponseAsync(reply, cancellationToken));
        }

        return response;
    }
}
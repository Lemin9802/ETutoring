using ETutoring.Business.Dtos.Documents;
using ETutoring.Core.Common;

namespace ETutoring.Business.Interfaces.Services;

public interface IDocumentCommentService
{
    Task<ApiResponse<Unit>> CreateCommentAsync(CreateDocumentCommentRequest request, CancellationToken cancellationToken);
    Task<ApiResponse<DocumentCommentResponse>> UpdateCommentAsync(Guid commentId, UpdateDocumentCommentRequest request, CancellationToken cancellationToken);
    Task<ApiResponse<Unit>> DeleteCommentAsync(Guid commentId, CancellationToken cancellationToken);
    Task<ApiResponse<List<DocumentCommentResponse>>> GetDocumentCommentsAsync(Guid documentId, CancellationToken cancellationToken);
}
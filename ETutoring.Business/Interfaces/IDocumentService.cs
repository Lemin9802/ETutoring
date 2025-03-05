using ETutoring.Business.Dtos;
using ETutoring.Business.Dtos.Documents;
using ETutoring.Core.Common;

namespace ETutoring.Business.Interfaces;

public interface IDocumentService
{
    Task<ApiResponse<Unit>> UploadDocumentAsync(UploadDocumentRequest request, CancellationToken cancellationToken);
    Task<ApiResponse<List<DocumentResponse>>> GetDocumentsByUserIdAsync(Guid userId, MetaResponse meta, CancellationToken cancellationToken);
    Task<ApiResponse<Unit>> DeleteDocumentAsync(Guid documentId, CancellationToken cancellationToken);
}
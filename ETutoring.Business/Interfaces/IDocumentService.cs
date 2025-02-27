using ETutoring.Business.Dtos.Documents;
using ETutoring.Core.Common;

namespace ETutoring.Business.Interfaces;

public interface IDocumentService
{
    Task<ApiResponse<DocumentResponse>> UploadDocumentAsync(UploadDocumentRequest request, CancellationToken cancellationToken);
    Task<ApiResponse<List<DocumentResponse>>> GetDocumentsByTutorIdAsync(Guid tutorId, CancellationToken cancellationToken);
    Task<ApiResponse<List<DocumentResponse>>> GetDocumentsByStudentIdAsync(Guid studentId, CancellationToken cancellationToken);
    Task<ApiResponse<Unit>> DeleteDocumentAsync(Guid documentId, CancellationToken cancellationToken);
    Task<ApiResponse<DocumentResponse>> GetDocumentByIdAsync(Guid ownerId, Guid documentId, CancellationToken cancellationToken);
}
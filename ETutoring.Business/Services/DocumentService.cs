using ETutoring.Business.Dtos;
using ETutoring.Business.Dtos.Documents;
using ETutoring.Business.Exceptions;
using ETutoring.Business.Interfaces;
using ETutoring.Core.Common;
using ETutoring.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace ETutoring.Business.Services;

public class DocumentService : IDocumentService
{
    private readonly IApplicationDbContext _context;
    private readonly IStorageService _storageService;
    private readonly IIdentityServices _identityServices;

    public DocumentService(IApplicationDbContext context, IStorageService storageService, IIdentityServices identityServices)
    {
        _context = context;
        _storageService = storageService;
        _identityServices = identityServices;
    }

    public async Task<ApiResponse<Unit>> UploadDocumentAsync(UploadDocumentRequest request, CancellationToken cancellationToken)
    {
        // Validate if tutor exists
        var tutor = await _identityServices.GetUserByIdAsync(request.TutorId);
        if (tutor.Data == null)
            throw new EntityNotFoundException("Tutor", request.TutorId);

        // Upload file to storage
        var fileUrl = await _storageService.UploadFileAsync(request.File, "documents");

        // Create document record
        var document = new Document
        {
            UploaderId = request.UploaderId,
            TutorId = request.TutorId,
            FileUrl = fileUrl,
            FileName = request.Title,
            Description = request.Description
        };

        _context.Documents.Add(document);
        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.SuccessResponse(Unit.Value);
    }

    public async Task<ApiResponse<List<DocumentResponse>>> GetDocumentsByUserIdAsync(
        Guid userId,
        MetaRequest meta,
        CancellationToken cancellationToken)
    {
        // Get the total count of documents for pagination
        var totalItems = await _context.Documents
            .Where(d => d.UploaderId == userId)
            .CountAsync(cancellationToken);

        // Calculate total pages
        int totalPages = (int)Math.Ceiling((double)totalItems / meta.PageSize);

        // Retrieve paginated documents
        var documents = await _context.Documents
            .Where(d => d.UploaderId == userId || d.TutorId == userId)
            .OrderBy(d => d.CreatedAt)
            .Skip((meta.PageNumber - 1) * meta.PageSize)
            .Take(meta.PageSize)
            .Include(d => d.Tutor)
            .Select(d => new DocumentResponse
            {
                Id = d.Id,
                UploaderId = d.UploaderId,
                RecipientName = d.Tutor.FullName,
                FileUrl = d.FileUrl,
                Title = d.FileName,
                Description = d.Description,
                Status = d.Status,
                UpdatedAt = d.UpdatedAt
            })
            .ToListAsync(cancellationToken);

        // Create metadata response
        var metaData = new MetaDataResponse(meta.PageNumber, meta.PageSize, totalPages, totalItems);

        return ApiResponse<List<DocumentResponse>>.SuccessResponseWithMeta(documents, metaData);
    }


    public async Task<ApiResponse<Unit>> DeleteDocumentAsync(Guid documentId, CancellationToken cancellationToken)
    {
        var document = await _context.Documents.FirstOrDefaultAsync(d => d.Id == documentId, cancellationToken);
        if (document == null)
            throw new EntityNotFoundException("Document", documentId);

        await _storageService.DeleteFileAsync(document.FileUrl);

        _context.Documents.Remove(document);
        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.SuccessResponse(Unit.Value);
    }
}
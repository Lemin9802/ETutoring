using ETutoring.Business.Dtos.Documents;
using ETutoring.Business.Interfaces;
using ETutoring.Core.Common;
using ETutoring.Core.Entities;
using ETutoring.Core.Exceptions;
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

    public async Task<ApiResponse<DocumentResponse>> UploadDocumentAsync(UploadDocumentRequest request, CancellationToken cancellationToken)
    {
        // Validate if tutor exists
        var tutor = await _identityServices.GetUserByIdAsync(request.TutorId);
        if (tutor == null)
            throw new NotFoundException("Tutor not found");

        // Upload file to storage
        var fileUrl = await _storageService.UploadFileAsync(request.File, "documents");

        // Create document record
        var document = new Document
        {
            UploaderId = request.UploaderId,
            TutorId = request.TutorId,
            FileUrl = fileUrl,
            FileName = request.File.FileName,
            Description = request.Description
        };

        _context.Documents.Add(document);
        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<DocumentResponse>.SuccessResponse(new DocumentResponse
        {
            Id = document.Id,
            UploaderId = document.UploaderId,
            TutorId = document.TutorId,
            FileUrl = document.FileUrl,
            FileName = document.FileName,
            Description = document.Description,
            UploadedAt = document.UploadedAt
        });
    }

    public async Task<ApiResponse<List<DocumentResponse>>> GetDocumentsByTutorIdAsync(Guid tutorId, CancellationToken cancellationToken)
    {
        var documents = await _context.Documents
            .Where(d => d.TutorId == tutorId)
            .Select(d => new DocumentResponse
            {
                Id = d.Id,
                UploaderId = d.UploaderId,
                TutorId = d.TutorId,
                FileUrl = d.FileUrl,
                FileName = d.FileName,
                Description = d.Description,
                UploadedAt = d.UploadedAt
            })
            .ToListAsync(cancellationToken);

        return ApiResponse<List<DocumentResponse>>.SuccessResponse(documents);
    }


    public async Task<ApiResponse<List<DocumentResponse>>> GetDocumentsByStudentIdAsync(Guid studentId, CancellationToken cancellationToken)
    {
        var documents = await _context.Documents
            .Where(d => d.UploaderId == studentId)
            .Select(d => new DocumentResponse
            {
                Id = d.Id,
                UploaderId = d.UploaderId,
                TutorId = d.TutorId,
                FileUrl = d.FileUrl,
                FileName = d.FileName,
                Description = d.Description,
                UploadedAt = d.UploadedAt
            })
            .ToListAsync(cancellationToken);

        return ApiResponse<List<DocumentResponse>>.SuccessResponse(documents);

    }

    public async Task<ApiResponse<Unit>> DeleteDocumentAsync(Guid documentId, CancellationToken cancellationToken)
    {
        var document = await _context.Documents.FirstOrDefaultAsync(d => d.Id == documentId, cancellationToken);
        if (document == null)
            throw new NotFoundException("Document not found");

        await _storageService.DeleteFileAsync(document.FileUrl);

        _context.Documents.Remove(document);
        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.SuccessResponse(Unit.Value);
    }

    public async Task<ApiResponse<DocumentResponse>> GetDocumentByIdAsync(Guid ownerId, Guid documentId, CancellationToken cancellationToken)
    {
        var document = await _context.Documents.FirstOrDefaultAsync(d => d.Id == documentId && d.UploaderId == ownerId, cancellationToken);
        if (document == null)
            throw new NotFoundException("Document not found");

        return ApiResponse<DocumentResponse>.SuccessResponse(new DocumentResponse
        {
            Id = document.Id,
            UploaderId = document.UploaderId,
            TutorId = document.TutorId,
            FileUrl = document.FileUrl,
            FileName = document.FileName,
            Description = document.Description,
            UploadedAt = document.UploadedAt
        });
    }
}
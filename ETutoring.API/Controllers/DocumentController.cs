using ETutoring.Business.Dtos.Documents;
using ETutoring.Business.Interfaces;
using ETutoring.Core.Common;
using ETutoring.Core.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.JsonWebTokens;
using Swashbuckle.AspNetCore.Annotations;

namespace ETutoring.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DocumentController : ControllerBase
{
    private readonly IDocumentService _documentService;

    public DocumentController(IDocumentService documentService)
    {
        _documentService = documentService;
    }

    [HttpPost("upload")]
    [SwaggerOperation(Summary = "Upload a document")]
    public async Task<ActionResult<ApiResponse<DocumentResponse>>> UploadDocument([FromForm] UploadDocumentRequest request, CancellationToken cancellationToken)
    {
        var result = await _documentService.UploadDocumentAsync(request, cancellationToken);
        return Ok(result);
    }

    [HttpPost("tutor")]
    public async Task<ActionResult<ApiResponse<Document>>> GetDocumentsByTutor(CancellationToken cancellationToken)
    {
        var tutorId = Guid.TryParse(User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value, out var parsedId) ? parsedId : Guid.Empty;

        var documents = await _documentService.GetDocumentsByTutorIdAsync(tutorId, cancellationToken);
        return Ok(documents);
    }

    [HttpPost("student")]
    public async Task<ActionResult<ApiResponse<Document>>> GetDocumentsByStudent(CancellationToken cancellationToken)
    {
        Guid studentId = Guid.TryParse(User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value, out var parsedId) ? parsedId : Guid.Empty;

        var documents = await _documentService.GetDocumentsByStudentIdAsync(studentId, cancellationToken);
        return Ok(documents);
    }

    [HttpPost("delete")]
    [SwaggerOperation(Summary = "Delete a document")]
    public async Task<ActionResult<ApiResponse<Unit>>> DeleteDocument(Guid id, CancellationToken cancellationToken)
    {
        var result = await _documentService.DeleteDocumentAsync(id, cancellationToken);
        return Ok(result);
    }

    [HttpPost("get-by-user-id")]
    [SwaggerOperation(Summary = "Get document by ID")]
    public async Task<ActionResult<ApiResponse<DocumentResponse>>> GetDocumentById([FromBody] Guid documentId, CancellationToken cancellationToken)
    {
        Guid ownerId = Guid.TryParse(User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value, out var parsedId) ? parsedId : Guid.Empty;

        var result = await _documentService.GetDocumentByIdAsync(ownerId, documentId, cancellationToken);
        return Ok(result);
    }
}
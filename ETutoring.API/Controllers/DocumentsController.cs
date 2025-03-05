using ETutoring.Business.Dtos;
using ETutoring.Business.Dtos.Documents;
using ETutoring.Business.Interfaces;
using ETutoring.Core.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.JsonWebTokens;
using Swashbuckle.AspNetCore.Annotations;

namespace ETutoring.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DocumentsController : ControllerBase
{
    private readonly IDocumentService _documentService;

    public DocumentsController(IDocumentService documentService)
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

    [HttpPost("user")]
    public async Task<ActionResult<ApiResponse<DocumentResponse>>> GetDocumentsByTutor(MetaResponse meta, CancellationToken cancellationToken)
    {
        var userId = Guid.TryParse(User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value, out var parsedId) ? parsedId : Guid.Empty;

        var documents = await _documentService.GetDocumentsByUserIdAsync(userId, meta, cancellationToken);
        return Ok(documents);
    }

    [HttpPost("delete")]
    [SwaggerOperation(Summary = "Delete a document")]
    public async Task<ActionResult<ApiResponse<Unit>>> DeleteDocument(Guid id, CancellationToken cancellationToken)
    {
        var result = await _documentService.DeleteDocumentAsync(id, cancellationToken);
        return Ok(result);
    }
}
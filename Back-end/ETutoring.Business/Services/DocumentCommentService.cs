using ETutoring.Business.Dtos.Documents;
using ETutoring.Business.Exceptions;
using ETutoring.Business.Interfaces;
using ETutoring.Business.Interfaces.Services;
using ETutoring.Core.Common;
using ETutoring.Core.Entities;
using ETutoring.Core.EmailTemplate; 
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ETutoring.Business.Services
{
    public class DocumentCommentService : IDocumentCommentService
    {
        private readonly IApplicationDbContext _context;
        private readonly IIdentityServices _identityServices;
        private readonly IEmailService _emailService; 

        public DocumentCommentService(
            IApplicationDbContext context,
            IIdentityServices identityServices,
            IEmailService emailService)
        {
            _context = context;
            _identityServices = identityServices;
            _emailService = emailService;
        }

        public async Task<ApiResponse<DocumentCommentResponse>> CreateCommentAsync(CreateDocumentCommentRequest request, CancellationToken cancellationToken)
        {
            var document = await _context.Documents
                .Include(d => d.Tutor)
                .Include(d => d.Uploader)
                .FirstOrDefaultAsync(d => d.Id == request.DocumentId, cancellationToken);
            if (document == null)
                throw new EntityNotFoundException("Document", request.DocumentId);
            if (request.ParentCommentId.HasValue)
            {
                var parentComment = await _context.DocumentComments
                    .FirstOrDefaultAsync(c => c.Id == request.ParentCommentId, cancellationToken);
                if (parentComment == null)
                    throw new EntityNotFoundException("Document Comments", request.ParentCommentId);
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
            try
            {
                var commenterResult = await _identityServices.GetUserByIdAsync(comment.CommenterId);
                var commenterName = commenterResult?.Data.FullName ?? "Unknown User";
                var documentLink = $"http://localhost:3000/documents/detail?id={document.Id}";
                var studentPlaceholders = new Dictionary<string, string>
                {
                    { "StudentName", document.Uploader?.FullName ?? "Student" },
                    { "DocumentTitle", document.FileName },
                    { "CommentContent", comment.Content },
                    { "CommenterName", commenterName },
                    { "DocumentLink", documentLink }
                };

                var emailForStudent = new EmailTemplateRequest(
                    document.UploaderId,
                    document.Uploader?.Email, 
                    "New Comment on Your Document",
                    EmailTemplateType.DocumentCommentForStudent,
                    studentPlaceholders
                );

                var tutorPlaceholders = new Dictionary<string, string>
                {
                    { "TutorName", document.Tutor?.FullName ?? "Tutor" },
                    { "DocumentTitle", document.FileName },
                    { "CommentContent", comment.Content },
                    { "CommenterName", commenterName },
                    { "DocumentLink", documentLink }
                };

                var emailForTutor = new EmailTemplateRequest(
                    document.TutorId,
                    document.Tutor?.Email,
                    "New Comment on Document",
                    EmailTemplateType.DocumentCommentForTutor,
                    tutorPlaceholders
                );

                await Task.WhenAll(
                    _emailService.SendEmailAsync(emailForStudent),
                    _emailService.SendEmailAsync(emailForTutor)
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending comment notification email: {ex.Message}");
            }

            var response = new DocumentCommentResponse()
            {
                Id = comment.Id,
                DocumentId = comment.DocumentId,
                CommenterId = comment.CommenterId,
                Content = comment.Content,
                ParentCommentId = comment.ParentCommentId,
                CreatedAt = comment.CreatedAt,
                UpdatedAt = comment.UpdatedAt,
                CommenterName = (await _identityServices.GetUserByIdAsync(comment.CommenterId))?.Data.FullName ?? "Unknown User",
                Replies = new List<DocumentCommentResponse>()
            };

            return ApiResponse<DocumentCommentResponse>.SuccessResponse(response);
        }

        public async Task<ApiResponse<DocumentCommentResponse>> UpdateCommentAsync(Guid commentId, UpdateDocumentCommentRequest request, CancellationToken cancellationToken)
        {
            var comment = await _context.DocumentComments
                .FirstOrDefaultAsync(c => c.Id == commentId, cancellationToken);
            if (comment == null)
                throw new EntityNotFoundException("Document Comments", commentId);

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
                throw new EntityNotFoundException("Document Comments", commentId);

            _context.DocumentComments.RemoveRange(comment.Replies);

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
}

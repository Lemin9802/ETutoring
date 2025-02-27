using ETutoring.Business.Dtos.Documents;
using ETutoring.Business.Interfaces;
using ETutoring.Business.Services;
using ETutoring.Core.Entities;
using FluentAssertions;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Moq;
using Moq.EntityFrameworkCore;

namespace ETutoring.API.Tests.Services;

public class DocumentCommentServiceTests
{
    private readonly Mock<IApplicationDbContext> _contextMock;
    private readonly Mock<IIdentityServices> _identityServicesMock;
    private readonly DocumentCommentService _documentCommentService;

    public DocumentCommentServiceTests()
    {
        _contextMock = new Mock<IApplicationDbContext>();
        _identityServicesMock = new Mock<IIdentityServices>();
        _documentCommentService = new DocumentCommentService(_contextMock.Object, _identityServicesMock.Object);
    }

    [Fact]
    public async Task CreateCommentAsync_ShouldCreateComment_WhenDocumentExists()
    {
        // Arrange
        var documentId = Guid.NewGuid();
        var request = new CreateDocumentCommentRequest
        {
            DocumentId = documentId,
            CommenterId = Guid.NewGuid(),
            Content = "Test comment",
            ParentCommentId = null
        };

        var mockDocument = new Document { Id = documentId };
        var documentList = new List<Document> { mockDocument };
        var commentList = new List<DocumentComment>();

        // Use Moq.EntityFrameworkCore to mock DbSet
        _contextMock.Setup(c => c.Documents).ReturnsDbSet(documentList);
        _contextMock.Setup(c => c.DocumentComments).ReturnsDbSet(commentList);

        // Correctly mock AddAsync
        _contextMock.Setup(c => c.DocumentComments.AddAsync(It.IsAny<DocumentComment>(), It.IsAny<CancellationToken>()))
            .Callback<DocumentComment, CancellationToken>((comment, _) => commentList.Add(comment))
            .Returns((DocumentComment comment, CancellationToken _) =>
                new ValueTask<EntityEntry<DocumentComment>>((EntityEntry<DocumentComment>)null));

        // Mock SaveChangesAsync
        _contextMock.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        // Act
        var result = await _documentCommentService.CreateCommentAsync(request, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        commentList.Should().HaveCount(1);
    }
}
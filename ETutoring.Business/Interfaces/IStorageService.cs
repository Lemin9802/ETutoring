using Microsoft.AspNetCore.Http;

namespace ETutoring.Business.Interfaces;

public interface IStorageService
{
    Task<string> UploadFileAsync(IFormFile file, string directory);
    Task DeleteFileAsync(string fileUrl);
} 
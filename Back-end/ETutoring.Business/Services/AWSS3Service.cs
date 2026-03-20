using Amazon;
using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using ETutoring.Business.Interfaces;
using ETutoring.Business.Settings;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace ETutoring.Business.Services;

public class AWSS3Service : IStorageService
{
    private readonly IAmazonS3 _s3Client;
    private readonly AWSSettings _settings;

    public AWSS3Service(IOptions<AWSSettings> options)
    {
        _settings = options.Value;
        var awsCredentials = new BasicAWSCredentials(_settings.AccessKey, _settings.SecretKey);
        _s3Client = new AmazonS3Client(awsCredentials, RegionEndpoint.GetBySystemName(_settings.Region));
    }

    public async Task<string> UploadFileAsync(IFormFile file, string directory)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("File is empty");

        var fileName = $"{directory}/{Guid.NewGuid()}-{file.FileName}";

        using var ms = new MemoryStream();
        await file.CopyToAsync(ms);
        ms.Position = 0;

        var request = new PutObjectRequest
        {
            BucketName = _settings.BucketName,
            Key = fileName,
            InputStream = ms,
            ContentType = file.ContentType
        };

        await _s3Client.PutObjectAsync(request);

        return $"https://{_settings.BucketName}.s3.amazonaws.com/{fileName}";
    }

    public async Task DeleteFileAsync(string fileUrl)
    {
        if (string.IsNullOrEmpty(fileUrl))
            return;

        var key = new Uri(fileUrl).AbsolutePath.TrimStart('/');

        var deleteRequest = new DeleteObjectRequest
        {
            BucketName = _settings.BucketName,
            Key = key
        };

        await _s3Client.DeleteObjectAsync(deleteRequest);
    }
}
namespace ETutoring.Business.Settings;

public record AWSSettings
{
    public string Profile { get; set; } = string.Empty;
    public string Region { get; set; } = string.Empty;
    public string AccessKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = string.Empty;
    public string BucketName { get; set; } = string.Empty;
}
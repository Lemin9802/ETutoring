namespace ETutoring.Business.Dtos.Auth;

public record TokenResponse
{
    public string AccessToken { get; init; }

    public string RefreshToken { get; init; }
}
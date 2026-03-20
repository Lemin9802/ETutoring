namespace ETutoring.Core.Utilities;

public class AuthResult<T>
{
    public bool IsSuccess { get; set; }
    public T? Data { get; set; }
    public List<string>? Errors { get; set; }

    public static AuthResult<T> Success(T data)
    {
        return new AuthResult<T> { IsSuccess = true, Data = data, Errors = new List<string>() };
    }

    public static AuthResult<T> Failure(params string[] errors)
    {
        return new AuthResult<T> { IsSuccess = false, Data = default, Errors = errors.ToList() };
    }
}

namespace ETutoring.Core.Utilities;

public class Result<T>
{
    public bool IsSuccess { get; set; }
    public T? Data { get; set; }
    public List<string>? Errors { get; set; }

    public static Result<T> Success(T data)
    {
        return new Result<T> { IsSuccess = true, Data = data, Errors = new List<string>() };
    }

    public static Result<T> Failure(params string[] errors)
    {
        return new Result<T> { IsSuccess = false, Data = default, Errors = errors.ToList() };
    }
}

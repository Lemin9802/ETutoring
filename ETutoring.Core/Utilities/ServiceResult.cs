namespace ETutoring.Core.Utilities;

public class ServiceResult<T>
{
    public bool IsSuccess { get; set; }
    public T Data { get; set; }
    public List<string> Errors { get; set; }

    public static ServiceResult<T> Success(T data)
    {
        return new ServiceResult<T> { IsSuccess = true, Data = data, Errors = new List<string>() };
    }

    public static ServiceResult<T> Failure(params string[] errors)
    {
        return new ServiceResult<T> { IsSuccess = false, Data = default, Errors = errors.ToList() };
    }
}

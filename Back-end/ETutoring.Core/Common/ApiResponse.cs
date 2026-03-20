namespace ETutoring.Core.Common;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public T? Data { get; set; }
    public ICollection<string>? Errors { get; set; }
    public MetaDataResponse? Meta { get; set; }

    public ApiResponse(bool success, string message, T? data = default, ICollection<string>? errors = null, MetaDataResponse? meta = null)
    {
        // Ensure data is present when the request is successful
        if (success && data == null)
        {
            throw new ArgumentNullException(nameof(data), "Data cannot be null when the response is successful.");
        }

        Success = success;
        Message = message;
        Data = data;
        Errors = errors;
        Meta = meta;
    }

    public static ApiResponse<T> SuccessResponse(T data, string message = "Request successful.")
    {
        return new ApiResponse<T>(true, message, data);
    }

    public static ApiResponse<T> SuccessResponseWithMeta(T data, MetaDataResponse meta,
        string message = "Request successful")
    {
        return new ApiResponse<T>(true, message, data, meta: meta);
    }

    public static ApiResponse<T> FailureResponse(string message, ICollection<string>? errors = null)
    {
        return new ApiResponse<T>(false, message, default, errors);
    }
}

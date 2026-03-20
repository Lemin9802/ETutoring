using ETutoring.Core.Common;

namespace ETutoring.Core.Helpers;

public static class ApiResponseHandler
{
    public static ApiResponse<T> SuccessResponse<T>(T data, string message = "Request successful.")
    {
        if (data == null)
        {
            throw new ArgumentNullException(nameof(data), "Data cannot be null for a successful response.");
        }

        return new ApiResponse<T>(true, message, data);
    }

    public static ApiResponse<T> FailureResponse<T>(string message, ICollection<string>? errors = null)
    {
        return new ApiResponse<T>(false, message, default, errors);
    }
}

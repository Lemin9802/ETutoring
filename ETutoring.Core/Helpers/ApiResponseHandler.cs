using ETutoring.Core.Common;

namespace ETutoring.Core.Helpers;

public class ApiResponseHandler
{
    public static ApiResponse<T> SuccessResponse<T>(T data, string message = "Request successful.")
    {
        return new ApiResponse<T>(true, message, data);
    }
    public static ApiResponse<T> FailureResponse<T>(string message)
    {
        return new ApiResponse<T>(false, message, default);
    }

}
namespace EzBias.API.Models;

public record ApiResponse<T>(bool Success, T? Data, string Message)
{
    public static ApiResponse<T> Ok(T data, string message = "Success") => new(true, data, message);
    public static ApiResponse<T> Fail(string message, T? data = default) => new(false, data, message);
}

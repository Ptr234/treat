namespace OscApi.Dtos.Common;

public record ApiResponse<T>(bool Success, T? Data = default, string? Error = null, int? Code = null);

public record ApiResponse(bool Success, string? Error = null, int? Code = null);

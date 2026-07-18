/**
 * Mirrors backend/src/OscApi/Dtos/Common/ApiResponse.cs's JSON shape exactly
 * (`{ success, data?, error?, code? }`, camelCase) — the frontend's
 * `apiFetch` (frontend/src/lib/api-client.ts) depends on this shape
 * regardless of which backend served the request.
 */
export interface ApiResponseBody<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: number;
}

export function ok<T>(data?: T, code?: number): ApiResponseBody<T> {
  return { success: true, data, code };
}

export function fail(error: string, code?: number): ApiResponseBody<never> {
  return { success: false, error, code };
}

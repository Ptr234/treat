import { NextResponse } from 'next/server';
import { type ZodSchema, ZodError } from 'zod';

// ── Standard API response helpers ───────────────────────────────────

export function apiSuccess<T>(data: T, meta?: Record<string, unknown>, status = 200) {
  return NextResponse.json({ success: true, data, ...(meta ? { meta } : {}) }, { status });
}

export function apiError(message: string, status = 500, code?: string) {
  return NextResponse.json(
    { success: false, error: message, ...(code ? { code } : {}) },
    { status }
  );
}

// ── Zod body / query param validation ───────────────────────────────

function formatZodError(error: ZodError): string {
  return error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
}

export async function validateBody<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<[T, null] | [null, NextResponse]> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return [null, apiError('Invalid JSON body', 400, 'INVALID_JSON')];
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    return [null, apiError(formatZodError(result.error), 400, 'VALIDATION_ERROR')];
  }

  return [result.data, null];
}

export function validateSearchParams<T>(
  request: Request,
  schema: ZodSchema<T>
): [T, null] | [null, NextResponse] {
  const { searchParams } = new URL(request.url);
  const raw = Object.fromEntries(searchParams.entries());

  const result = schema.safeParse(raw);
  if (!result.success) {
    return [null, apiError(formatZodError(result.error), 400, 'VALIDATION_ERROR')];
  }

  return [result.data, null];
}

// ── Sanitization ────────────────────────────────────────────────────

export function sanitizeString(str: string): string {
  return str.replace(/<[^>]*>/g, '');
}

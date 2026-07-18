/** Mirrors backend/src/OscApi/Common/SanitizeHelper.cs. */
export function stripHtml(input: string): string {
  if (!input) return input;
  return input.replace(/<[^>]*>/g, '').trim();
}

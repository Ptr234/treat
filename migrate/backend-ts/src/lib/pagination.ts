/** Mirrors backend/src/OscApi/Common/Pagination.cs. */
export const MAX_PAGE_SIZE = 200;

export function normalizePagination(from: number, to: number): { skip: number; take: number } {
  const skip = Math.max(0, from);
  const take = Math.min(Math.max(0, to - skip), MAX_PAGE_SIZE);
  return { skip, take };
}

// Single source of truth for dashboard form-field styling. Four pages used
// to each keep their own copy of this string; one of those copies had
// text-white instead of text-black, making every field's typed text
// invisible against the near-white bg-neutral-100 field — importing one
// shared constant means that class of bug can't recur per-page.
export const inputClass =
  'w-full px-4 py-3 bg-neutral-100 border border-neutral-200 text-black placeholder:text-neutral-500 rounded-md focus:ring-2 focus-visible:ring-red-600 focus:border-transparent';

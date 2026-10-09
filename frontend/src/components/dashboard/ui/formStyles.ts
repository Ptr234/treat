// Single source of truth for dashboard form-field styling. Four pages used
// to each keep their own copy of this string; one of those copies had
// text-white instead of text-black, making every field's typed text
// invisible — importing one shared constant means that class of bug can't
// recur per-page.
export const inputClass = 'gov-input';

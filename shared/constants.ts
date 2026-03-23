// Shared constants used by both frontend and backend

export const COOKIE_NAME = 'osc-session';
export const JWT_EXPIRY_HOURS = 24;

export const RATE_LIMITS = {
  chatbot: { permitLimit: 20, windowMinutes: 1 },
  chatLog: { permitLimit: 30, windowMinutes: 1 },
} as const;

export const FILE_UPLOAD = {
  maxSizeBytes: 10 * 1024 * 1024, // 10 MB
  allowedMimeTypes: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
} as const;

export const REFERENCE_PREFIXES = {
  ticket: 'UIA',
  investor: 'INV',
} as const;

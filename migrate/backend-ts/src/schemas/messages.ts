import { z } from 'zod';

export const sendMessageSchema = z.object({
  channel: z.string().min(1),
  content: z.string().min(1),
  senderAgencyCode: z.string().optional(),
  isInternal: z.boolean().optional().default(false),
});

import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { client, serverClient, getWriteClient } from '@/lib/sanity-client';
import { apiSuccess, apiError } from '@/lib/api-utils';
import { requireAdmin } from '@/lib/auth';
import { TICKET_BY_REFERENCE_QUERY } from '@/lib/sanity-queries';
import type { SanityTicket } from '@/types/sanity';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES_PER_REQUEST = 5;
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'text/plain',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

function validateFile(file: File): string | null {
  if (file.size === 0) return `${file.name} is empty`;
  if (file.size > MAX_FILE_SIZE) return `${file.name} exceeds 10MB limit`;
  if (!ALLOWED_TYPES.includes(file.type)) return `File type "${file.type}" is not allowed`;
  return null;
}

/**
 * Attach one or more files to an existing ticket. Mirrors the ASP.NET
 * UploadController: staff use their admin session, the public must prove
 * ownership with the email the ticket was filed under. Not gated by
 * middleware — authorization happens here, per ticket.
 */
async function handleTicketAttachment(request: NextRequest, formData: FormData) {
  const ticketRefNumber = formData.get('ticketRefNumber') as string | null;
  const contactEmail = formData.get('contactEmail') as string | null;
  const files = formData.getAll('files').filter((f): f is File => f instanceof File);

  if (!ticketRefNumber) return apiError('ticketRefNumber is required', 400, 'VALIDATION_ERROR');
  if (files.length === 0) return apiError('No files provided', 400, 'VALIDATION_ERROR');
  if (files.length > MAX_FILES_PER_REQUEST) {
    return apiError(`Maximum ${MAX_FILES_PER_REQUEST} files per upload`, 400, 'VALIDATION_ERROR');
  }

  const ticket = await client.fetch<SanityTicket | null>(TICKET_BY_REFERENCE_QUERY, { ref: ticketRefNumber });
  if (!ticket) return apiError('Ticket not found', 404, 'NOT_FOUND');

  const admin = await requireAdmin(request);
  if (!admin) {
    if (!contactEmail || contactEmail.toLowerCase().trim() !== ticket.contactEmail.toLowerCase()) {
      return apiError('Email does not match ticket', 403, 'EMAIL_MISMATCH');
    }
  }

  for (const file of files) {
    const err = validateFile(file);
    if (err) return apiError(err, 400, 'VALIDATION_ERROR');
  }

  const uploaded: Array<{ id: string; fileName: string; mimeType: string; fileSize: number; url: string }> = [];
  const docRefs: Array<Record<string, unknown>> = [];

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const asset = await serverClient.assets.upload('file', buffer, {
      filename: file.name,
      contentType: file.type,
    });
    const key = randomUUID();
    docRefs.push({ _type: 'file', _key: key, asset: { _type: 'reference', _ref: asset._id } });
    uploaded.push({
      id: key,
      fileName: file.name,
      mimeType: file.type,
      fileSize: file.size,
      url: asset.url,
    });
  }

  await getWriteClient()
    .patch(ticket._id)
    .setIfMissing({ documents: [] })
    .append('documents', docRefs)
    .commit();

  return apiSuccess({ files: uploaded });
}

/** Generic single-file asset upload used by admin/officer tooling (e.g. agency-chat attachments). */
async function handleGenericUpload(request: NextRequest, formData: FormData) {
  const admin = await requireAdmin(request);
  if (!admin) return apiError('Authentication required', 401, 'UNAUTHORIZED');

  const file = formData.get('file') as File | null;
  if (!file) return apiError('No file provided', 400, 'VALIDATION_ERROR');

  const err = validateFile(file);
  if (err) return apiError(err, 400, 'VALIDATION_ERROR');

  const buffer = Buffer.from(await file.arrayBuffer());
  const asset = await serverClient.assets.upload('file', buffer, {
    filename: file.name,
    contentType: file.type,
  });

  return apiSuccess({
    assetId: asset._id,
    url: asset.url,
    originalFilename: file.name,
    size: file.size,
    mimeType: file.type,
    fileRef: {
      _type: 'file',
      asset: { _type: 'reference', _ref: asset._id },
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    if (formData.has('ticketRefNumber')) {
      return await handleTicketAttachment(request, formData);
    }
    return await handleGenericUpload(request, formData);
  } catch (error) {
    console.error('[POST /api/upload]', error);
    return apiError('Upload failed');
  }
}

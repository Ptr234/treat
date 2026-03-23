import { NextRequest } from 'next/server';
import { serverClient } from '@/lib/sanity-client';
import { apiSuccess, apiError } from '@/lib/api-utils';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
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

// Auth enforced by middleware for /api/upload
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return apiError('No file provided', 400, 'VALIDATION_ERROR');
    }

    if (file.size > MAX_FILE_SIZE) {
      return apiError('File too large. Maximum 10MB.', 400, 'VALIDATION_ERROR');
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return apiError(
        `File type "${file.type}" not allowed. Accepted: PDF, DOC, DOCX, PNG, JPG, TXT, XLS, XLSX.`,
        400,
        'VALIDATION_ERROR'
      );
    }

    // Convert File to Buffer for Sanity upload
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Sanity Assets
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
        asset: {
          _type: 'reference',
          _ref: asset._id,
        },
      },
    });
  } catch (error) {
    console.error('[POST /api/upload]', error);
    return apiError('Upload failed');
  }
}

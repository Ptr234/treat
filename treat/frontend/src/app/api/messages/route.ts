import { NextRequest } from 'next/server';
import { client, serverClient } from '@/lib/sanity-client';
import { apiSuccess, apiError } from '@/lib/api-utils';
import { requireAdmin } from '@/lib/auth';

const MESSAGES_QUERY = `*[_type == "agencyMessage" && channel == $channel] | order(sentAt asc) {
  _id,
  channel,
  content,
  senderName,
  senderAgencyCode,
  senderEmail,
  isInternal,
  sentAt,
  "attachments": attachments[]{
    "url": asset->url,
    "originalFilename": asset->originalFilename
  }
}`;

const CHANNELS_QUERY = `{
  "channels": *[_type == "agencyMessage"] {channel} | order(sentAt desc),
  "tickets": *[_type == "ticket"] | order(createdAt desc) [0..20] {
    referenceNumber,
    title,
    status,
    "agencyCode": assignedAgency->code
  }
}`;

export async function GET(request: NextRequest) {
  try {
    // Auth enforced by middleware for /api/messages
    const channel = request.nextUrl.searchParams.get('channel');

    if (channel) {
      const messages = await client.fetch(MESSAGES_QUERY, { channel });
      return apiSuccess(messages);
    }

    const data = await client.fetch(CHANNELS_QUERY);
    const uniqueChannels = [...new Set(data.channels.map((c: { channel: string }) => c.channel))];
    return apiSuccess({ channels: uniqueChannels, tickets: data.tickets });
  } catch (error) {
    console.error('[GET /api/messages]', error);
    return apiError('Failed to fetch messages');
  }
}

export async function POST(request: NextRequest) {
  try {
    // Auth enforced by middleware — use admin identity to prevent impersonation
    const admin = await requireAdmin(request);
    if (!admin) {
      return apiError('Authentication required', 401, 'UNAUTHORIZED');
    }

    const body = await request.json();
    const { channel, content, senderAgencyCode, attachments } = body;

    if (!channel || !content) {
      return apiError('Channel and content are required', 400, 'VALIDATION_ERROR');
    }

    const doc = await serverClient.create({
      _type: 'agencyMessage',
      channel,
      content,
      senderName: admin.name,
      senderAgencyCode: senderAgencyCode || 'UIA',
      senderEmail: admin.email,
      isInternal: false,
      sentAt: new Date().toISOString(),
      ...(Array.isArray(attachments) && attachments.length > 0 ? { attachments } : {}),
    });

    return apiSuccess(doc, undefined, 201);
  } catch (error) {
    console.error('[POST /api/messages]', error);
    return apiError('Failed to send message');
  }
}

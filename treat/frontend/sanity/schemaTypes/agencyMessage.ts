import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'agencyMessage',
  title: 'Agency Message',
  type: 'document',
  fields: [
    defineField({
      name: 'channel',
      title: 'Channel',
      type: 'string',
      description: 'Channel ID: "general" or ticket reference like "UIA-2026-0001"',
      validation: r => r.required(),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'text',
      validation: r => r.required(),
    }),
    defineField({
      name: 'senderName',
      title: 'Sender Name',
      type: 'string',
      validation: r => r.required(),
    }),
    defineField({
      name: 'senderAgency',
      title: 'Sender Agency',
      type: 'reference',
      to: [{ type: 'agency' }],
    }),
    defineField({
      name: 'senderAgencyCode',
      title: 'Sender Agency Code',
      type: 'string',
    }),
    defineField({
      name: 'senderEmail',
      title: 'Sender Email',
      type: 'email',
    }),
    defineField({
      name: 'attachments',
      title: 'Attachments',
      type: 'array',
      of: [{ type: 'file' }],
    }),
    defineField({
      name: 'isInternal',
      title: 'Internal Only',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'sentAt',
      title: 'Sent At',
      type: 'datetime',
    }),
  ],
  preview: {
    select: { title: 'senderName', subtitle: 'channel' },
  },
});

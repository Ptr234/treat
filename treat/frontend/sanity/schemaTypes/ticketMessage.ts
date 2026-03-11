import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'ticketMessage',
  title: 'Ticket Message',
  type: 'document',
  fields: [
    defineField({
      name: 'ticket',
      title: 'Ticket',
      type: 'reference',
      to: [{ type: 'ticket' }],
      validation: r => r.required(),
    }),
    defineField({ name: 'content', title: 'Content', type: 'text', validation: r => r.required() }),
    defineField({ name: 'authorName', title: 'Author Name', type: 'string', validation: r => r.required() }),
    defineField({
      name: 'authorRole',
      title: 'Author Role',
      type: 'string',
      options: { list: ['investor', 'officer', 'system'] },
      validation: r => r.required(),
    }),
    defineField({ name: 'authorEmail', title: 'Author Email', type: 'email' }),
    defineField({ name: 'attachments', title: 'Attachments', type: 'array', of: [{ type: 'file' }] }),
    defineField({ name: 'sentAt', title: 'Sent At', type: 'datetime' }),
    defineField({ name: 'isInternal', title: 'Internal Note (officers only)', type: 'boolean', initialValue: false }),
  ],
  preview: { select: { title: 'authorName', subtitle: 'sentAt' } },
});

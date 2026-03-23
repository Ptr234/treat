import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: r => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' } }),
    defineField({ name: 'date', title: 'Date', type: 'datetime', validation: r => r.required() }),
    defineField({ name: 'endDate', title: 'End Date', type: 'datetime' }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: { list: ['UIA Forum', 'Government Mission', 'Sector Symposium', 'EAC Summit', 'Global Event', 'Webinar'] },
      validation: r => r.required(),
    }),
    defineField({ name: 'description', title: 'Description', type: 'text' }),
    defineField({ name: 'location', title: 'Location', type: 'string' }),
    defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'registrationUrl', title: 'Registration URL', type: 'url' }),
    defineField({ name: 'isPublished', title: 'Published', type: 'boolean', initialValue: false }),
    defineField({
      name: 'resources',
      title: 'Post-Event Resources',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'title', type: 'string', title: 'Title' },
          { name: 'file', type: 'file', title: 'File' },
          { name: 'url', type: 'url', title: 'URL' },
        ],
      }],
    }),
  ],
  preview: { select: { title: 'title', subtitle: 'date' } },
});

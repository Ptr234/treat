import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'homepageSector',
  title: 'Homepage Sector Card',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'blurb',
      title: 'Short Description',
      type: 'text',
      rows: 2,
      validation: (r) => r.max(160),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'link',
      title: 'Links To',
      type: 'string',
      initialValue: '/investments',
      description: 'Internal path the card links to (e.g. /investments).',
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      initialValue: 0,
      description: 'Lower numbers appear first.',
    }),
    defineField({ name: 'isPublished', title: 'Published', type: 'boolean', initialValue: true }),
  ],
  orderings: [
    { title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: { select: { title: 'title', subtitle: 'blurb', media: 'image' } },
});

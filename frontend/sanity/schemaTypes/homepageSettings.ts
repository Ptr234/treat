import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'homepageSettings',
  title: 'Homepage Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Label',
      type: 'string',
      initialValue: 'Homepage Settings',
      readOnly: true,
      description: 'Internal label — there is a single Homepage Settings document.',
    }),
    defineField({
      name: 'heroImages',
      title: 'Hero Slideshow Images',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      description: 'Full-bleed images that slide behind the main headline (5 recommended).',
      validation: (r) => r.max(8),
    }),
    defineField({
      name: 'aboutImage',
      title: 'About Image',
      type: 'image',
      options: { hotspot: true },
      description: 'The framed image in the “About Uganda Investment Authority” section.',
    }),
    defineField({
      name: 'ctaImage',
      title: 'Call-to-Action Background',
      type: 'image',
      options: { hotspot: true },
      description: 'Full-bleed background behind “Ready to Invest in Uganda?”.',
    }),
  ],
  preview: { select: { title: 'title', media: 'heroImages.0' } },
});

import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'agencyProfile',
  title: 'Agency Officer Profile',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Officer Name', type: 'string', validation: r => r.required() }),
    defineField({ name: 'email', title: 'Email', type: 'email', validation: r => r.required() }),
    defineField({
      name: 'agency',
      title: 'Agency',
      type: 'reference',
      to: [{ type: 'agency' }],
      validation: r => r.required(),
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      options: { list: ['Officer', 'Senior Officer', 'Manager', 'Director'] },
    }),
    defineField({ name: 'isActive', title: 'Active', type: 'boolean', initialValue: true }),
    defineField({
      name: 'sanityUserId',
      title: 'Sanity User ID',
      type: 'string',
      description: 'Links to Sanity Studio user account for auth',
    }),
  ],
  preview: { select: { title: 'name', subtitle: 'email' } },
});

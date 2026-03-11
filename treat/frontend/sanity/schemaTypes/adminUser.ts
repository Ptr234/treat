import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'adminUser',
  title: 'Admin User',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Full Name',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (r) => r.required().email(),
    }),
    defineField({
      name: 'passwordHash',
      title: 'Password Hash',
      type: 'string',
      description:
        'SHA-256 hash of the password. Leave empty for Google-only login. Generate via: echo -n "YourPassword" | sha256sum',
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      options: { list: ['admin'] },
      initialValue: 'admin',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'email' },
  },
});

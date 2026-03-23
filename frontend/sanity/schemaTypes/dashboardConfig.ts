import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'dashboardConfig',
  title: 'Dashboard Config',
  type: 'document',
  fields: [
    defineField({ name: 'key', title: 'Config Key', type: 'string', validation: r => r.required() }),
    defineField({ name: 'label', title: 'Display Label', type: 'string' }),
    defineField({ name: 'value', title: 'Value', type: 'string' }),
    defineField({ name: 'numericValue', title: 'Numeric Value', type: 'number' }),
    defineField({ name: 'alertThreshold', title: 'Alert Threshold', type: 'number' }),
    defineField({ name: 'isActive', title: 'Active', type: 'boolean', initialValue: true }),
    defineField({
      name: 'metadata',
      title: 'Metadata (JSON)',
      type: 'text',
      description: 'JSON string for complex config values',
    }),
  ],
  preview: { select: { title: 'key', subtitle: 'value' } },
});

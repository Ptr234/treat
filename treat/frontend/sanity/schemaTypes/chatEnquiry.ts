import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'chatEnquiry',
  title: 'Chat Enquiry',
  type: 'document',
  fields: [
    defineField({
      name: 'sessionId',
      title: 'Session ID',
      type: 'string',
      description: 'Groups messages into a single conversation',
      validation: r => r.required(),
    }),
    // Enquirer contact info (collected via pre-chat form)
    defineField({
      name: 'userName',
      title: 'Enquirer Name',
      type: 'string',
    }),
    defineField({
      name: 'userEmail',
      title: 'Enquirer Email',
      type: 'string',
    }),
    defineField({
      name: 'userPhone',
      title: 'Enquirer Phone',
      type: 'string',
    }),
    defineField({
      name: 'userLocation',
      title: 'Enquirer Location',
      type: 'string',
      description: 'City, country, or address provided by the user',
    }),
    defineField({
      name: 'userMessage',
      title: 'User Message',
      type: 'text',
      validation: r => r.required(),
    }),
    defineField({
      name: 'botResponse',
      title: 'Bot Response',
      type: 'text',
      validation: r => r.required(),
    }),
    defineField({
      name: 'language',
      title: 'Language',
      type: 'string',
      options: {
        list: [
          { title: 'English', value: 'en' },
          { title: 'French', value: 'fr' },
          { title: 'Arabic', value: 'ar' },
          { title: 'Chinese', value: 'zh' },
          { title: 'Swahili', value: 'sw' },
        ],
      },
      validation: r => r.required(),
    }),
    defineField({
      name: 'sentiment',
      title: 'Sentiment',
      type: 'string',
      options: {
        list: [
          { title: 'Positive', value: 'positive' },
          { title: 'Neutral', value: 'neutral' },
          { title: 'Negative', value: 'negative' },
        ],
      },
    }),
    defineField({
      name: 'tier',
      title: 'Response Tier',
      type: 'string',
      description: 'Which system generated the response',
      options: {
        list: [
          { title: 'AI (Groq/Llama)', value: 'ai' },
          { title: 'Knowledge Base', value: 'kb' },
          { title: 'Topic Suggestions', value: 'suggestions' },
        ],
      },
      validation: r => r.required(),
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      validation: r => r.required(),
    }),
  ],
  orderings: [
    {
      title: 'Newest First',
      name: 'createdAtDesc',
      by: [{ field: 'createdAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'userMessage',
      name: 'userName',
      subtitle: 'language',
      date: 'createdAt',
    },
    prepare({ title, name, subtitle, date }) {
      const truncated = title?.length > 60 ? title.slice(0, 60) + '...' : title;
      const langMap: Record<string, string> = { en: 'EN', fr: 'FR', ar: 'AR', zh: 'ZH', sw: 'SW' };
      const lang = langMap[subtitle as string] || subtitle;
      const dateStr = date ? new Date(date).toLocaleDateString() : '';
      const nameTag = name ? `${name} — ` : '';
      return {
        title: truncated || 'Untitled',
        subtitle: `${nameTag}${lang} | ${dateStr}`,
      };
    },
  },
});

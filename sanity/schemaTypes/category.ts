export const category = {
  name: 'category',
  title: 'Категорії',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Назва категорії',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'color',
      title: 'Колір мітки (HEX)',
      type: 'string',
      description: 'Наприклад: #fbbf24',
      initialValue: '#94a3b8',
    },
  ],
}
const location = {
  name: 'location',
  title: 'Локація',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Назва',
      type: 'string',
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: 'category',
      title: 'Категорія',
      type: 'reference',
      to: [{ type: 'category' }],
    },
    {
      name: 'proposedCategory',
      title: 'Запропонована категорія (від користувача)',
      type: 'string',
      description: 'Категорію запропонував користувач; перевірте її перед схваленням локації.',
      validation: (Rule: { max: (length: number) => unknown }) => Rule.max(80),
    },
    // --- НОВІ ПОЛЯ ---
    {
      name: 'image',
      title: 'Головне фото',
      type: 'image',
      options: { hotspot: true }, // Дозволяє обрізати фото в адмінці
    },
    {
      name: 'description',
      title: 'Опис простору',
      type: 'text', // Багаторядковий текст
    },
    {
      name: 'link',
      title: 'Посилання (сайт/інстаграм)',
      type: 'url',
    },
    // -----------------
    {
      name: 'address',
      title: 'Адреса',
      type: 'string',
    },
    {
      name: 'coordinates',
      title: 'Координати',
      type: 'geopoint',
    },
    {
      name: 'isApproved',
      title: 'Опубліковано на мапі',
      type: 'boolean',
      initialValue: false,
    }
  ],
  preview: {
    select: {
      title: 'title',
      proposedCategory: 'proposedCategory',
    },
    prepare({ title, proposedCategory }: { title?: string; proposedCategory?: string }) {
      return {
        title,
        subtitle: proposedCategory
          ? `Категорію запропонував користувач: ${proposedCategory}`
          : undefined,
      };
    },
  },
}

export default location
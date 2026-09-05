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
  validation: (Rule: { required: () => unknown }) => Rule.required(),
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
  initialValue: false, // Нові мітки за замовчуванням "вимкнені"
}
  ],
}

export default location
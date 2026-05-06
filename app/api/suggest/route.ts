import { createClient } from 'next-sanity';
import { NextResponse } from 'next/server';

const writeClient = createClient({
  projectId: '5tbxcnx4',
  dataset: 'production',
  apiVersion: '2024-03-03',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, address, categoryId, lat, lng, description, link } = body;

    const newLocation = {
      _type: 'location',
      title,
      address,
      description,
      link,
      // 1. Вказуємо, що локація НЕ схвалена за замовчуванням
      isApproved: false, 
      // 2. Створюємо зв'язок із категорією через Reference
      category: {
        _type: 'reference',
        _ref: categoryId, // Передаємо ID обраної категорії
      },
      // 3. Координати
      coordinates: {
        _type: 'geopoint',
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      },
    };

    const result = await writeClient.create(newLocation);

    return NextResponse.json({ message: 'Success', id: result._id }, { status: 200 });
  } catch (error) {
    console.error('Sanity error:', error);
    return NextResponse.json({ message: 'Error', details: error }, { status: 500 });
  }
}
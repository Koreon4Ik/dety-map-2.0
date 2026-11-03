import { NextResponse } from 'next/server';
import { writeClient } from '@/sanity/lib/write-client';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function POST(req: Request) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Некоректний формат запиту.' }, { status: 400 });
  }

  if (!isRecord(body)) {
    return NextResponse.json({ message: 'Некоректні дані пропозиції.' }, { status: 400 });
  }

  const { title, address, categoryId, lat, lng, description, link, proposedCategory } = body;
  const normalizedTitle = typeof title === 'string' ? title.trim() : '';
  const normalizedAddress = typeof address === 'string' ? address.trim() : '';
  const normalizedDescription = typeof description === 'string' ? description.trim() : '';
  const normalizedCategoryId = typeof categoryId === 'string' ? categoryId.trim() : '';
  const normalizedProposedCategory = typeof proposedCategory === 'string' ? proposedCategory.trim() : '';
  const latitude = typeof lat === 'number' ? lat : typeof lat === 'string' && lat.trim() ? Number(lat) : NaN;
  const longitude = typeof lng === 'number' ? lng : typeof lng === 'string' && lng.trim() ? Number(lng) : NaN;
  const validationErrors: string[] = [];

  if (!normalizedTitle) validationErrors.push('вкажіть назву локації');
  if (!normalizedAddress) validationErrors.push('вкажіть адресу');
  if (!normalizedDescription) validationErrors.push('додайте опис');
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    validationErrors.push('перевірте широту: число має бути від -90 до 90');
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    validationErrors.push('перевірте довготу: число має бути від -180 до 180');
  }
  if (link !== undefined && typeof link !== 'string') validationErrors.push('перевірте посилання');
  if (categoryId !== undefined && typeof categoryId !== 'string') validationErrors.push('оберіть коректну категорію');
  if (proposedCategory !== undefined && typeof proposedCategory !== 'string') {
    validationErrors.push('введіть коректну назву власної категорії');
  }
  if (normalizedProposedCategory.length > 80) validationErrors.push('назва власної категорії має бути не довша за 80 символів');
  if (Boolean(normalizedCategoryId) === Boolean(normalizedProposedCategory)) {
    validationErrors.push('оберіть одну категорію зі списку або введіть власну');
  }

  if (validationErrors.length > 0) {
    return NextResponse.json(
      { message: `Перевірте дані: ${validationErrors.join('; ')}.` },
      { status: 400 }
    );
  }

  try {
    if (normalizedCategoryId) {
      const categoryExists = await writeClient.fetch<string | null>(
        '*[_type == "category" && _id == $categoryId][0]._id',
        { categoryId: normalizedCategoryId }
      );

      if (!categoryExists) {
        return NextResponse.json({ message: 'Обрана категорія не знайдена.' }, { status: 400 });
      }
    }

    const newLocation = {
      _type: 'location',
      title: normalizedTitle,
      address: normalizedAddress,
      description: normalizedDescription,
      ...(typeof link === 'string' && link.trim() ? { link: link.trim() } : {}),
      isApproved: false,
      category: normalizedCategoryId
        ? { _type: 'reference', _ref: normalizedCategoryId }
        : undefined,
      proposedCategory: normalizedCategoryId ? undefined : normalizedProposedCategory,
      coordinates: {
        _type: 'geopoint',
        lat: latitude,
        lng: longitude,
      },
    };

    const result = await writeClient.create(newLocation);

    return NextResponse.json({ message: 'Success', id: result._id }, { status: 200 });
  } catch (error) {
    console.error('Sanity error:', error);
    return NextResponse.json({ message: 'Не вдалося зберегти пропозицію.' }, { status: 500 });
  }
}
import { createClient } from 'next-sanity';
import Link from 'next/link';

const client = createClient({
  projectId: '5tbxcnx4',
  dataset: 'production',
  apiVersion: '2024-03-03',
  useCdn: false,
});

export const dynamic = 'force-dynamic';

export default async function LocationPage(props: { params: Promise<{ slug: string }> }) {
  // 1. Отримуємо slug через Promise (вимога Next.js 15)
  const resolvedParams = await props.params;
  const slug = resolvedParams.slug;

  // 2. Дебаг-запит: перевіряємо чи взагалі є зв'язок з Sanity
  const location = await client.fetch(
    `*[_type == "location" && slug.current == $slug][0]{
      title,
      address,
      description,
      "categoryName": category->title
    }`, 
    { slug }
  );

  if (!location) {
    return (
      <div className="h-screen bg-black text-white flex flex-col items-center justify-center p-10 uppercase font-black italic">
        <h1 className="text-2xl text-center">
          Код отримав параметр: <span className="text-yellow-400">"{slug}"</span> <br/>
          Але в Sanity нічого не знайдено.
        </h1>
        <Link href="/" className="mt-10 underline text-xs">Назад до мапи</Link>
      </div>
    );
  }

  return (
    <div className="p-20 bg-black min-h-screen text-white">
      <h1 className="text-6xl font-black uppercase italic italic">{location.title}</h1>
      <p className="text-yellow-400 mt-4 uppercase tracking-widest">{location.categoryName}</p>
      <div className="mt-10 text-xl max-w-2xl">{location.description}</div>
    </div>
  );
}
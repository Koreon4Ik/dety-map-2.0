import { createClient } from 'next-sanity';
import { MapPin, Globe, ArrowLeft, AlignLeft } from 'lucide-react';
import Link from 'next/link';

const client = createClient({
  projectId: '5tbxcnx4',
  dataset: 'production',
  apiVersion: '2024-03-03',
  useCdn: false,
});

export default async function LocationPage({ params }: { params: { id: string } }) {
  // Запит GROQ, який витягує назву категорії через оператор ->
  const query = `*[_type == "location" && (_id == $id || slug.current == $id)][0]{
    title,
    address,
    description,
    link,
    "categoryName": category->title,
    "categoryColor": category->color
  }`;

  const location = await client.fetch(query, { id: params.id });

  if (!location) {
    return (
      <div className="h-screen bg-slate-950 text-white flex items-center justify-center font-black uppercase italic">
        Локацію не знайдено
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12 lg:p-24 flex justify-center">
      <div className="max-w-4xl w-full space-y-10">
        
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-yellow-400 transition-colors font-black uppercase text-xs tracking-widest group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Назад до мапи
        </Link>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div 
              className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-black"
              style={{ backgroundColor: location.categoryColor || '#fbbf24' }}
            >
              {location.categoryName || 'Без категорії'}
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">
            {location.title}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-10 border-t border-white/5">
          <div className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                <MapPin size={12} className="text-yellow-400" /> Адреса
              </label>
              <p className="text-xl font-bold">{location.address}</p>
            </div>

            {location.link && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                  <Globe size={12} className="text-yellow-400" /> Веб-сайт / Соцмережі
                </label>
                <a href={location.link} target="_blank" rel="noreferrer" className="text-xl font-bold text-yellow-400 hover:underline break-all">
                  {location.link.replace('https://', '')}
                </a>
              </div>
            )}
          </div>

          <div className="space-y-4 bg-white/5 p-8 rounded-[40px] border border-white/5 backdrop-blur-xl">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
              <AlignLeft size={12} className="text-yellow-400" /> Про простір
            </label>
            <p className="text-slate-300 leading-relaxed font-medium">
              {location.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
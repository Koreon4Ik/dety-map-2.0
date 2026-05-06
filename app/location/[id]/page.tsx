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
  // Отримуємо ID
  const id = params.id;

  // Вставляємо id прямо в запит через інтерполяцію рядка ` ${id} `
  // Це гарантує, що Sanity отримає значення без помилок про параметри
  const query = `*[_type == "location" && (_id == "${id}" || slug.current == "${id}")][0]{
    title,
    address,
    description,
    link,
    "categoryName": category->title,
    "categoryColor": category->color
  }`;

  const location = await client.fetch(query);

  if (!location) {
    return (
      <div className="h-screen bg-slate-950 text-white flex flex-col items-center justify-center space-y-4 font-black italic uppercase tracking-tighter">
        <h1 className="text-2xl">Локацію не знайдено</h1>
        <Link href="/" className="text-yellow-400 text-xs border-b border-yellow-400/30 pb-1">Повернутися до мапи</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12 lg:p-24 flex justify-center selection:bg-yellow-400 selection:text-black">
      <div className="max-w-4xl w-full space-y-10">
        
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-yellow-400 transition-all font-black uppercase text-[10px] tracking-[0.2em] group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
          Назад до мапи
        </Link>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div 
              className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-black"
              style={{ backgroundColor: location.categoryColor || '#fbbf24' }}
            >
              {location.categoryName || 'Простір'}
            </div>
          </div>

          <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.85]">
            {location.title}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-10 border-t border-white/10">
          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
                <MapPin size={14} className="text-yellow-400" /> Адреса
              </label>
              <p className="text-2xl font-bold leading-tight">{location.address}</p>
            </div>

            {location.link && (
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
                  <Globe size={14} className="text-yellow-400" /> Веб-сайт
                </label>
                <a 
                  href={location.link} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-xl font-bold text-yellow-400 hover:text-white transition-colors break-all"
                >
                  {location.link.replace('https://', '')}
                </a>
              </div>
            )}
          </div>

          <div className="space-y-4 bg-white/[0.03] p-8 md:p-10 rounded-[40px] border border-white/5 backdrop-blur-3xl shadow-2xl">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
              <AlignLeft size={14} className="text-yellow-400" /> Опис
            </label>
            <p className="text-slate-300 text-lg leading-relaxed font-medium italic">
              {location.description || 'Опис незабаром...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
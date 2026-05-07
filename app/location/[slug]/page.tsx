import { createClient } from 'next-sanity';
import { MapPin, Globe, ArrowLeft, AlignLeft } from 'lucide-react';
import Link from 'next/link';

const client = createClient({
  projectId: '5tbxcnx4',
  dataset: 'production',
  apiVersion: '2024-03-03',
  useCdn: false,
});

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LocationPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;

  const query = `*[_type == "location" && slug.current == $slug][0]{
    title,
    address,
    description,
    link,
    "imageUrl": image.asset->url,
    "categoryName": category->title,
    "categoryColor": category->color
  }`;

  const location = await client.fetch(query, { slug });

  if (!location) {
    return (
      <div className="h-screen bg-slate-950 text-white flex flex-col items-center justify-center space-y-6 font-black italic uppercase tracking-tighter">
        <h1 className="text-3xl text-center px-4">Локацію "{slug}" <br/>не знайдено</h1>
        <Link href="/" className="px-6 py-2 bg-yellow-400 text-black not-italic text-xs rounded-full hover:bg-white transition-colors">
          Повернутися до мапи
        </Link>
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
          <div 
            className="inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-black"
            style={{ backgroundColor: location.categoryColor || '#fbbf24' }}
          >
            {location.categoryName || 'Локація'}
          </div>

          <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.85] break-words">
            {location.title}
          </h1>
        </div>

        {location.imageUrl && (
          <div className="w-full aspect-video rounded-[40px] overflow-hidden border border-white/10 shadow-2xl">
            <img 
              src={location.imageUrl} 
              alt={location.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-10 border-t border-white/10">
          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
                <MapPin size={14} className="text-yellow-400" /> Адреса
              </label>
              <p className="text-2xl font-bold leading-tight">{location.address || 'Адресу не вказано'}</p>
            </div>

            {location.link && (
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
                  <Globe size={14} className="text-yellow-400" /> Веб-сайт / Instagram
                </label>
                <a 
                  href={location.link} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-xl font-bold text-yellow-400 hover:text-white transition-colors break-all underline decoration-yellow-400/30 underline-offset-8"
                >
                  Відвідати сторінку
                </a>
              </div>
            )}
          </div>

          <div className="space-y-4 bg-white/[0.03] p-8 md:p-10 rounded-[40px] border border-white/5 backdrop-blur-3xl shadow-2xl">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
              <AlignLeft size={14} className="text-yellow-400" /> Про простір
            </label>
            <p className="text-slate-300 text-lg leading-relaxed font-medium italic whitespace-pre-line">
              {location.description || 'Опис цього простору з’явиться згодом...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from 'next-sanity';
import { ChevronLeft, MapPin, ExternalLink, Info, Tag, Navigation } from 'lucide-react';

// Налаштування клієнта Sanity
const client = createClient({
  projectId: '5tbxcnx4',
  dataset: 'production',
  apiVersion: '2024-03-03',
  useCdn: false,
});

export default function LocationDetails() {
  const { id } = useParams();
  const [location, setLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchLocation = async () => {
      try {
        // Додали запит на imageUrl, description та link (якщо вони є в Sanity)
        const query = `*[_type == "location" && (_id == $id || slug.current == $id)][0]{
          ...,
          "imageUrl": image.asset->url
        }`;
        const data = await client.fetch(query, { id });
        setLocation(data);
      } catch (error) {
        console.error("Помилка завантаження локації:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen w-full bg-slate-950 flex items-center justify-center text-yellow-400 font-black italic uppercase tracking-tighter">
        Завантаження деталей...
      </div>
    );
  }

  if (!location) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center text-white font-black uppercase italic tracking-tighter">
        Локацію не знайдено
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-20 selection:bg-yellow-400 selection:text-black">
      
      {/* HEADER IMAGE / BANNER */}
      <div className="relative h-[45vh] w-full overflow-hidden">
        {location.imageUrl ? (
          <img 
            src={location.imageUrl} 
            alt={location.title} 
            className="w-full h-full object-cover animate-fade-in"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-slate-700">
             <MapPin size={100} strokeWidth={1} />
          </div>
        )}
        
        {/* Градієнт на фото */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

        {/* Кнопка назад */}
        <Link href="/" className="absolute top-6 md:top-8 left-6 md:left-8 z-10 bg-black/30 backdrop-blur-md border border-white/10 p-4 rounded-2xl hover:bg-yellow-400 hover:text-black transition-all group shadow-xl">
          <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* CONTENT CARD */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 -mt-24 md:-mt-32 relative z-10">
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[32px] md:rounded-[48px] p-6 md:p-12 shadow-2xl">
          
          {/* Badge Категорії */}
          <div className="inline-flex items-center gap-2 bg-yellow-400 text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 shadow-lg shadow-yellow-400/20">
            <Tag size={12} /> {location.category || 'ІНШЕ'}
          </div>

          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-4 leading-none">
            {location.title}
          </h1>

          <div className="flex items-start md:items-center gap-3 text-slate-400 mb-10 text-sm md:text-base">
            <div className="bg-white/5 p-2 rounded-xl shrink-0"><MapPin size={20} className="text-yellow-400" /></div>
            <span className="pt-1 md:pt-0 leading-snug">{location.address || 'Адресу не вказано'}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Опис */}
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-center gap-2 text-white font-black uppercase italic tracking-wider text-sm border-b border-white/10 pb-2">
                <Info size={18} className="text-yellow-400" /> Про простір
              </div>
              <p className="text-slate-300 text-base md:text-lg leading-relaxed font-medium whitespace-pre-wrap">
                {location.description || 'Опис для цієї локації ще не додано, але ми впевнені, що там круто!'}
              </p>
            </div>

            {/* Дії / Посилання */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white font-black uppercase italic tracking-wider text-sm border-b border-white/10 pb-2">
                Дії
              </div>
              
              {/* Показуємо кнопку, тільки якщо є лінк */}
              {location.link && (
                <a 
                  href={location.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 bg-white text-black w-full py-5 rounded-3xl font-black uppercase italic hover:bg-yellow-400 transition-all shadow-xl active:scale-95 text-sm"
                >
                  Відвідати сайт <ExternalLink size={18} />
                </a>
              )}

              {/* Маршрут показуємо завжди, якщо є координати */}
              {location.coordinates && (
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${location.coordinates.lat},${location.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 bg-slate-800 text-white w-full py-5 rounded-3xl font-black uppercase italic hover:bg-slate-700 transition-all border border-white/5 text-sm shadow-lg active:scale-95"
                >
                  <Navigation size={18} className="mb-[2px]" />
                  Маршрут
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; filter: blur(10px); }
          to { opacity: 1; filter: blur(0); }
        }
        .animate-fade-in { animation: fade-in 1s ease-out forwards; }
      `}</style>
    </div>
  );
}
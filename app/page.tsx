"use client";

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { defineQuery } from 'next-sanity';
import { client } from '@/sanity/lib/client';
import { 
  Plus, Search, X, Navigation, Users, Link as LinkIcon, Sun, Moon, ChevronDown, Filter, Send 
} from 'lucide-react';

// Динамічний імпорт мапи (щоб уникнути помилок SSR з Leaflet)
const MapCustom = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => <div className="h-screen w-full bg-slate-950 flex items-center justify-center text-yellow-400 font-black italic uppercase tracking-tighter">Завантаження мапи...</div>
});

type Category = { title: string };

type Location = {
  _id: string;
  title: string;
  slug?: string;
  category?: string;
  categoryColor?: string;
  address?: string;
  coordinates?: { lat?: number; lng?: number };
};

const CATEGORIES_QUERY = defineQuery(`*[_type == "category"] | order(title asc){title}`);
const LOCATIONS_QUERY = defineQuery(`*[_type == "location" && isApproved == true]{
  _id,
  title,
  "slug": slug.current,
  "category": category->title,
  "categoryColor": category->color,
  address,
  coordinates
}`);

export default function Home() {
  const UKRAINE_CENTER: [number, number] = [48.3794, 31.1656];
  
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<string[]>(['УСІ']);
  const [filter, setFilter] = useState('УСІ');
  const [search, setSearch] = useState('');
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [mapConfig, setMapConfig] = useState({ center: UKRAINE_CENTER, zoom: 6 });
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.localStorage.getItem('dety-theme') !== 'light';
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Завантаження даних із Sanity
  useEffect(() => {
    const fetchData = async () => {
      try {
        const catData = await client.fetch<Category[]>(CATEGORIES_QUERY);
        const catList = ['УСІ', ...catData.map((category) => category.title)];
        setCategories(catList);

        const locData = await client.fetch<Location[]>(LOCATIONS_QUERY);
        setLocations(locData);
      } catch (err) {
        console.error("Помилка завантаження:", err);
        setLoadError(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsFilterOpen(false);
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFilterOpen(false);
        setIsAboutOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem('dety-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const findMe = () => {
    if (!navigator.geolocation) return alert("Геолокація не підтримується");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const location: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(location);
        setMapConfig({ center: location, zoom: 15 });
      },
      () => alert("Доступ до геолокації обмежено")
    );
  };

  const filteredLocations = locations.filter(item => {
    const matchesFilter = filter === 'УСІ' || item.category === filter;
    const normalizedSearch = search.trim().toLowerCase();
    const matchesSearch = [item.title, item.address, item.category]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(normalizedSearch));
    return matchesFilter && matchesSearch;
  });

  const theme = {
    bg: isDark ? 'bg-slate-950' : 'bg-[#f3f5f2]',
    panel: isDark ? 'bg-slate-900/90 border-white/10' : 'bg-white/90 border-slate-200/80',
    text: isDark ? 'text-white' : 'text-slate-900',
    subtext: isDark ? 'text-slate-400' : 'text-slate-500',
    input: isDark ? 'bg-white/5 border-white/5' : 'bg-slate-100/80 border-slate-200/80',
    dropdown: isDark ? 'bg-slate-800 border-white/10' : 'bg-white border-slate-200/80',
    card: isDark ? 'bg-white/5 border-white/5' : 'bg-white/70 border-slate-200/80'
  };

  return (
    <div className={`h-screen w-full ${theme.bg} ${theme.text} relative overflow-hidden transition-colors duration-500`}>
      
      {/* HEADER BLOCK */}
      <div className="absolute top-3 md:top-6 left-1/2 -translate-x-1/2 z-[1000] w-[calc(100%-1.5rem)] max-w-[1400px] flex flex-col md:flex-row gap-2 md:gap-3 dety-fade-up">
        
        <div className={`${theme.panel} backdrop-blur-2xl border p-2.5 pr-6 rounded-[30px] ${isDark ? 'shadow-2xl' : 'shadow-[0_14px_40px_rgba(44,62,50,0.12)] ring-1 ring-white/70'} flex items-center gap-4 shrink-0`}>
          <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl overflow-hidden p-2 flex items-center justify-center ${isDark ? 'bg-white shadow-lg shadow-yellow-400/10' : 'bg-[#fbfaf4] ring-1 ring-amber-200/80 shadow-[0_5px_16px_rgba(190,150,50,0.16)]'}`}>
            <Image src="/logo.PNG" alt="Логотип DeTy?" width={56} height={56} className="w-full h-full object-contain" priority />
          </div>
          <div>
            <h1 className="text-xl font-black italic tracking-tighter leading-none">
              DeTy<span className="text-yellow-500">?</span>
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <button onClick={() => setIsAboutOpen(true)} className="text-yellow-500 text-[10px] font-black uppercase tracking-widest hover:opacity-70 transition-opacity">Про проєкт</button>
              <button onClick={() => setIsDark(!isDark)} className="p-1 rounded-full opacity-50 hover:opacity-100 transition-all">
                {isDark ? <Sun size={14} /> : <Moon size={14} />}
              </button>
            </div>
          </div>
        </div>

        <div className={`${theme.panel} backdrop-blur-2xl border p-2 rounded-[30px] flex flex-grow items-center gap-2 min-w-0 ${isDark ? 'shadow-2xl' : 'shadow-[0_14px_40px_rgba(44,62,50,0.12)]'}`}>
          <div className={`flex items-center gap-3 ${theme.input} border rounded-2xl px-4 py-2.5 flex-grow focus-within:border-yellow-400/50 transition-all`}>
            <Search size={18} className="text-slate-500" />
            <input
              aria-label="Пошук локації"
              type="text" 
              placeholder="Пошук локації..." 
              className="bg-transparent outline-none w-full text-sm font-bold placeholder:text-slate-500"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              aria-expanded={isFilterOpen}
              aria-haspopup="listbox"
              aria-label="Фільтр категорій"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all ${
                filter !== 'УСІ' ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' : `${isDark ? 'bg-white/5 text-slate-300' : 'bg-slate-100 text-slate-700 border border-slate-200'}`
              }`}
            >
              <Filter size={14} className={filter !== 'УСІ' ? 'text-black' : 'text-yellow-500'} />
              <span>{filter}</span>
              <ChevronDown size={14} className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {isFilterOpen && (
              <div role="listbox" className={`absolute top-full right-0 mt-2 w-56 max-w-[calc(100vw-2rem)] p-2 rounded-3xl border ${theme.dropdown} shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 z-[1100]`}>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setFilter(cat); setIsFilterOpen(false); }}
                    role="option"
                    aria-selected={filter === cat}
                    className={`w-full text-left px-4 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${
                      filter === cat ? 'bg-yellow-400 text-black' : isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ABOUT MODAL */}
      {isAboutOpen && (
        <div
          role="presentation"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setIsAboutOpen(false); }}
          className={`fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-6 ${isDark ? 'bg-slate-950/60' : 'bg-slate-900/25'} backdrop-blur-xl dety-fade-in`}
        >
          <div role="dialog" aria-modal="true" aria-labelledby="about-title" className={`${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'} border rounded-[36px] md:rounded-[60px] p-6 md:p-14 max-w-4xl w-full relative shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar`}>
            
            <button aria-label="Закрити інформацію про проєкт" onClick={() => setIsAboutOpen(false)} className={`absolute top-5 right-5 md:top-8 md:right-8 p-3 rounded-full hover:bg-yellow-400 hover:text-black transition-all group ${isDark ? 'bg-white/5' : 'bg-slate-100 text-slate-600'}`}>
              <X size={24} className="group-hover:rotate-90 transition-transform" />
            </button>

            <div className="flex flex-col items-center text-center space-y-10">
              {/* LOGO BLOCK */}
              <div className="relative group">
                <div className="w-28 h-28 md:w-36 md:h-36 bg-white rounded-[30px] md:rounded-[40px] p-4 shadow-2xl shadow-yellow-400/10 rotate-3 transition-transform group-hover:rotate-0 duration-500 flex items-center justify-center">
                  <Image src="/logo.PNG" alt="Логотип DeTy?" width={144} height={144} className="w-full h-full object-contain" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">DeTy?</div>
              </div>

              <div className="space-y-4 max-w-2xl">
                <h2 id="about-title" className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
                  Мапа твоїх <span className="text-yellow-400">можливостей</span>
                </h2>
                <p className={`${theme.subtext} text-base md:text-lg font-medium leading-relaxed`}>
                  Ми створили <span className="text-yellow-400 font-bold">DeTy?</span> для того, щоб кожен молодий українець міг знайти свій простір. Коворкінги, хаби та активності — усе тут.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {/* Instagram Block */}
                <a 
                  href="https://www.instagram.com/child.youth.council/" 
                  target="_blank" 
                  rel="noreferrer" 
                    className={`p-6 rounded-[32px] text-left flex items-center justify-between group transition-transform hover:scale-[1.02] ${isDark ? 'bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-pink-500/20' : 'bg-gradient-to-br from-rose-50 to-pink-100 border-pink-200'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-tr from-yellow-400 to-pink-600 rounded-2xl text-white shadow-lg shadow-pink-500/20">
                      <LinkIcon size={24} />
                    </div>
                    <div>
                      <h4 className={`font-black uppercase text-xs mb-1 italic text-stroke-none ${isDark ? 'text-white' : 'text-slate-900'}`}>Instagram</h4>
                      <p className={`text-xs ${isDark ? 'text-white/70' : 'text-slate-600'}`}>@child.youth.council</p>
                    </div>
                  </div>
                  <Plus className={`group-hover:rotate-90 transition-transform opacity-50 ${isDark ? 'text-white' : 'text-slate-700'}`} />
                </a>

                {/* Telegram Bot Block */}
                <a 
                  href="https://t.me/koreonovi4" 
                  target="_blank" 
                  rel="noreferrer" 
                    className={`p-6 rounded-[32px] text-left flex items-center justify-between group transition-transform hover:scale-[1.02] ${isDark ? 'bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border-blue-500/20' : 'bg-gradient-to-br from-sky-50 to-cyan-100 border-sky-200'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-tr from-blue-400 to-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/20">
                      <Send size={24} />
                    </div>
                    <div>
                      <h4 className={`font-black uppercase text-xs mb-1 italic text-stroke-none ${isDark ? 'text-white' : 'text-slate-900'}`}>Адміністратор мапи</h4>
                      <p className={`text-xs ${isDark ? 'text-white/70' : 'text-slate-600'}`}>@koreonovi4</p>
                    </div>
                  </div>
                  <Plus className={`group-hover:rotate-90 transition-transform opacity-50 ${isDark ? 'text-white' : 'text-slate-700'}`} />
                </a>

                {/* Who We Are - Full Width on Mobile */}
                <div className={`md:col-span-2 p-6 rounded-[32px] ${theme.card} border text-left flex items-start gap-4`}>
                  <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400 shrink-0"><Users size={24} /></div>
                  <div>
                    <h4 className="font-black uppercase text-xs mb-1">Хто ми?</h4>
                    <p className={`text-xs leading-relaxed italic font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Ініціатива відділу «Якісне дозвілля» Національної дитячої та молодіжної ради України за підтримки Terre des Hommes та радниці-уповноваженої з питань дітей та дитячої реабілітації Дар&apos;ї Герасимчук.</p>
                  </div>
                </div>
              </div>

              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 italic">Де ти сьогодні? — Відповідь тут.</p>
            </div>
          </div>
        </div>
      )}

      {/* MAP SECTION */}
      <div className="h-full w-full relative z-[1]">
        {isLoading && <div className="absolute top-1/2 left-1/2 z-[500] -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-950/80 px-5 py-3 text-xs font-black uppercase tracking-widest text-yellow-400 backdrop-blur-md">Завантаження локацій...</div>}
        {loadError && <div className="absolute top-1/2 left-1/2 z-[500] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-red-950/90 px-5 py-3 text-center text-xs font-bold text-red-100 shadow-xl">Не вдалося завантажити локації</div>}
        {!isLoading && !loadError && filteredLocations.length === 0 && <div className="absolute top-1/2 left-1/2 z-[500] -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-950/80 px-5 py-3 text-xs font-black uppercase tracking-widest text-white backdrop-blur-md">Локацій не знайдено</div>}
        <MapCustom 
          locations={filteredLocations} 
          center={mapConfig.center} 
          zoom={mapConfig.zoom} 
          isDark={isDark} 
          userLocation={userLocation}
        />
      </div>

      {/* BOTTOM CONTROLS */}
      <div className="absolute bottom-5 right-4 md:bottom-8 md:right-8 z-[1000] flex flex-col items-end gap-3 md:gap-4 dety-fade-up" style={{ animationDelay: '180ms' }}>
        <button aria-label="Показати моє місцезнаходження" onClick={findMe} className="bg-white text-black w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all hover:bg-yellow-400 group" title="Де я?">
          <Navigation size={22} fill="currentColor" className="group-hover:rotate-12 transition-transform" />
        </button>
        <Link href="/add" aria-label="Додати нову мітку на мапу" className="bg-yellow-400 text-black px-4 py-4 md:px-8 md:py-5 rounded-[26px] md:rounded-[32px] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-yellow-400/40 flex items-center gap-3 md:gap-4 group">
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-black uppercase tracking-widest text-black/60 leading-none mb-1 text-stroke-none">Додати нову</span>
            <span className="text-sm font-black uppercase italic leading-none">Мітку на мапу</span>
          </div>
          <div className="bg-black text-yellow-400 p-2 rounded-xl group-hover:rotate-90 transition-transform duration-300">
            <Plus size={20} strokeWidth={3} />
          </div>
        </Link>
      </div>
    </div>
  );
}
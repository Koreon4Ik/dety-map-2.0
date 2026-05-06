"use client";

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from 'next-sanity';
import { 
  Plus, Search, X, Navigation, Users, Link as LinkIcon, Sun, Moon, ChevronDown, Filter, Send 
} from 'lucide-react';

// Динамічний імпорт мапи (щоб уникнути помилок SSR з Leaflet)
const MapCustom = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => <div className="h-screen w-full bg-slate-950 flex items-center justify-center text-yellow-400 font-black italic uppercase tracking-tighter">Завантаження мапи...</div>
});

// Налаштування клієнта Sanity
const client = createClient({
  projectId: '5tbxcnx4',
  dataset: 'production',
  apiVersion: '2024-03-03',
  useCdn: false,
});

export default function Home() {
  const router = useRouter();
  const UKRAINE_CENTER: [number, number] = [48.3794, 31.1656];
  
  const [locations, setLocations] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(['УСІ']);
  const [filter, setFilter] = useState('УСІ');
  const [search, setSearch] = useState('');
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [mapConfig, setMapConfig] = useState({ center: UKRAINE_CENTER, zoom: 6 });
  const [isDark, setIsDark] = useState(true);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Завантаження даних із Sanity
  useEffect(() => {
    const fetchData = async () => {
      try {
        const catQuery = `*[_type == "category"]{title}`;
        const catData = await client.fetch(catQuery);
        const catList = ['УСІ', ...catData.map((c: any) => c.title)];
        setCategories(catList);

        const locQuery = `*[_type == "location" && isApproved == true]{
          _id,
          title,
          "slug": slug.current,
          "category": category->title, 
          "categoryColor": category->color,
          address,
          coordinates
        }`;
        const locData = await client.fetch(locQuery);
        setLocations(locData);
      } catch (err) {
        console.error("Помилка завантаження:", err);
      }
    };
    
    fetchData();

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsFilterOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const findMe = () => {
    if (!navigator.geolocation) return alert("Геолокація не підтримується");
    navigator.geolocation.getCurrentPosition(
      (pos) => setMapConfig({ center: [pos.coords.latitude, pos.coords.longitude], zoom: 15 }),
      () => alert("Доступ обмежено")
    );
  };

  const filteredLocations = locations.filter(item => {
    const matchesFilter = filter === 'УСІ' || item.category === filter;
    const matchesSearch = item.title?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const theme = {
    bg: isDark ? 'bg-slate-950' : 'bg-slate-50',
    panel: isDark ? 'bg-slate-900/90 border-white/10' : 'bg-white/95 border-slate-200',
    text: isDark ? 'text-white' : 'text-slate-900',
    subtext: isDark ? 'text-slate-400' : 'text-slate-500',
    input: isDark ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-200',
    dropdown: isDark ? 'bg-slate-800 border-white/10' : 'bg-white border-slate-200',
    card: isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'
  };

  return (
    <div className={`h-screen w-full ${theme.bg} ${theme.text} relative overflow-hidden transition-colors duration-500`}>
      
      {/* HEADER BLOCK */}
      <div className="absolute top-4 md:top-6 left-1/2 -translate-x-1/2 z-[1000] w-[95%] max-w-[1400px] flex flex-col md:flex-row gap-3">
        
        <div className={`${theme.panel} backdrop-blur-2xl border p-2.5 pr-6 rounded-[30px] shadow-2xl flex items-center gap-4 shrink-0`}>
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl overflow-hidden bg-white p-2 shadow-lg shadow-yellow-400/10 flex items-center justify-center">
            <img src="/logo.PNG" alt="Logo" className="w-full h-full object-contain" />
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

        <div className={`${theme.panel} backdrop-blur-2xl border p-2 rounded-[30px] flex flex-grow items-center gap-2 shadow-2xl`}>
          <div className={`flex items-center gap-3 ${theme.input} border rounded-2xl px-4 py-2.5 flex-grow focus-within:border-yellow-400/50 transition-all`}>
            <Search size={18} className="text-slate-500" />
            <input 
              type="text" 
              placeholder="Пошук локації..." 
              className="bg-transparent outline-none w-full text-sm font-bold placeholder:text-slate-500"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all ${
                filter !== 'УСІ' ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' : `${isDark ? 'bg-white/5 text-slate-300' : 'bg-slate-200 text-slate-700'}`
              }`}
            >
              <Filter size={14} className={filter !== 'УСІ' ? 'text-black' : 'text-yellow-500'} />
              <span>{filter}</span>
              <ChevronDown size={14} className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {isFilterOpen && (
              <div className={`absolute top-full right-0 mt-2 w-56 p-2 rounded-3xl border ${theme.dropdown} shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 z-[1100]`}>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setFilter(cat); setIsFilterOpen(false); }}
                    className={`w-full text-left px-4 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${
                      filter === cat ? 'bg-yellow-400 text-black' : `hover:${isDark ? 'bg-white/5' : 'bg-slate-100'}`
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
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-6 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className={`${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'} border rounded-[48px] md:rounded-[60px] p-8 md:p-14 max-w-4xl w-full relative shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar`}>
            
            <button onClick={() => setIsAboutOpen(false)} className="absolute top-8 right-8 p-3 bg-white/5 rounded-full hover:bg-yellow-400 hover:text-black transition-all group">
              <X size={24} className="group-hover:rotate-90 transition-transform" />
            </button>

            <div className="flex flex-col items-center text-center space-y-10">
              {/* LOGO BLOCK */}
              <div className="relative group">
                <div className="w-28 h-28 md:w-36 md:h-36 bg-white rounded-[30px] md:rounded-[40px] p-4 shadow-2xl shadow-yellow-400/10 rotate-3 transition-transform group-hover:rotate-0 duration-500 flex items-center justify-center">
                  <img src="/logo.PNG" alt="Логотип Нацради" className="w-full h-full object-contain" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">DeTy?</div>
              </div>

              <div className="space-y-4 max-w-2xl">
                <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
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
                  className="p-6 rounded-[32px] bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-pink-500/20 text-left flex items-center justify-between group transition-transform hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-tr from-yellow-400 to-pink-600 rounded-2xl text-white shadow-lg shadow-pink-500/20">
                      <LinkIcon size={24} />
                    </div>
                    <div>
                      <h4 className="font-black uppercase text-xs mb-1 italic text-white text-stroke-none">Instagram</h4>
                      <p className="text-xs opacity-60 text-white/70">@child.youth.council</p>
                    </div>
                  </div>
                  <Plus className="group-hover:rotate-90 transition-transform opacity-50 text-white" />
                </a>

                {/* Telegram Bot Block */}
                <a 
                  href="https://t.me/UYouth_bot" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="p-6 rounded-[32px] bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/20 text-left flex items-center justify-between group transition-transform hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-tr from-blue-400 to-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/20">
                      <Send size={24} />
                    </div>
                    <div>
                      <h4 className="font-black uppercase text-xs mb-1 italic text-white text-stroke-none">Telegram Бот</h4>
                      <p className="text-xs opacity-60 text-white/70">@UYouth_bot</p>
                    </div>
                  </div>
                  <Plus className="group-hover:rotate-90 transition-transform opacity-50 text-white" />
                </a>

                {/* Who We Are - Full Width on Mobile */}
                <div className={`md:col-span-2 p-6 rounded-[32px] ${theme.card} border text-left flex items-start gap-4`}>
                  <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400 shrink-0"><Users size={24} /></div>
                  <div>
                    <h4 className="font-black uppercase text-xs mb-1">Хто ми?</h4>
                    <p className="text-xs opacity-60 leading-relaxed italic text-slate-400 font-medium">Ініціатива відділу «Якісне дозвілля» Національної дитячої та молодіжної ради України за підтримки Terre des Hommes та рандниці-уповноваженої з питань дітей та дитячої реабілітації Дар'ї Герасимчук.</p>
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
        <MapCustom 
          locations={filteredLocations} 
          center={mapConfig.center} 
          zoom={mapConfig.zoom} 
          isDark={isDark} 
        />
      </div>

      {/* BOTTOM CONTROLS */}
      <div className="absolute bottom-8 right-8 z-[1000] flex flex-col items-end gap-4">
        <button onClick={findMe} className="bg-white text-black w-14 h-14 rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all hover:bg-yellow-400 group" title="Де я?">
          <Navigation size={22} fill="currentColor" className="group-hover:rotate-12 transition-transform" />
        </button>
        <Link href="/add" className="bg-yellow-400 text-black px-8 py-5 rounded-[32px] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-yellow-400/40 flex items-center gap-4 group">
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
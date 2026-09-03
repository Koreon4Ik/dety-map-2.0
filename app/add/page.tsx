"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from 'next-sanity';
import { 
  Tag, ChevronDown, MapPin, Type, AlignLeft, Globe, CheckCircle2, 
  Navigation, AlertCircle, ArrowLeft, Send, Plus
} from 'lucide-react';
import Link from 'next/link';

const client = createClient({
  projectId: '5tbxcnx4',
  dataset: 'production',
  apiVersion: '2024-03-03',
  useCdn: false,
});

export default function AddLocation() {
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [dbCategories, setDbCategories] = useState<{_id: string, title: string}[]>([]);
  const [selectedCat, setSelectedCat] = useState<{id: string, title: string} | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [formData, setFormData] = useState({
    title: '',
    address: '',
    lat: '',
    lng: '',
    description: '',
    link: ''
  });

  // Завантаження категорій
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await client.fetch(`*[_type == "category"]{_id, title}`);
        setDbCategories(data);
      } catch (err) {
        console.error("Помилка завантаження категорій:", err);
      }
    };
    fetchCats();

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsCatOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      address: '',
      lat: '',
      lng: '',
      description: '',
      link: ''
    });
    setSelectedCat(null);
    setStatus('idle');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getMyLocation = () => {
    if (!navigator.geolocation) return alert("Геолокація не підтримується");
    navigator.geolocation.getCurrentPosition((pos) => {
      setFormData(prev => ({
        ...prev,
        lat: pos.coords.latitude.toString(),
        lng: pos.coords.longitude.toString()
      }));
    }, () => alert("Доступ до локації заборонено"));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCat) return alert("Оберіть категоріue!");
    
    setLoading(true);
    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          categoryId: selectedCat.id
        }),
      });

      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-yellow-400/20">
            <CheckCircle2 size={48} className="text-black" />
          </div>
          <h2 className="text-3xl font-black uppercase italic text-white">Дякуємо!</h2>
          <p className="text-slate-400 font-bold max-w-sm mx-auto">Ваша пропозиція відправлена на модерацію. Скоро вона з'явиться на мапі.</p>
          <div className="flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-3 bg-yellow-400 text-black px-6 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-white transition-colors"
            >
              Додати ще одну мітку <Plus size={18} />
            </button>
            <Link href="/" className="text-yellow-400 font-black uppercase tracking-widest border-b-2 border-yellow-400 pb-1 hover:opacity-70 transition-opacity">Повернутись на головну</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-12">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/" className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all text-slate-400 hover:text-white">
            <ArrowLeft size={24} />
          </Link>
          <div className="text-right">
            <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter leading-none">
              Додати <span className="text-yellow-400">локацію</span>
            </h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Твоя пропозиція з'явиться після модерації</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/40 p-6 md:p-10 rounded-[40px] border border-white/5 backdrop-blur-xl relative">
          
          {/* Категорія - Full Width */}
          <div className="md:col-span-2 space-y-2 relative" ref={dropdownRef}>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4 flex items-center gap-2">
              <Tag size={12} className="text-yellow-400" /> Категорія
            </label>
            <button
              type="button"
              onClick={() => setIsCatOpen(!isCatOpen)}
              className="w-full bg-white/5 border border-white/10 rounded-[24px] px-6 py-5 outline-none focus:border-yellow-400/50 transition-all font-bold text-left flex justify-between items-center group hover:bg-white/10"
            >
              <span className={selectedCat ? "text-white" : "text-slate-500"}>
                {selectedCat ? selectedCat.title : "Оберіть категорію..."}
              </span>
              <ChevronDown size={18} className={`text-yellow-400 transition-transform duration-300 ${isCatOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCatOpen && (
              <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-slate-900 border border-white/10 rounded-[30px] p-2 z-[100] shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                  {dbCategories.length > 0 ? dbCategories.map((cat) => (
                    <button
                      key={cat._id}
                      type="button"
                      onClick={() => { setSelectedCat({ id: cat._id, title: cat.title }); setIsCatOpen(false); }}
                      className={`w-full text-left px-5 py-4 rounded-2xl text-sm font-bold transition-all flex items-center justify-between group mb-1 ${
                        selectedCat?.id === cat._id ? 'bg-yellow-400 text-black' : 'hover:bg-white/5 text-white'
                      }`}
                    >
                      {cat.title}
                      {selectedCat?.id === cat._id && <CheckCircle2 size={16} />}
                    </button>
                  )) : <div className="p-4 text-center text-slate-500 text-xs font-bold uppercase">Категорії не знайдені...</div>}
                </div>
              </div>
            )}
          </div>

          {/* Назва */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4 flex items-center gap-2">
              <Type size={12} className="text-yellow-400" /> Назва закладу
            </label>
            <input required name="title" value={formData.title} onChange={handleInputChange} placeholder="Наприклад: Хаб 'Вільний'" className="w-full bg-white/5 border border-white/10 rounded-[24px] px-6 py-5 outline-none focus:border-yellow-400/50 transition-all font-bold placeholder:text-slate-700" />
          </div>

          {/* Адреса */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4 flex items-center gap-2">
              <MapPin size={12} className="text-yellow-400" /> Адреса
            </label>
            <input required name="address" value={formData.address} onChange={handleInputChange} placeholder="Вулиця, номер будинку, місто" className="w-full bg-white/5 border border-white/10 rounded-[24px] px-6 py-5 outline-none focus:border-yellow-400/50 transition-all font-bold placeholder:text-slate-700" />
          </div>

          {/* Координати */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4 flex items-center gap-2">
              Широта (Lat)
            </label>
            <input required name="lat" value={formData.lat} onChange={handleInputChange} placeholder="48.4647" className="w-full bg-white/5 border border-white/10 rounded-[24px] px-6 py-5 outline-none focus:border-yellow-400/50 transition-all font-bold placeholder:text-slate-700" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4 flex items-center gap-2 flex-row-reverse md:flex-row">
              <button type="button" onClick={getMyLocation} className="text-yellow-400 hover:text-white transition-colors"><Navigation size={14} /></button> Довгота (Lng)
            </label>
            <input required name="lng" value={formData.lng} onChange={handleInputChange} placeholder="35.0462" className="w-full bg-white/5 border border-white/10 rounded-[24px] px-6 py-5 outline-none focus:border-yellow-400/50 transition-all font-bold placeholder:text-slate-700" />
          </div>

          {/* Посилання */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4 flex items-center gap-2">
              <Globe size={12} className="text-yellow-400" /> Сайт або соцмережі (URL)
            </label>
            <input name="link" value={formData.link} onChange={handleInputChange} placeholder="https://instagram.com/..." className="w-full bg-white/5 border border-white/10 rounded-[24px] px-6 py-5 outline-none focus:border-yellow-400/50 transition-all font-bold placeholder:text-slate-700" />
          </div>

          {/* Опис */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4 flex items-center gap-2">
              <AlignLeft size={12} className="text-yellow-400" /> Опис локації
            </label>
            <textarea required name="description" value={formData.description} onChange={handleInputChange} rows={4} placeholder="Розкажіть детальніше про цей простір..." className="w-full bg-white/5 border border-white/10 rounded-[32px] px-6 py-5 outline-none focus:border-yellow-400/50 transition-all font-bold placeholder:text-slate-700 resize-none" />
          </div>

          {/* Помилка */}
          {status === 'error' && (
            <div className="md:col-span-2 flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold uppercase">
              <AlertCircle size={16} /> Помилка при відправці. Спробуйте пізніше.
            </div>
          )}

          {/* Submit */}
          <div className="md:col-span-2 pt-4">
            <button 
              disabled={loading}
              type="submit"
              className="w-full bg-yellow-400 text-black py-6 rounded-[30px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-yellow-400/10 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? "Відправляємо..." : (
                <>
                  Надіслати пропозицію <Send size={20} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
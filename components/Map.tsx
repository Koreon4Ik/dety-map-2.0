"use client";

import { MapContainer, TileLayer, Marker, useMap, ZoomControl, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import 'leaflet/dist/leaflet.css';

// Контролер руху камери
function MapController({ center, zoom }: { center: [number, number] | null, zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom(), { animate: true, duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function Map({ locations = [], center, zoom, isDark = true }: any) {
  const router = useRouter();

  // Отримуємо API ключ із змінних оточення (збережених у Vercel)
  const cartoApiKey = process.env.NEXT_PUBLIC_CARTO_API_KEY || '';
  
  // Кастомна іконка для локацій
  const createCustomIcon = (category: string) => {
    const colors: Record<string, string> = { 
      'МЦ': '#fbbf24',
      'NGO': '#34d399',
      'ОСВІТА': '#60a5fa',
      'КОВОРКІНГ': '#a78bfa',
      'СПОРТ': '#fb7185',
      'КУЛЬТУРА': '#2dd4bf',
      'ВОЛОНТЕРСТВО': '#f472b6',
      'ІНШЕ': '#94a3b8' 
    };

    const color = colors[category?.toUpperCase()] || colors['ІНШЕ'];
    const borderColor = isDark ? '#0f172a' : '#ffffff';

    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="background: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid ${borderColor}; box-shadow: 0 0 15px ${color}88;"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  // Іконка користувача
  const userIcon = L.divIcon({
    className: 'user-marker',
    html: `<div class="user-pulse-container"><div class="user-pulse"></div><div class="user-dot"></div></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });

  // Використовуємо параметр ?key= замість ?api_key= відповідно до вимог CARTO
  const tileUrl = isDark 
    ? `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=${cartoApiKey}`
    : `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?key=${cartoApiKey}`;

  return (
    <div className={`h-full w-full ${isDark ? 'bg-slate-950' : 'bg-slate-100'} transition-colors duration-500`}>
      <MapContainer 
        center={center || [48.3794, 31.1656]} 
        zoom={zoom} 
        zoomControl={false} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', background: isDark ? '#020617' : '#f8fafc', zIndex: 0 }}
      >
        <MapController center={center} zoom={zoom} />
        
        <TileLayer 
          url={tileUrl}
          attribution='&copy; CARTO'
        />

        <ZoomControl position="bottomleft" />

        {/* Маркер користувача (якщо активована геолокація) */}
        {center && center[1] !== 31.1656 && (
          <Marker position={center} icon={userIcon} zIndexOffset={1000} />
        )}

        {/* Маркери локацій із Sanity */}
        {locations.map((loc: any) => {
          if (!loc.coordinates?.lat || !loc.coordinates?.lng) return null;

          return (
            <Marker 
              key={loc._id} 
              position={[loc.coordinates.lat, loc.coordinates.lng]} 
              icon={createCustomIcon(loc.category)}
              eventHandlers={{
                click: () => {
                  const target = loc.slug || loc._id;
                  router.push(`/location/${target}`);
                }
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1} sticky>
                <div className="p-1 min-w-[100px]">
                  <div className="font-black uppercase italic text-[12px] text-slate-900 leading-tight">
                    {loc.title}
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5 tracking-widest">
                    {loc.category || 'ІНШЕ'}
                  </div>
                </div>
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Стилі для кастомних елементів мапи */}
      <style jsx global>{`
        .leaflet-container { background: ${isDark ? '#020617' : '#f8fafc'} !important; outline: none; }
        .leaflet-bar { border: none !important; box-shadow: 0 10px 25px rgba(0,0,0,0.2) !important; }
        .leaflet-bar a {
          background-color: ${isDark ? '#1e293b' : '#ffffff'} !important;
          color: ${isDark ? '#ffffff' : '#0f172a'} !important;
          border-bottom: 1px solid ${isDark ? '#334155' : '#f1f5f9'} !important;
          width: 40px !important;
          height: 40px !important;
          line-height: 40px !important;
        }
        .leaflet-bar a:first-child { border-radius: 12px 12px 0 0 !important; }
        .leaflet-bar a:last-child { border-radius: 0 0 12px 12px !important; border-bottom: none !important; }
        
        /* Маркер користувача */
        .user-pulse-container { position: relative; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; }
        .user-dot { width: 12px; height: 12px; background: #3b82f6; border: 2px solid white; border-radius: 50%; z-index: 2; box-shadow: 0 0 10px #3b82f6; }
        .user-pulse { position: absolute; width: 100%; height: 100%; background: #3b82f6; border-radius: 50%; opacity: 0.4; animation: user-ping 2s infinite ease-out; }
        @keyframes user-ping { 0% { transform: scale(0.5); opacity: 0.8; } 100% { transform: scale(2.5); opacity: 0; } }

        /* Кастомний тултіп */
        .leaflet-tooltip {
          background: white !important;
          border: none !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 20px rgba(0,0,0,0.15) !important;
          padding: 8px 12px !important;
        }
        .leaflet-tooltip-top:before { border-top-color: white !important; }
      `}</style>
    </div>
  );
}

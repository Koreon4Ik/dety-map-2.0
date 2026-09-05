"use client";

import { useState } from "react";
import { Check, Navigation, Share2 } from "lucide-react";

type LocationActionsProps = {
  title: string;
  address?: string;
  coordinates?: { lat?: number; lng?: number };
};

export default function LocationActions({ title, address, coordinates }: LocationActionsProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title,
      text: address ? `${title} - ${address}` : title,
      url: window.location.href,
    };

    if (navigator.share) {
      await navigator.share(shareData).catch(() => undefined);
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    window.setTimeout(() => setIsCopied(false), 2000);
  };

  const destination = coordinates?.lat !== undefined && coordinates?.lng !== undefined
    ? `${coordinates.lat},${coordinates.lng}`
    : address;
  const routeUrl = destination
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
    : null;

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-2 rounded-2xl bg-yellow-400 px-5 py-3 text-xs font-black uppercase tracking-widest text-black transition-colors hover:bg-white"
      >
        {isCopied ? <Check size={16} /> : <Share2 size={16} />}
        {isCopied ? "Посилання скопійовано" : "Поділитися"}
      </button>

      {routeUrl && (
        <a
          href={routeUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition-colors hover:border-yellow-400 hover:text-yellow-400"
        >
          <Navigation size={16} />
          Прокласти маршрут
        </a>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, WifiOff, Check } from 'lucide-react';

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('PWA Service Worker registered:', reg.scope))
        .catch((err) => console.warn('PWA SW registration error:', err));
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setShowBanner(false);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      alert("To install on iOS / Desktop: Tap 'Share' or browser menu ➔ 'Add to Home Screen' / 'Install App'.");
      return;
    }

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      setInstalled(true);
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (!showBanner && !installed) return null;

  return (
    <div className="fixed top-4 right-4 z-40 max-w-sm rounded-2xl border border-[#CCFF00]/50 bg-[#0B0D0E]/95 p-3.5 text-white shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0055A5] to-[#0284C7] border border-[#CCFF00]/40 text-[#CCFF00]">
          <Download className="h-5 w-5" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className="font-bold text-xs text-[#CCFF00] uppercase tracking-wide">
              Install Train Simulator Eastern
            </h4>
          </div>
          <p className="text-[11px] text-gray-300 mt-0.5 leading-tight">
            Install PWA on Mobile / PC for fullscreen 60fps play and offline cached 3D assets.
          </p>

          <div className="mt-2.5 flex items-center gap-2">
            <button
              onClick={handleInstall}
              className="flex items-center gap-1.5 rounded-xl bg-[#CCFF00] px-3 py-1.5 text-xs font-extrabold text-black shadow-md hover:bg-lime-400 transition-all cursor-pointer active:scale-95"
            >
              <Download className="h-3.5 w-3.5" />
              <span>INSTALL APP</span>
            </button>

            <button
              onClick={() => setShowBanner(false)}
              className="rounded-xl border border-white/10 px-2.5 py-1.5 text-xs font-bold text-gray-400 hover:text-white transition-all cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>

        <button
          onClick={() => setShowBanner(false)}
          className="text-gray-400 hover:text-white p-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

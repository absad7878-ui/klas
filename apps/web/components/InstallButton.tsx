'use client';

import { useEffect, useState } from 'react';
import { Download, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallButton({ className }: { className?: string }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled,    setIsInstalled]    = useState(false);
  const [isIOS,          setIsIOS]          = useState(false);
  const [showIOSHint,    setShowIOSHint]    = useState(false);
  const [loading,        setLoading]        = useState(false);

  useEffect(() => {
    // Detect iOS
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);

    // Detect if already installed
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    // Capture install prompt (Android / Chrome)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Detect successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSHint(prev => !prev);
      return;
    }
    if (!deferredPrompt) return;
    setLoading(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setIsInstalled(true);
    } finally {
      setLoading(false);
      setDeferredPrompt(null);
    }
  };

  // Already installed — show nothing
  if (isInstalled) return null;

  // Not installable on this browser and not iOS — show nothing
  if (!deferredPrompt && !isIOS) return null;

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '.5rem' }}>
      <button
        onClick={handleInstall}
        disabled={loading}
        className={className}
        style={{
          display:        'inline-flex',
          alignItems:     'center',
          gap:            '.5rem',
          padding:        '.75rem 1.5rem',
          borderRadius:   12,
          border:         '2px solid rgba(201,150,58,.4)',
          background:     'rgba(201,150,58,.1)',
          color:          '#C9963A',
          fontFamily:     "'DM Sans',sans-serif",
          fontWeight:     700,
          fontSize:       '.9rem',
          cursor:         loading ? 'not-allowed' : 'pointer',
          opacity:        loading ? .7 : 1,
          transition:     'all .2s',
          backdropFilter: 'blur(8px)',
        }}
        onMouseOver={e => { if (!loading) e.currentTarget.style.background = 'rgba(201,150,58,.2)'; }}
        onMouseOut={e => { e.currentTarget.style.background = 'rgba(201,150,58,.1)'; }}
      >
        {isIOS ? <Share size={16} /> : <Download size={16} />}
        {loading ? 'Installing…' : isIOS ? 'Add to Home Screen' : 'Install App'}
      </button>

      {/* iOS instruction hint */}
      {isIOS && showIOSHint && (
        <div style={{
          background:   'rgba(11,29,58,.95)',
          border:       '1px solid rgba(201,150,58,.3)',
          borderRadius: 12,
          padding:      '.85rem 1.1rem',
          maxWidth:     260,
          textAlign:    'center',
          backdropFilter: 'blur(12px)',
        }}>
          <p style={{ color: '#C9963A', fontWeight: 700, fontSize: '.82rem', margin: '0 0 .35rem' }}>
            Install on iPhone / iPad
          </p>
          <p style={{ color: '#94A3B8', fontSize: '.78rem', margin: 0, lineHeight: 1.5 }}>
            Tap the <strong style={{ color: '#fff' }}>Share</strong> button at the bottom of Safari, then tap <strong style={{ color: '#fff' }}>Add to Home Screen</strong>
          </p>
        </div>
      )}
    </div>
  );
}
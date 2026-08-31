import React, { useState, useEffect } from 'react';
import { Download, X, Laptop, ShieldCheck } from 'lucide-react';

export const PwaInstallModal = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if app is already running as installed PWA standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      // Prevent default Chrome mini-infobar
      e.preventDefault();
      setDeferredPrompt(e);

      // Check if user previously dismissed prompt
      const dismissedTime = localStorage.getItem('hms_pwa_dismissed');
      const now = Date.now();
      
      // If never dismissed or dismissed more than 24h ago, show prompt for new users
      if (!dismissedTime || (now - Number(dismissedTime)) > 24 * 60 * 60 * 1000) {
        setShowModal(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('PWA installation is supported in Chrome, Edge, and modern browsers. Use browser menu (3 dots) -> "Install App".');
      setShowModal(false);
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted PWA installation prompt');
    }
    setDeferredPrompt(null);
    setShowModal(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('hms_pwa_dismissed', Date.now().toString());
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 10000, backgroundColor: 'rgba(15, 23, 42, 0.75)' }}>
      <div className="modal-content" style={{ maxWidth: '520px', padding: '2rem', borderRadius: '16px', border: '2px solid #0F766E', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{ padding: '0.5rem', backgroundColor: '#F0FDF4', borderRadius: '12px', border: '1px solid #A7F3D0' }}>
              <img src="/coer-logo.png" alt="COER University Seal" style={{ height: '44px', objectFit: 'contain' }} />
            </div>
            <div>
              <span className="badge badge-teal" style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                DESKTOP APP AVAILABLE
              </span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.2 }}>
                Install COER HMS Desktop App
              </h3>
            </div>
          </div>
          <button onClick={handleDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5, marginBottom: '1.25rem' }}>
          Welcome to <strong>COER Medical College & Hospital HMS</strong>. Download the official Desktop Application on your computer for 1-click launching, faster performance, and offline record accessibility.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: '#F8FAFC', padding: '0.875rem 1rem', borderRadius: '10px', border: '1px solid #CBD5E1', marginBottom: '1.5rem', fontSize: '0.8125rem', color: '#334155' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Laptop size={16} color="#0F766E" />
            <span>Launch directly from Desktop & Taskbar</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={16} color="#0F766E" />
            <span>Fast LAN Network Performance & Offline Cache</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={handleDismiss} style={{ fontWeight: 600 }}>
            Maybe Later
          </button>
          <button className="btn btn-primary" onClick={handleInstallClick} style={{ padding: '0.625rem 1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={18} /> Install Application
          </button>
        </div>
      </div>
    </div>
  );
};

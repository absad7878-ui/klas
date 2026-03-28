'use client';

import { useState, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { requestNotificationPermission } from '@/app/lib/firebase';

export default function EnableNotifications({
  role,
  schoolId,
}: {
  role:      string;
  schoolId?: string;
}) {
  const [status,  setStatus]  = useState<'idle' | 'loading' | 'granted' | 'denied'>('idle');
  const [mounted, setMounted] = useState(false);

  const API   = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const token = () => (typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '');

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') setStatus('granted');
      if (Notification.permission === 'denied')  setStatus('denied');
    }
  }, []);

  if (!mounted || typeof window === 'undefined' || !('Notification' in window)) return null;

  const handleEnable = async () => {
    setStatus('loading');
    const success = await requestNotificationPermission(
      role,
      API,
      token(),
      schoolId,
    );
    setStatus(success ? 'granted' : 'denied');
  };

  if (status === 'granted') return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', color: '#16A34A', fontSize: '.82rem', fontWeight: 600 }}>
      <Check size={14} /> Notifications on
    </div>
  );

  if (status === 'denied') return null;

  return (
    <button
      onClick={handleEnable}
      disabled={status === 'loading'}
      style={{
        display:     'inline-flex',
        alignItems:  'center',
        gap:         '.5rem',
        padding:     '.5rem 1rem',
        borderRadius: 10,
        border:      '1.5px solid rgba(201,150,58,.4)',
        background:  'rgba(201,150,58,.1)',
        color:       '#C9963A',
        fontWeight:  700,
        fontSize:    '.82rem',
        cursor:      status === 'loading' ? 'not-allowed' : 'pointer',
        fontFamily:  "'DM Sans',sans-serif",
        opacity:     status === 'loading' ? .7 : 1,
      }}
    >
      <Bell size={13} />
      {status === 'loading' ? 'Enabling…' : 'Enable Notifications'}
    </button>
  );
}
'use client';
// apps/web/components/EnableNotifications.tsx

import { useState, useEffect } from 'react';
import { Bell, Check, BellOff } from 'lucide-react';
import { requestNotificationPermission } from '@/app/lib/firebase';

interface Props {
  role:         string;
  schoolId?:    string;
  parentToken?: string;
  compact?:     boolean;
}

export default function EnableNotifications({ role, schoolId, parentToken, compact }: Props) {
  const [status,  setStatus]  = useState<'idle' | 'loading' | 'granted' | 'denied'>('idle');
  const [mounted, setMounted] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const getToken = () => {
    if (typeof window === 'undefined') return '';
    if (parentToken) return parentToken;
    return localStorage.getItem('token') || '';
  };

  useEffect(() => {
    setMounted(true);
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    const permission = Notification.permission;

    if (permission === 'denied') {
      setStatus('denied');
      return;
    }

    if (permission === 'granted') {
      // ── KEY FIX: Browser says granted but DB may be empty (after reset).
      // Always re-send token to backend on mount to stay in sync.
      setStatus('loading');
      requestNotificationPermission(role, API, getToken(), schoolId)
        .then(ok => setStatus(ok ? 'granted' : 'idle'))
        .catch(() => setStatus('idle'));
    }
    // permission === 'default' → stay 'idle' so button shows
  }, []);  // only run once on mount

  if (!mounted || typeof window === 'undefined' || !('Notification' in window)) return null;

  const handleEnable = async () => {
    setStatus('loading');
    const success = await requestNotificationPermission(
      role,
      API,
      getToken(),
      schoolId,
    );
    setStatus(success ? 'granted' : 'denied');
  };

  // ── Compact mode (icon only for dashboard header) ─────────────────────────
  if (compact) {
    if (status === 'loading') return (
      <div style={{ width:34, height:34, borderRadius:9, background:'rgba(201,150,58,.1)', border:'1px solid rgba(201,150,58,.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ width:14, height:14, borderRadius:'50%', border:'2px solid rgba(201,150,58,.3)', borderTopColor:'#C9963A', animation:'spin .7s linear infinite' }} />
      </div>
    );

    if (status === 'granted') return (
      <div title="Notifications enabled"
        style={{ width:34, height:34, borderRadius:9, background:'rgba(34,197,94,.15)', border:'1px solid rgba(34,197,94,.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Bell size={15} color="#22C55E" fill="rgba(34,197,94,.3)" />
      </div>
    );

    if (status === 'denied') return (
      <div title="Notifications blocked — enable in browser settings"
        style={{ width:34, height:34, borderRadius:9, background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <BellOff size={15} color="#EF4444" />
      </div>
    );

    // idle — clickable bell
    return (
      <button onClick={handleEnable} title="Enable notifications"
        style={{ width:34, height:34, borderRadius:9, background:'rgba(201,150,58,.1)', border:'1px solid rgba(201,150,58,.3)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'all .2s' }}
        onMouseOver={e => (e.currentTarget.style.background='rgba(201,150,58,.2)')}
        onMouseOut={e  => (e.currentTarget.style.background='rgba(201,150,58,.1)')}>
        <Bell size={15} color="#C9963A" />
      </button>
    );
  }

  // ── Full button mode ───────────────────────────────────────────────────────
  if (status === 'granted') return (
    <div style={{ display:'flex', alignItems:'center', gap:'.4rem', color:'#16A34A', fontSize:'.82rem', fontWeight:600 }}>
      <Check size={14} /> Notifications on
    </div>
  );

  if (status === 'denied') return null;

  return (
    <button onClick={handleEnable} disabled={status === 'loading'}
      style={{ display:'inline-flex', alignItems:'center', gap:'.5rem', padding:'.5rem 1rem', borderRadius:10, border:'1.5px solid rgba(201,150,58,.4)', background:'rgba(201,150,58,.1)', color:'#C9963A', fontWeight:700, fontSize:'.82rem', cursor:status==='loading'?'not-allowed':'pointer', fontFamily:"'DM Sans',sans-serif", opacity:status==='loading'?.7:1 }}>
      <Bell size={13} />
      {status === 'loading' ? 'Enabling…' : 'Enable Notifications'}
    </button>
  );
}

'use client';
// apps/web/components/EnableNotifications.tsx

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, BellOff, X, Inbox } from 'lucide-react';
import { requestNotificationPermission } from '@/app/lib/firebase';

interface Props {
  role:         string;
  schoolId?:    string;
  parentToken?: string;
  compact?:     boolean;
}

interface NotificationItem {
  id:        string;
  title:     string;
  body:      string;
  timestamp: number;
  read:      boolean;
  url?:      string;
}

const STORAGE_KEY = 'klas_notifications';

function loadNotifications(): NotificationItem[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

function saveNotifications(items: NotificationItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 50))); // keep last 50
}

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60)   return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function EnableNotifications({ role, schoolId, parentToken, compact }: Props) {
  const [status,        setStatus]        = useState<'idle' | 'loading' | 'granted' | 'denied'>('idle');
  const [mounted,       setMounted]       = useState(false);
  const [panelOpen,     setPanelOpen]     = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const getToken = () => {
    if (typeof window === 'undefined') return '';
    if (parentToken) return parentToken;
    return localStorage.getItem('token') || '';
  };

  // ── Load notifications from localStorage ──────────────────────────────────
  useEffect(() => {
    setMounted(true);
    setNotifications(loadNotifications());

    // Listen for new push notifications arriving via service worker
    if ('serviceWorker' in navigator) {
      const handler = (event: MessageEvent) => {
        if (event.data?.type === 'PUSH_NOTIFICATION') {
          const newItem: NotificationItem = {
            id:        crypto.randomUUID(),
            title:     event.data.title || 'Klas Notification',
            body:      event.data.body  || '',
            timestamp: Date.now(),
            read:      false,
            url:       event.data.url,
          };
          setNotifications(prev => {
            const updated = [newItem, ...prev];
            saveNotifications(updated);
            return updated;
          });
        }
      };
      navigator.serviceWorker.addEventListener('message', handler);
      return () => navigator.serviceWorker.removeEventListener('message', handler);
    }
  }, []);

  // ── Check notification permission on mount ────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    const permission = Notification.permission;
    if (permission === 'denied') { setStatus('denied'); return; }
    if (permission === 'granted') {
      setStatus('loading');
      requestNotificationPermission(role, API, getToken(), schoolId)
        .then(ok => setStatus(ok ? 'granted' : 'idle'))
        .catch(() => setStatus('idle'));
    }
  }, []);

  // ── Close panel on outside click ──────────────────────────────────────────
  useEffect(() => {
    if (!panelOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [panelOpen]);

  if (!mounted || typeof window === 'undefined' || !('Notification' in window)) return null;

  const handleEnable = async () => {
    setStatus('loading');
    const success = await requestNotificationPermission(role, API, getToken(), schoolId);
    setStatus(success ? 'granted' : 'denied');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      saveNotifications(updated);
      return updated;
    });
  };

  const clearAll = () => {
    setNotifications([]);
    saveNotifications([]);
  };

  const markRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      saveNotifications(updated);
      return updated;
    });
  };

  const togglePanel = () => {
    setPanelOpen(p => !p);
    if (!panelOpen) markAllRead(); // mark all read when opening
  };

  // ── Compact mode ──────────────────────────────────────────────────────────
  if (compact) {
    const bellButton = (onClick?: () => void, color = '#C9963A', bg = 'rgba(201,150,58,.1)', border = 'rgba(201,150,58,.3)', filled = false) => (
      <div ref={panelRef} style={{ position: 'relative' }}>
        <button
          onClick={onClick || togglePanel}
          title={status === 'denied' ? 'Notifications blocked — enable in browser settings' : status === 'granted' ? 'View notifications' : 'Enable notifications'}
          style={{ width:34, height:34, borderRadius:9, background: bg, border:`1px solid ${border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor: onClick ? 'pointer' : status === 'granted' ? 'pointer' : 'default', position:'relative', transition:'all .2s' }}
          onMouseOver={e => { if (status === 'granted' || onClick) e.currentTarget.style.background = 'rgba(201,150,58,.2)'; }}
          onMouseOut={e  => { e.currentTarget.style.background = bg; }}
        >
          {status === 'loading' ? (
            <div style={{ width:14, height:14, borderRadius:'50%', border:'2px solid rgba(201,150,58,.3)', borderTopColor:'#C9963A', animation:'spin .7s linear infinite' }} />
          ) : status === 'denied' ? (
            <BellOff size={15} color="#EF4444" />
          ) : (
            <Bell size={15} color={color} fill={filled ? 'rgba(34,197,94,.3)' : 'none'} />
          )}

          {/* Unread badge */}
          {status === 'granted' && unreadCount > 0 && (
            <span style={{ position:'absolute', top:-4, right:-4, minWidth:16, height:16, borderRadius:8, background:'#EF4444', color:'#fff', fontSize:'.6rem', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 3px', border:'2px solid #0B1D3A' }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notification Panel */}
        {panelOpen && status === 'granted' && (
          <div style={{
            position:'absolute', top:'calc(100% + 10px)', right:0, width:320,
            background:'#fff', borderRadius:16, boxShadow:'0 20px 60px rgba(11,29,58,.18)',
            border:'1.5px solid #E8EDF3', zIndex:999, overflow:'hidden',
            animation:'fadeDown .18s ease'
          }}>
            <style>{`@keyframes fadeDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>

            {/* Panel header */}
            <div style={{ background:'#0B1D3A', padding:'.85rem 1rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'.5rem' }}>
                <Bell size={14} color="#C9963A" fill="rgba(201,150,58,.3)" />
                <span style={{ color:'#fff', fontWeight:700, fontSize:'.85rem', fontFamily:"'DM Sans',sans-serif" }}>Notifications</span>
                {unreadCount > 0 && (
                  <span style={{ background:'#EF4444', color:'#fff', fontSize:'.62rem', fontWeight:700, padding:'1px 6px', borderRadius:6 }}>
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div style={{ display:'flex', gap:'.4rem', alignItems:'center' }}>
                {notifications.length > 0 && (
                  <button onClick={clearAll} style={{ color:'#64748B', fontSize:'.68rem', background:'none', border:'none', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                    Clear all
                  </button>
                )}
                <button onClick={() => setPanelOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', color:'#64748B' }}>
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Notification list */}
            <div style={{ maxHeight:340, overflowY:'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ padding:'2.5rem 1rem', textAlign:'center' }}>
                  <Inbox size={32} color="#E2E8F0" style={{ margin:'0 auto .75rem' }} />
                  <p style={{ color:'#94A3B8', fontSize:'.82rem', fontFamily:"'DM Sans',sans-serif", margin:0 }}>No notifications yet</p>
                  <p style={{ color:'#CBD5E1', fontSize:'.74rem', fontFamily:"'DM Sans',sans-serif", marginTop:'.25rem' }}>We'll notify you about school updates here</p>
                </div>
              ) : (
                notifications.map((n, i) => (
                  <div
                    key={n.id}
                    onClick={() => { markRead(n.id); if (n.url) window.location.href = n.url; }}
                    style={{
                      padding:'.85rem 1rem',
                      borderBottom: i < notifications.length - 1 ? '1px solid #F1F5F9' : 'none',
                      background: n.read ? '#fff' : '#FFFBEB',
                      cursor: n.url ? 'pointer' : 'default',
                      display:'flex', gap:'.75rem', alignItems:'flex-start',
                      transition:'background .15s',
                    }}
                    onMouseOver={e => { if (n.url) e.currentTarget.style.background = '#F8FAFC'; }}
                    onMouseOut={e  => { e.currentTarget.style.background = n.read ? '#fff' : '#FFFBEB'; }}
                  >
                    {/* Icon */}
                    <div style={{ width:34, height:34, borderRadius:10, background: n.read ? '#F1F5F9' : 'rgba(201,150,58,.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Bell size={14} color={n.read ? '#94A3B8' : '#C9963A'} />
                    </div>

                    {/* Content */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontWeight: n.read ? 500 : 700, color:'#0B1D3A', fontSize:'.82rem', margin:0, fontFamily:"'DM Sans',sans-serif", whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                        {n.title}
                      </p>
                      <p style={{ color:'#64748B', fontSize:'.76rem', margin:'.2rem 0 0', fontFamily:"'DM Sans',sans-serif", lineHeight:1.4 }}>
                        {n.body}
                      </p>
                      <p style={{ color:'#94A3B8', fontSize:'.68rem', margin:'.3rem 0 0', fontFamily:"'DM Sans',sans-serif" }}>
                        {timeAgo(n.timestamp)}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {!n.read && (
                      <div style={{ width:7, height:7, borderRadius:'50%', background:'#C9963A', flexShrink:0, marginTop:4 }} />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );

    if (status === 'loading')  return bellButton(undefined, '#C9963A', 'rgba(201,150,58,.1)', 'rgba(201,150,58,.3)');
    if (status === 'granted')  return bellButton(togglePanel, '#22C55E', 'rgba(34,197,94,.15)', 'rgba(34,197,94,.3)', true);
    if (status === 'denied')   return bellButton(undefined, '#EF4444', 'rgba(239,68,68,.1)', 'rgba(239,68,68,.2)');

    // idle — click to enable
    return bellButton(handleEnable);
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

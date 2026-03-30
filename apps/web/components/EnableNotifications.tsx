'use client';
// apps/web/components/EnableNotifications.tsx

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, BellOff, Check, X, Inbox, RefreshCw } from 'lucide-react';
import { requestNotificationPermission } from '@/app/lib/firebase';

interface Props {
  role:         string;
  schoolId?:    string;
  parentToken?: string;
  compact?:     boolean;
}

interface Announcement {
  id:             string;
  title:          string;
  content:        string;
  createdAt:      string;
  targetAudience: string;
  school?:        { name: string; subdomain?: string };
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const READ_KEY = 'klas_read_notifications';

function getReadIds(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(READ_KEY) || '[]')); }
  catch { return new Set(); }
}

function markIdRead(id: string) {
  try {
    const ids = getReadIds();
    ids.add(id);
    localStorage.setItem(READ_KEY, JSON.stringify([...ids].slice(-200)));
  } catch { /* ignore */ }
}

export default function EnableNotifications({ role, schoolId, parentToken, compact }: Props) {
  const [status,        setStatus]        = useState<'idle' | 'loading' | 'granted' | 'denied'>('idle');
  const [mounted,       setMounted]       = useState(false);
  const [panelOpen,     setPanelOpen]     = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [readIds,       setReadIds]       = useState<Set<string>>(new Set());
  const [fetching,      setFetching]      = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const getToken = useCallback(() => {
    if (typeof window === 'undefined') return '';
    if (parentToken) return parentToken;
    return localStorage.getItem('token') || '';
  }, [parentToken]);

  // ── Fetch announcements from backend ──────────────────────────────────────
  const fetchAnnouncements = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setFetching(true);
    try {
      const res = await fetch(`${API}/announcements/parent`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed');
      const data: Announcement[] = await res.json();
      setAnnouncements(data);
    } catch {
      // silently fail — don't break UI
    } finally {
      setFetching(false);
    }
  }, [API, getToken]);

  // ── Mount: load read ids + check permission ───────────────────────────────
  useEffect(() => {
    setMounted(true);
    setReadIds(getReadIds());

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

  // ── Fetch when granted ────────────────────────────────────────────────────
  useEffect(() => {
    if (status === 'granted') fetchAnnouncements();
  }, [status]);

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

  // ── Listen for new push messages from service worker ─────────────────────
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'PUSH_NOTIFICATION') {
        // Re-fetch from backend to get the real announcement
        fetchAnnouncements();
      }
    };
    navigator.serviceWorker.addEventListener('message', handler);
    return () => navigator.serviceWorker.removeEventListener('message', handler);
  }, [fetchAnnouncements]);

  if (!mounted || typeof window === 'undefined' || !('Notification' in window)) return null;

  const handleEnable = async () => {
    setStatus('loading');
    const success = await requestNotificationPermission(role, API, getToken(), schoolId);
    setStatus(success ? 'granted' : 'denied');
  };

  const unreadCount = announcements.filter(a => !readIds.has(a.id)).length;

  const handleMarkRead = (id: string) => {
    markIdRead(id);
    setReadIds(prev => new Set([...prev, id]));
  };

  const handleMarkAllRead = () => {
    announcements.forEach(a => markIdRead(a.id));
    setReadIds(new Set(announcements.map(a => a.id)));
  };

  const togglePanel = () => {
    setPanelOpen(p => {
      if (!p) {
        fetchAnnouncements(); // refresh on open
        handleMarkAllRead();
      }
      return !p;
    });
  };

  // ── Compact mode ──────────────────────────────────────────────────────────
  if (compact) {
    const isGranted = status === 'granted';
    const isDenied  = status === 'denied';
    const isLoading = status === 'loading';

    const bgColor     = isDenied ? 'rgba(239,68,68,.1)'     : isGranted ? 'rgba(34,197,94,.15)'     : 'rgba(201,150,58,.1)';
    const borderColor = isDenied ? 'rgba(239,68,68,.2)'     : isGranted ? 'rgba(34,197,94,.3)'       : 'rgba(201,150,58,.3)';
    const iconColor   = isDenied ? '#EF4444'                : isGranted ? '#22C55E'                  : '#C9963A';

    return (
      <div ref={panelRef} style={{ position: 'relative' }}>
        <button
          onClick={isGranted ? togglePanel : isDenied ? undefined : handleEnable}
          title={isDenied ? 'Notifications blocked — enable in browser settings' : isGranted ? 'View notifications' : 'Enable notifications'}
          style={{ width:34, height:34, borderRadius:9, background:bgColor, border:`1px solid ${borderColor}`, display:'flex', alignItems:'center', justifyContent:'center', cursor: isDenied ? 'default' : 'pointer', position:'relative', transition:'all .2s' }}
          onMouseOver={e => { if (!isDenied) e.currentTarget.style.background = isGranted ? 'rgba(34,197,94,.25)' : 'rgba(201,150,58,.2)'; }}
          onMouseOut={e  => { e.currentTarget.style.background = bgColor; }}
        >
          {isLoading ? (
            <div style={{ width:14, height:14, borderRadius:'50%', border:'2px solid rgba(201,150,58,.3)', borderTopColor:'#C9963A', animation:'spin .7s linear infinite' }} />
          ) : isDenied ? (
            <BellOff size={15} color={iconColor} />
          ) : (
            <Bell size={15} color={iconColor} fill={isGranted ? 'rgba(34,197,94,.3)' : 'none'} />
          )}

          {/* Unread badge */}
          {isGranted && unreadCount > 0 && (
            <span style={{ position:'absolute', top:-4, right:-4, minWidth:16, height:16, borderRadius:8, background:'#EF4444', color:'#fff', fontSize:'.6rem', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 3px', border:'2px solid #0B1D3A' }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* ── Notification Panel ─────────────────────────────────────────── */}
        {panelOpen && isGranted && (
          <div style={{
            position:'absolute', top:'calc(100% + 10px)', right:0, width:340,
            background:'#fff', borderRadius:16, boxShadow:'0 20px 60px rgba(11,29,58,.18)',
            border:'1.5px solid #E8EDF3', zIndex:999, overflow:'hidden',
            animation:'fadeDown .18s ease',
          }}>
            <style>{`
              @keyframes fadeDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
              @keyframes spin     { to{transform:rotate(360deg)} }
              .notif-row:hover { background:#F8FAFC !important; }
            `}</style>

            {/* Panel header */}
            <div style={{ background:'#0B1D3A', padding:'.85rem 1rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'.5rem' }}>
                <Bell size={14} color="#C9963A" fill="rgba(201,150,58,.3)" />
                <span style={{ color:'#fff', fontWeight:700, fontSize:'.85rem', fontFamily:"'DM Sans',sans-serif" }}>
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span style={{ background:'#EF4444', color:'#fff', fontSize:'.62rem', fontWeight:700, padding:'1px 6px', borderRadius:6 }}>
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div style={{ display:'flex', gap:'.5rem', alignItems:'center' }}>
                {/* Refresh button */}
                <button onClick={fetchAnnouncements} title="Refresh"
                  style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', color:'#64748B', padding:2 }}>
                  <RefreshCw size={13} style={{ animation: fetching ? 'spin .7s linear infinite' : 'none' }} />
                </button>
                {announcements.length > 0 && unreadCount > 0 && (
                  <button onClick={handleMarkAllRead}
                    style={{ color:'#94A3B8', fontSize:'.68rem', background:'none', border:'none', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", whiteSpace:'nowrap' }}>
                    Mark all read
                  </button>
                )}
                <button onClick={() => setPanelOpen(false)}
                  style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', color:'#64748B' }}>
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Notification list */}
            <div style={{ maxHeight:380, overflowY:'auto' }}>
              {fetching && announcements.length === 0 ? (
                <div style={{ padding:'2.5rem 1rem', textAlign:'center' }}>
                  <div style={{ width:24, height:24, borderRadius:'50%', border:'3px solid rgba(201,150,58,.2)', borderTopColor:'#C9963A', animation:'spin .7s linear infinite', margin:'0 auto .75rem' }} />
                  <p style={{ color:'#94A3B8', fontSize:'.82rem', fontFamily:"'DM Sans',sans-serif", margin:0 }}>Loading notifications…</p>
                </div>
              ) : announcements.length === 0 ? (
                <div style={{ padding:'2.5rem 1rem', textAlign:'center' }}>
                  <Inbox size={32} color="#E2E8F0" style={{ margin:'0 auto .75rem' }} />
                  <p style={{ color:'#94A3B8', fontSize:'.82rem', fontFamily:"'DM Sans',sans-serif", margin:0 }}>No notifications yet</p>
                  <p style={{ color:'#CBD5E1', fontSize:'.74rem', fontFamily:"'DM Sans',sans-serif", marginTop:'.25rem' }}>
                    School announcements will appear here
                  </p>
                </div>
              ) : (
                announcements.map((a, i) => {
                  const isRead = readIds.has(a.id);
                  const url    = a.school?.subdomain
                    ? `https://${a.school.subdomain}.klas.ng/announcements`
                    : '/parent/dashboard';

                  return (
                    <div
                      key={a.id}
                      className="notif-row"
                      onClick={() => { handleMarkRead(a.id); window.location.href = url; }}
                      style={{
                        padding:'.85rem 1rem',
                        borderBottom: i < announcements.length - 1 ? '1px solid #F1F5F9' : 'none',
                        background: isRead ? '#fff' : '#FFFBEB',
                        cursor:'pointer',
                        display:'flex', gap:'.75rem', alignItems:'flex-start',
                      }}
                    >
                      {/* Icon */}
                      <div style={{ width:36, height:36, borderRadius:10, background: isRead ? '#F1F5F9' : 'rgba(201,150,58,.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'1rem' }}>
                        📢
                      </div>

                      {/* Content */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontWeight: isRead ? 500 : 700, color:'#0B1D3A', fontSize:'.82rem', margin:0, fontFamily:"'DM Sans',sans-serif", whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                          {a.title}
                        </p>
                        <p style={{ color:'#64748B', fontSize:'.76rem', margin:'.18rem 0 0', fontFamily:"'DM Sans',sans-serif", lineHeight:1.4,
                          display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                          {a.content}
                        </p>
                        <div style={{ display:'flex', alignItems:'center', gap:'.4rem', marginTop:'.3rem' }}>
                          {a.school?.name && (
                            <span style={{ color:'#C9963A', fontSize:'.68rem', fontWeight:600, fontFamily:"'DM Sans',sans-serif" }}>
                              {a.school.name}
                            </span>
                          )}
                          <span style={{ color:'#CBD5E1', fontSize:'.65rem' }}>·</span>
                          <span style={{ color:'#94A3B8', fontSize:'.68rem', fontFamily:"'DM Sans',sans-serif" }}>
                            {timeAgo(a.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Unread dot */}
                      {!isRead && (
                        <div style={{ width:7, height:7, borderRadius:'50%', background:'#C9963A', flexShrink:0, marginTop:5 }} />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
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

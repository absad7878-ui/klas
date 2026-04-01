'use client';
// apps/web/components/NotificationBell.tsx
// Single bell that handles BOTH push subscription AND announcement dropdown

import { useState, useEffect, useRef } from 'react';
import { Bell, X, Clock, ChevronRight, Megaphone, BellOff } from 'lucide-react';
import { requestNotificationPermission } from '@/app/lib/firebase';

interface Announcement {
  id:             string;
  title:          string;
  content:        string;
  targetAudience: string;
  createdAt:      string;
}

interface Props {
  apiUrl:          string;
  token:           string;
  role?:           string;
  subdomain?:      string;
  parentEndpoint?: string;
  schoolId?:       string;
  parentToken?:    string;
}

export default function NotificationBell({
  apiUrl, token, role = 'teacher', subdomain, parentEndpoint, schoolId, parentToken,
}: Props) {
  const [open,          setOpen]          = useState(false);
  const [selected,      setSelected]      = useState<Announcement | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [unread,        setUnread]        = useState(0);
  const [loading,       setLoading]       = useState(false);
  const [pushStatus,    setPushStatus]    = useState<'idle'|'loading'|'granted'|'denied'>('idle');
  const ref = useRef<HTMLDivElement>(null);

  const STORAGE_KEY = `klas_last_read_${role}`;
  const authToken   = parentToken || token;

  // ── Init push notification status ─────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    const p = Notification.permission;
    if (p === 'granted') setPushStatus('granted');
    if (p === 'denied')  setPushStatus('denied');
  }, []);

  // ── Load announcements on mount ────────────────────────────────────────────
  useEffect(() => {
    if (!token && !subdomain) return;
    loadAnnouncements();
  }, [token, subdomain]);

  // ── Close on outside click ─────────────────────────────────────────────────
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false); setSelected(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      let data: Announcement[] = [];

      if (parentEndpoint && authToken) {
        const res = await fetch(parentEndpoint, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (res.ok) data = await res.json();

      } else if (subdomain) {
        const res = await fetch(`${apiUrl}/public/announcements?subdomain=${subdomain}`);
        if (res.ok) { const r = await res.json(); data = r.announcements || []; }

      } else if (token) {
        const res = await fetch(`${apiUrl}/announcements`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) data = await res.json();
      }

      setAnnouncements(data);
      const lastRead     = localStorage.getItem(STORAGE_KEY);
      const lastReadTime = lastRead ? new Date(lastRead).getTime() : 0;
      setUnread(data.filter(a => new Date(a.createdAt).getTime() > lastReadTime).length);
    } catch { /**/ }
    finally { setLoading(false); }
  };

  // ── Enable push notifications ──────────────────────────────────────────────
  const enablePush = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (pushStatus === 'granted' || pushStatus === 'loading') return;
    setPushStatus('loading');
    try {
      const ok = await requestNotificationPermission(role, apiUrl, authToken, schoolId);
      setPushStatus(ok ? 'granted' : 'denied');
    } catch { setPushStatus('idle'); }
  };

  // ── Open/close dropdown ────────────────────────────────────────────────────
  const handleOpen = () => {
    setOpen(o => !o);
    setSelected(null);
    if (!open) {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
      setUnread(0);
    }
  };

  const audienceInfo = (a: string) => {
    if (a === 'parents')  return { label:'Parents',  bg:'#EFF6FF', color:'#2563EB' };
    if (a === 'teachers') return { label:'Teachers', bg:'#ECFDF5', color:'#16A34A' };
    return                       { label:'Everyone', bg:'#FFF7ED', color:'#EA580C' };
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' });
  const formatTime = (d: string) => new Date(d).toLocaleTimeString('en-NG', { hour:'2-digit', minute:'2-digit' });

  return (
    <div ref={ref} style={{ position:'relative' }}>
      <style>{`
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>

      {/* ── Single Bell Button ── */}
      <button onClick={handleOpen}
        style={{ position:'relative', width:40, height:40, borderRadius:12, border:`1px solid ${open?'rgba(201,150,58,.4)':'rgba(255,255,255,.15)'}`, background:open?'rgba(201,150,58,.2)':'rgba(255,255,255,.08)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'all .2s' }}>
        <Bell size={17} color={open?'#C9963A':'#94A3B8'} fill={open?'rgba(201,150,58,.2)':'none'} />
        {unread > 0 && (
          <span style={{ position:'absolute', top:-5, right:-5, minWidth:18, height:18, padding:'0 5px', borderRadius:20, background:'#EF4444', color:'#fff', fontSize:'.62rem', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* ── Dropdown — responsive, won't cut off on mobile ── */}
      {open && (
        <div style={{
          position:   'fixed',           // fixed so it's never clipped by parent overflow
          top:        60,                // below the sticky header
          right:      8,                 // 8px from screen edge
          left:       'auto',
          width:      'min(340px, calc(100vw - 16px))',  // never wider than screen
          maxHeight:  'calc(100vh - 80px)',
          background: '#fff',
          borderRadius: 18,
          boxShadow:  '0 25px 70px rgba(0,0,0,.18)',
          border:     '1px solid #E2E8F0',
          zIndex:     9999,
          animation:  'slideDown .2s ease both',
          display:    'flex',
          flexDirection: 'column',
          overflow:   'hidden',
        }}>

          {/* Header */}
          <div style={{ padding:'.9rem 1.1rem', borderBottom:'1px solid #F1F5F9', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:'.5rem' }}>
              <div style={{ width:28, height:28, borderRadius:8, background:'rgba(201,150,58,.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Megaphone size={13} color="#C9963A" />
              </div>
              <span style={{ fontWeight:700, fontSize:'.88rem', color:'#0B1D3A', fontFamily:"'DM Sans',sans-serif" }}>Announcements</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'.5rem' }}>
              {/* Push notification status pill */}
              {'Notification' in window && (
                <button onClick={enablePush} title={pushStatus==='granted'?'Notifications on':pushStatus==='denied'?'Notifications blocked':pushStatus==='loading'?'Enabling…':'Enable notifications'}
                  style={{ display:'flex', alignItems:'center', gap:'.3rem', padding:'.25rem .6rem', borderRadius:20, border:'none', cursor:pushStatus==='granted'||pushStatus==='denied'?'default':'pointer', fontFamily:"'DM Sans',sans-serif", fontSize:'.65rem', fontWeight:700,
                    background: pushStatus==='granted'?'#DCFCE7':pushStatus==='denied'?'#FEE2E2':'rgba(201,150,58,.12)',
                    color:      pushStatus==='granted'?'#15803D':pushStatus==='denied'?'#DC2626':'#C9963A',
                  }}>
                  {pushStatus==='loading'
                    ? <div style={{ width:10, height:10, borderRadius:'50%', border:'1.5px solid rgba(201,150,58,.3)', borderTopColor:'#C9963A', animation:'spin .7s linear infinite' }} />
                    : pushStatus==='granted' ? <Bell size={10} />
                    : pushStatus==='denied'  ? <BellOff size={10} />
                    : <Bell size={10} />}
                  {pushStatus==='granted'?'On':pushStatus==='denied'?'Blocked':pushStatus==='loading'?'…':'Enable'}
                </button>
              )}
              <button onClick={() => { setOpen(false); setSelected(null); }}
                style={{ width:26, height:26, borderRadius:7, background:'#F1F5F9', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <X size={13} color="#64748B" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div style={{ overflowY:'auto', flex:1 }}>
            {loading ? (
              <div style={{ padding:'2.5rem', textAlign:'center' }}>
                <div style={{ width:28, height:28, borderRadius:'50%', border:'2px solid rgba(201,150,58,.2)', borderTopColor:'#C9963A', animation:'spin .7s linear infinite', margin:'0 auto' }} />
              </div>
            ) : selected ? (
              <div style={{ padding:'1rem' }}>
                <button onClick={() => setSelected(null)}
                  style={{ display:'flex', alignItems:'center', gap:'.35rem', background:'none', border:'none', color:'#C9963A', fontSize:'.78rem', fontWeight:600, cursor:'pointer', marginBottom:'.85rem', fontFamily:"'DM Sans',sans-serif" }}>
                  ← Back
                </button>
                <div style={{ display:'flex', alignItems:'center', gap:'.5rem', marginBottom:'.65rem', flexWrap:'wrap' }}>
                  {(() => { const aud = audienceInfo(selected.targetAudience); return (
                    <span style={{ fontSize:'.65rem', fontWeight:700, padding:'.18rem .55rem', borderRadius:20, background:aud.bg, color:aud.color }}>{aud.label}</span>
                  ); })()}
                  <span style={{ fontSize:'.7rem', color:'#94A3B8', display:'flex', alignItems:'center', gap:'.25rem' }}>
                    <Clock size={10} /> {formatDate(selected.createdAt)} · {formatTime(selected.createdAt)}
                  </span>
                </div>
                <h3 style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:700, color:'#0B1D3A', fontSize:'.92rem', margin:'0 0 .75rem', lineHeight:1.3 }}>{selected.title}</h3>
                <div style={{ background:'#F8FAFC', borderRadius:12, border:'1px solid #F1F5F9', padding:'.9rem 1rem' }}>
                  <p style={{ color:'#334155', fontSize:'.83rem', lineHeight:1.75, margin:0, whiteSpace:'pre-line' }}>{selected.content}</p>
                </div>
              </div>
            ) : announcements.length === 0 ? (
              <div style={{ padding:'2.5rem 1.5rem', textAlign:'center' }}>
                <Bell size={28} color="#E2E8F0" style={{ margin:'0 auto .75rem', display:'block' }} />
                <p style={{ color:'#94A3B8', fontSize:'.83rem', fontFamily:"'DM Sans',sans-serif", margin:0 }}>No announcements yet</p>
              </div>
            ) : (
              <div style={{ padding:'.5rem' }}>
                {announcements.map(a => {
                  const aud     = audienceInfo(a.targetAudience);
                  const preview = a.content.length > 80 ? a.content.slice(0, 80) + '…' : a.content;
                  return (
                    <button key={a.id} onClick={() => setSelected(a)}
                      style={{ width:'100%', textAlign:'left', padding:'.8rem', borderRadius:12, marginBottom:'.4rem', background:'#F8FAFC', border:'1px solid #F1F5F9', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", display:'block' }}
                      onMouseOver={e => (e.currentTarget.style.background='#F0F4FF')}
                      onMouseOut={e  => (e.currentTarget.style.background='#F8FAFC')}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'.5rem', marginBottom:'.35rem' }}>
                        <p style={{ fontWeight:600, fontSize:'.83rem', margin:0, color:'#0F172A', flex:1 }}>{a.title}</p>
                        <span style={{ fontSize:'.6rem', fontWeight:700, padding:'2px 7px', borderRadius:20, background:aud.bg, color:aud.color, flexShrink:0 }}>{aud.label}</span>
                      </div>
                      <p style={{ fontSize:'.75rem', color:'#64748B', margin:'0 0 .4rem', lineHeight:1.5 }}>{preview}</p>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <span style={{ display:'flex', alignItems:'center', gap:3, fontSize:'.68rem', color:'#94A3B8' }}>
                          <Clock size={10} /> {formatDate(a.createdAt)}
                        </span>
                        <span style={{ display:'flex', alignItems:'center', gap:2, fontSize:'.68rem', color:'#C9963A', fontWeight:600 }}>
                          Read <ChevronRight size={11} />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {announcements.length > 0 && !selected && (
            <div style={{ padding:'.65rem 1rem', borderTop:'1px solid #F1F5F9', textAlign:'center', flexShrink:0 }}>
              <p style={{ fontSize:'.72rem', color:'#94A3B8', margin:0 }}>
                {announcements.length} announcement{announcements.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

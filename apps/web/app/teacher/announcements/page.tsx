'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, Clock, Users, User, ChevronRight, X, Megaphone, Calendar } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Announcement {
  id:             string;
  title:          string;
  content:        string;
  targetAudience: string;
  createdAt:      string;
}

export default function TeacherAnnouncementsPage() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [selected,      setSelected]      = useState<Announcement | null>(null);

  const token = () => localStorage.getItem('token') || '';

  useEffect(() => {
    const t = token();
    if (!t) { router.push('/teacher-login'); return; }
    fetch(`${API}/announcements`, { headers: { Authorization: `Bearer ${t}` } })
      .then(r => r.json())
      .then(data => setAnnouncements(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const audienceInfo = (a: string) => {
    if (a === 'parents')  return { label: 'Parents',  bg: '#EFF6FF', color: '#1D4ED8', icon: <User  size={10} /> };
    if (a === 'teachers') return { label: 'Teachers', bg: '#F0FDF4', color: '#15803D', icon: <Users size={10} /> };
    return                       { label: 'Everyone', bg: '#FFFBEB', color: '#92400E', icon: <Users size={10} /> };
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  const formatTime = (d: string) => new Date(d).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ minHeight: '100vh', background: '#F0EFE9', fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        .fade-up { animation:fadeUp .5s ease both; }
        .ann-card { background:#fff;border:1px solid #E2E8F0;border-radius:18px;overflow:hidden;box-shadow:0 2px 10px rgba(11,29,58,.05);cursor:pointer;transition:box-shadow .2s,transform .2s,border-color .2s; }
        .ann-card:hover { box-shadow:0 10px 32px rgba(11,29,58,.12);transform:translateY(-3px);border-color:rgba(26,86,160,.3); }
        .modal-overlay { position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:flex-end;justify-content:center;z-index:50;backdrop-filter:blur(4px); }
        .modal-box { background:#fff;width:100%;max-width:580px;max-height:90vh;overflow-y:auto;border-radius:24px 24px 0 0;animation:slideUp .3s ease both;box-shadow:0 -8px 40px rgba(0,0,0,.2); }
        @media(min-width:640px) { .modal-overlay{align-items:center;padding:1.5rem;} .modal-box{border-radius:24px;animation:fadeUp .3s ease both;} }
        .ann-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.1rem; }
        @media(max-width:400px) { .ann-grid{grid-template-columns:1fr;} }
      `}</style>

      {/* Header */}
      <header style={{ background: '#0B1D3A', borderBottom: '2px solid #C9963A', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ padding: '.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
            <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#C9963A', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.35rem', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: '.85rem' }}>
              <ArrowLeft size={15} /> Back
            </button>
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,.15)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: '#EBF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={14} color="#1A56A0" />
              </div>
              <span style={{ fontFamily: "'Playfair Display',serif", color: '#fff', fontWeight: 700, fontSize: '.9rem' }}>
                Announcements
              </span>
            </div>
          </div>
          {announcements.length > 0 && (
            <span style={{ background: 'rgba(201,150,58,.15)', color: '#C9963A', fontSize: '.72rem', fontWeight: 700, padding: '.25rem .7rem', borderRadius: 20, border: '1px solid rgba(201,150,58,.3)' }}>
              {announcements.length} total
            </span>
          )}
        </div>
      </header>

      {/* Hero */}
      <div style={{ background: '#0B1D3A', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle,rgba(201,150,58,.13) 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
        <div style={{ position: 'relative', padding: '1.75rem 1.25rem .75rem' }}>
          <p style={{ color: '#94A3B8', fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '.3rem' }}>From School Admin</p>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, color: '#fff', margin: '0 0 .4rem' }}>
            School <span style={{ color: '#C9963A' }}>Announcements</span>
          </h1>
          <p style={{ color: '#64748B', fontSize: '.83rem', margin: 0 }}>Stay up to date with the latest updates from your school</p>
        </div>
        <div style={{ height: 20, background: 'linear-gradient(to bottom,transparent,#F0EFE9)' }} />
      </div>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '1.5rem 1.1rem 3rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(201,150,58,.2)', borderTopColor: '#C9963A', animation: 'spin .8s linear infinite', margin: '0 auto 1rem' }} />
            <p style={{ color: '#94A3B8', fontSize: '.88rem' }}>Loading announcements…</p>
          </div>
        ) : announcements.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: 18, border: '1px solid #E2E8F0' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: '#EBF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Bell size={24} color="#1A56A0" />
            </div>
            <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '1rem', marginBottom: '.4rem' }}>No announcements yet</p>
            <p style={{ color: '#94A3B8', fontSize: '.88rem' }}>Check back later for updates from your school admin</p>
          </div>
        ) : (
          <div className="ann-grid">
            {announcements.map((a, i) => {
              const aud     = audienceInfo(a.targetAudience);
              const preview = a.content.length > 100 ? a.content.slice(0, 100) + '…' : a.content;
              return (
                <div key={a.id} className="ann-card fade-up" style={{ animationDelay: `${i * .04}s` }} onClick={() => setSelected(a)}>
                  <div style={{ height: 4, background: 'linear-gradient(90deg,#1A56A0,#3B82F6)' }} />
                  <div style={{ padding: '1.1rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.5rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem', background: aud.bg, color: aud.color, fontSize: '.67rem', fontWeight: 700, padding: '.18rem .6rem', borderRadius: 20 }}>
                        {aud.icon} {aud.label}
                      </span>
                      <span style={{ color: '#94A3B8', fontSize: '.7rem', display: 'flex', alignItems: 'center', gap: '.25rem' }}>
                        <Calendar size={10} /> {formatDate(a.createdAt)}
                      </span>
                    </div>
                    <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '.95rem', margin: 0, lineHeight: 1.3, wordBreak: 'break-word' }}>
                      {a.title}
                    </h3>
                    <p style={{ color: '#64748B', fontSize: '.82rem', lineHeight: 1.6, margin: 0, wordBreak: 'break-word' }}>
                      {preview}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.25rem', color: '#1A56A0', fontSize: '.78rem', fontWeight: 700 }}>
                      Read more <ChevronRight size={13} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="modal-box">
            <div style={{ height: 5, background: 'linear-gradient(90deg,#1A56A0,#3B82F6)', borderRadius: '24px 24px 0 0' }} />
            <div style={{ padding: '1.25rem 1.4rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.6rem', flexWrap: 'wrap' }}>
                  {(() => { const aud = audienceInfo(selected.targetAudience); return (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem', background: aud.bg, color: aud.color, fontSize: '.68rem', fontWeight: 700, padding: '.2rem .65rem', borderRadius: 20 }}>
                      {aud.icon} {aud.label}
                    </span>
                  ); })()}
                  <span style={{ color: '#94A3B8', fontSize: '.72rem', display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                    <Clock size={11} /> {formatDate(selected.createdAt)} at {formatTime(selected.createdAt)}
                  </span>
                </div>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, color: '#0B1D3A', fontSize: '1.1rem', margin: 0, lineHeight: 1.3, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                  {selected.title}
                </h2>
              </div>
              <button onClick={() => setSelected(null)} style={{ width: 32, height: 32, borderRadius: 9, background: '#F1F5F9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <X size={15} color="#64748B" />
              </button>
            </div>
            <div style={{ padding: '1.4rem' }}>
              <div style={{ background: '#FAFAF8', borderRadius: 14, border: '1px solid #F1F5F9', padding: '1.1rem 1.25rem', overflow: 'hidden' }}>
                <p style={{ color: '#334155', fontSize: '.9rem', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                  {selected.content}
                </p>
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '.5rem', background: '#EBF4FF', border: '1px solid rgba(26,86,160,.2)', borderRadius: 11, padding: '.65rem .9rem' }}>
                <Megaphone size={13} color="#1A56A0" />
                <p style={{ color: '#1A56A0', fontSize: '.75rem', fontWeight: 600, margin: 0 }}>Posted by School Admin</p>
              </div>
              <button onClick={() => setSelected(null)} style={{ width: '100%', marginTop: '1rem', padding: '.85rem', border: 'none', borderRadius: 12, background: '#0B1D3A', color: '#fff', fontFamily: "'DM Sans',sans-serif", fontSize: '.9rem', fontWeight: 700, cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
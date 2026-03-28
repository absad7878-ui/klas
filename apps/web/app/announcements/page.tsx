'use client';

import { useEffect, useState } from 'react';
import { Bell, Clock, Users, User, ArrowLeft, Megaphone, X, ChevronRight, Calendar } from 'lucide-react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Announcement {
  id:             string;
  title:          string;
  content:        string;
  targetAudience: string;
  createdAt:      string;
}

export default function AnnouncementsPublicPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading]             = useState(true);
  const [schoolName, setSchoolName]       = useState('Your School');
  const [selected, setSelected]           = useState<Announcement | null>(null);
  const [page, setPage]                   = useState(1);
  const PER_PAGE = 6;

  useEffect(() => {
    const hostname  = window.location.hostname;
    const parts     = hostname.split('.');
    const subdomain = parts.length >= 3 ? parts[0] : null;
    if (!subdomain) { setLoading(false); return; }

    fetch(`${API}/public/announcements?subdomain=${subdomain}`)
      .then(r => r.json())
      .then(data => {
        setAnnouncements(data.announcements || []);
        setSchoolName(data.schoolName || 'Your School');
      })
      .catch(() => setAnnouncements([]))
      .finally(() => setLoading(false));
  }, []);

  const audienceInfo = (a: string) => {
    if (a === 'parents')  return { label: 'Parents',  bg: '#EFF6FF', color: '#1D4ED8', icon: <User  size={10} /> };
    if (a === 'teachers') return { label: 'Teachers', bg: '#F0FDF4', color: '#15803D', icon: <Users size={10} /> };
    return                       { label: 'Everyone', bg: '#FFFBEB', color: '#92400E', icon: <Users size={10} /> };
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  const formatTime = (d: string) => new Date(d).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });

  const paginated  = announcements.slice(0, page * PER_PAGE);
  const hasMore    = announcements.length > page * PER_PAGE;

  return (
    <div style={{ minHeight: '100vh', width: '100%', overflowX: 'hidden', fontFamily: "'DM Sans',sans-serif", background: '#F0EFE9', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp   { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin      { to{transform:rotate(360deg)} }
        .fade-up   { animation: fadeUp .5s ease both; }
        .fade-up-1 { animation: fadeUp .5s .08s ease both; }
        .dot-grid  { background-image:radial-gradient(circle,rgba(201,150,58,.13) 1px,transparent 1px);background-size:28px 28px; }
        .ann-card {
          background:#fff;border:1px solid #E2E8F0;border-radius:18px;
          box-shadow:0 2px 10px rgba(11,29,58,.05);
          cursor:pointer;transition:box-shadow .2s,transform .2s,border-color .2s;
          overflow:hidden;display:flex;flex-direction:column;
            word-break: break-word;
         overflow-wrap: anywhere;
          min-width: 0;
        }
        .ann-card:hover { box-shadow:0 10px 32px rgba(11,29,58,.12);transform:translateY(-3px);border-color:rgba(201,150,58,.35); }
        .modal-overlay { position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:flex-end;justify-content:center;z-index:50;padding:0;backdrop-filter:blur(4px); }
        @media(min-width:640px) { .modal-overlay { align-items:center;padding:1.5rem; } }
        .modal-box { background:#fff;width:100%;max-width:580px;max-height:90vh;overflow-y:auto;border-radius:24px 24px 0 0;animation:slideUp .3s ease both;box-shadow:0 -8px 40px rgba(0,0,0,.2); }
        @media(min-width:640px) { .modal-box { border-radius:24px;animation:fadeUp .3s ease both; } }
        .load-more-btn { display:flex;align-items:center;justify-content:center;gap:.5rem;width:100%;padding:.9rem;border-radius:13px;border:2px solid #E2E8F0;background:#fff;font-family:'DM Sans',sans-serif;font-size:.88rem;font-weight:700;color:#64748B;cursor:pointer;transition:border-color .2s,color .2s,background .2s; }
        .load-more-btn:hover { border-color:#C9963A;color:#C9963A;background:#FFFBEB; }
        .ann-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.1rem; }
        @media(max-width:400px) { .ann-grid { grid-template-columns:1fr; } }
      `}</style>

      {/* Header */}
      <header style={{ background: '#0B1D3A', borderBottom: '2px solid rgba(201,150,58,.5)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#C9963A,#E8B85A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={14} color="#0B1D3A" />
            </div>
            <div>
              <p style={{ fontFamily: "'Playfair Display',serif", color: '#fff', fontWeight: 700, fontSize: '.88rem', margin: 0 }}>Announcements</p>
              <p style={{ color: '#C9963A', fontSize: '.65rem', margin: 0, fontWeight: 500 }}>{schoolName}</p>
            </div>
          </div>
          <Link href="/parent/view" style={{ display: 'flex', alignItems: 'center', gap: '.35rem', color: '#94A3B8', fontSize: '.78rem', fontWeight: 600, textDecoration: 'none' }}>
            <ArrowLeft size={13} /> Portal
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="dot-grid fade-up" style={{ background: '#0B1D3A', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,150,58,.15) 0%,transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 820, margin: '0 auto', padding: '2rem 1.25rem .75rem', textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: 15, background: 'rgba(201,150,58,.15)', border: '1px solid rgba(201,150,58,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto .75rem' }}>
            <Megaphone size={22} color="#C9963A" />
          </div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.4rem,4vw,2rem)', fontWeight: 800, color: '#fff', lineHeight: 1.15, margin: '0 0 .35rem' }}>
            School Announcements
          </h1>
          <p style={{ color: '#64748B', fontSize: '.82rem', margin: 0 }}>
            {announcements.length > 0 ? `${announcements.length} announcement${announcements.length !== 1 ? 's' : ''}` : 'Stay up to date'}
          </p>
        </div>
        <div style={{ height: 20, background: 'linear-gradient(to bottom,transparent,#F0EFE9)' }} />
      </div>

      {/* Content */}
      <main className="fade-up-1" style={{ flex: 1, maxWidth: 820, margin: '0 auto', width: '100%', padding: '1.5rem 1.1rem 3rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(201,150,58,.2)', borderTopColor: '#C9963A', animation: 'spin .8s linear infinite', margin: '0 auto 1rem' }} />
            <p style={{ color: '#94A3B8', fontSize: '.88rem' }}>Loading announcements…</p>
          </div>
        ) : announcements.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: 18, border: '1px solid #E2E8F0' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Bell size={24} color="#C9963A" />
            </div>
            <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '1rem', marginBottom: '.4rem' }}>No announcements yet</p>
            <p style={{ color: '#94A3B8', fontSize: '.84rem' }}>Check back later for updates from your school</p>
          </div>
        ) : (
          <>
            <div className="ann-grid">
              {paginated.map((a, i) => {
                const aud     = audienceInfo(a.targetAudience);
                const preview = a.content.length > 100 ? a.content.slice(0, 100) + '…' : a.content;
                return (
                  <div key={a.id} className="ann-card fade-up" style={{ animationDelay: `${i * .04}s`,  minWidth: 0, }} onClick={() => setSelected(a)}>

                    {/* Top accent bar */}
                    <div style={{ height: 4, background: 'linear-gradient(90deg,#C9963A,#E8B85A)' }} />

                    <div style={{ padding: '1.1rem 1.2rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '.65rem' }}>

                      {/* Audience + date */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.5rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem', background: aud.bg, color: aud.color, fontSize: '.67rem', fontWeight: 700, padding: '.18rem .6rem', borderRadius: 20 }}>
                          {aud.icon} {aud.label}
                        </span>
                        <span style={{ color: '#94A3B8', fontSize: '.7rem', display: 'flex', alignItems: 'center', gap: '.25rem' }}>
                          <Calendar size={10} /> {formatDate(a.createdAt)}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '.95rem', margin: 0, lineHeight: 1.3, overflowWrap: 'anywhere', wordBreak: 'break-word', }}>{a.title}</h3>

                      {/* Preview */}
                      <p style={{ color: '#64748B', fontSize: '.82rem', lineHeight: 1.6, margin: 0, flex: 1 }}>{preview}</p>

                      {/* Read more */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.25rem', color: '#C9963A', fontSize: '.78rem', fontWeight: 700, marginTop: '.25rem' }}>
                        Read more <ChevronRight size={13} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load more */}
            {hasMore && (
              <div style={{ marginTop: '1.5rem' }}>
                <button onClick={() => setPage(p => p + 1)} className="load-more-btn">
                  Load more announcements ({announcements.length - page * PER_PAGE} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <footer style={{ background: '#0B1D3A', borderTop: '1px solid rgba(201,150,58,.15)', padding: '1rem 1.25rem' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.5rem' }}>
          <p style={{ color: '#475569', fontSize: '.72rem', margin: 0 }}>{schoolName}</p>
          <p style={{ color: '#475569', fontSize: '.72rem', margin: 0 }}>Powered by <span style={{ color: '#C9963A', fontWeight: 600 }}>School Platform Africa</span></p>
        </div>
      </footer>

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="modal-box">

            {/* Modal top accent */}
            <div style={{ height: 5, background: 'linear-gradient(90deg,#C9963A,#E8B85A)', borderRadius: '24px 24px 0 0' }} />

            {/* Modal header */}
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
                <h2 style={{ 
  fontFamily: "'Playfair Display',serif", 
  fontWeight: 800, 
  color: '#0B1D3A', 
  fontSize: '1.1rem', 
  margin: 0, 
  lineHeight: 1.3,
  wordBreak: 'break-word',
  overflowWrap: 'anywhere',
}}>
  {selected.title}
</h2>
              </div>
              <button onClick={() => setSelected(null)}
                style={{ width: 32, height: 32, borderRadius: 9, background: '#F1F5F9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <X size={15} color="#64748B" />
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding: '1.4rem' }}>
              <div style={{ background: '#FAFAF8', borderRadius: 14, border: '1px solid #F1F5F9', padding: '1.1rem 1.25rem', overflow: 'hidden', wordBreak: 'break-word' }}>
                <p style={{ 
  color: '#334155', 
  fontSize: '.9rem', 
  lineHeight: 1.8, 
  margin: 0, 
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  overflowWrap: 'anywhere',
}}>
  {selected.content}
</p>
              </div>

              <div style={{ marginTop: '1.1rem', display: 'flex', alignItems: 'center', gap: '.5rem', background: '#FFFBEB', border: '1px solid rgba(201,150,58,.25)', borderRadius: 11, padding: '.65rem .9rem' }}>
                <Megaphone size={13} color="#C9963A" />
                <p style={{ color: '#92400E', fontSize: '.75rem', fontWeight: 600, margin: 0 }}>{schoolName}</p>
              </div>

              <button onClick={() => setSelected(null)}
                style={{ width: '100%', marginTop: '1rem', padding: '.85rem', border: 'none', borderRadius: 12, background: '#0B1D3A', color: '#fff', fontFamily: "'DM Sans',sans-serif", fontSize: '.9rem', fontWeight: 700, cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

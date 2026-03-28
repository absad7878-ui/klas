'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Users, ChevronRight, LogOut, School, Search } from 'lucide-react';

export default function SelectClassPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/teacher-login'); return; }

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/classes`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load classes');
        return res.json();
      })
      .then(data => { setClasses(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/teacher-login');
  };

  const filtered = classes.filter(c =>
    c.name?.toLowerCase().includes(query.toLowerCase())
  );

  // Assign a consistent accent colour per class card
  const ACCENTS = [
    { iconColor:'#1A56A0', iconBg:'#EBF4FF', accent:'#1A56A0' },
    { iconColor:'#059669', iconBg:'#E6FFEE', accent:'#059669' },
    { iconColor:'#7C3AED', iconBg:'#F3E8FF', accent:'#7C3AED' },
    { iconColor:'#B45309', iconBg:'#FFFBEB', accent:'#B45309' },
    { iconColor:'#0E7490', iconBg:'#ECFEFF', accent:'#0E7490' },
    { iconColor:'#9D174D', iconBg:'#FCE7F3', accent:'#9D174D' },
  ];

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background:'#0B1D3A' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap');
          @keyframes spin  { to{transform:rotate(360deg)} }
          @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
        `}</style>
        <div className="text-center">
          <div style={{ width:52, height:52, borderRadius:'50%', border:'3px solid rgba(201,150,58,.15)', borderTopColor:'#C9963A', animation:'spin .8s linear infinite', margin:'0 auto 1.25rem' }} />
          <p style={{ color:'#94A3B8', fontFamily:"'DM Sans',sans-serif", fontSize:'.9rem', animation:'pulse 1.8s ease infinite' }}>Loading your classes…</p>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background:'#F0EFE9', fontFamily:"'DM Sans',sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');`}</style>
        <div style={{ background:'#fff', borderRadius:24, padding:'2.5rem', maxWidth:400, width:'100%', textAlign:'center', boxShadow:'0 4px 28px rgba(11,29,58,.1)', border:'1px solid #FECDD3' }}>
          <div style={{ width:56, height:56, borderRadius:'50%', background:'#FFF1F2', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem', fontSize:26 }}>⚠️</div>
          <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, color:'#0B1D3A', fontSize:'1.2rem', marginBottom:'.5rem' }}>Could Not Load Classes</p>
          <p style={{ color:'#94A3B8', fontSize:'.85rem', marginBottom:'1.5rem' }}>{error}</p>
          <button onClick={() => router.push('/teacher-login')} style={{ background:'#0B1D3A', color:'#fff', border:'none', borderRadius:12, padding:'.75rem 2rem', fontFamily:"'DM Sans',sans-serif", fontWeight:600, cursor:'pointer' }}>Back to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily:"'DM Sans',sans-serif", background:'#F0EFE9' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        @keyframes fadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }

        .fade-up   { animation: fadeUp .5s ease both; }
        .fade-up-1 { animation: fadeUp .5s .08s ease both; }
        .fade-up-2 { animation: fadeUp .5s .16s ease both; }

        /* stagger cards */
        ${Array.from({length:12},(_,i)=>`.card-${i}{animation:fadeUp .5s ${.2+i*.06}s ease both;}`).join('')}

        .gold-shimmer {
          background:linear-gradient(90deg,#C9963A 0%,#F0C060 40%,#C9963A 60%,#E8B85A 100%);
          background-size:200% auto;
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;
          background-clip:text;animation:shimmer 4s linear infinite;
        }
        .hero-dot-grid {
          background-image:radial-gradient(circle,rgba(201,150,58,.13) 1px,transparent 1px);
          background-size:28px 28px;
        }

        .logout-btn {
          display:inline-flex;align-items:center;gap:.45rem;
          background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.13);
          color:#94A3B8;padding:.5rem 1rem;border-radius:10px;
          font-size:.83rem;font-weight:500;cursor:pointer;
          transition:background .2s,color .2s,border-color .2s;
          font-family:'DM Sans',sans-serif;
        }
        .logout-btn:hover { background:rgba(239,68,68,.12);border-color:rgba(239,68,68,.35);color:#FCA5A5; }

        .search-wrap { position:relative; }
        .search-icon { position:absolute;left:1rem;top:50%;transform:translateY(-50%);color:#94A3B8;pointer-events:none; }
        .search-input {
          width:100%;padding:.8rem 1rem .8rem 2.75rem;
          border:1.5px solid #E2E8F0;border-radius:14px;
          font-family:'DM Sans',sans-serif;font-size:.88rem;color:#0B1D3A;
          background:#fff;outline:none;box-sizing:border-box;
          transition:border-color .2s,box-shadow .2s;
        }
        .search-input::placeholder{color:#CBD5E1;}
        .search-input:focus{border-color:#C9963A;box-shadow:0 0 0 3px rgba(201,150,58,.12);}

        .gold-divider{height:1px;background:linear-gradient(90deg,transparent,rgba(201,150,58,.3),transparent);}

        /* Class cards */
        .class-card {
          background:#fff;border:1px solid #E2E8F0;border-radius:22px;
          padding:1.75rem;display:flex;flex-direction:column;
          text-decoration:none;
          box-shadow:0 2px 14px rgba(11,29,58,.06);
          position:relative;overflow:hidden;
          transition:box-shadow .22s,transform .22s,border-color .22s;
        }
        .class-card::before {
          content:'';position:absolute;top:0;left:0;right:0;height:4px;
          background:var(--accent);transform:scaleX(0);transform-origin:left;
          transition:transform .25s ease;
        }
        .class-card::after {
          content:'';position:absolute;inset:0;
          background:radial-gradient(circle at 85% 15%,var(--accent-soft) 0%,transparent 55%);
          opacity:0;transition:opacity .3s;pointer-events:none;
        }
        .class-card:hover{box-shadow:0 14px 38px rgba(11,29,58,.13);transform:translateY(-4px);border-color:#CBD5E1;}
        .class-card:hover::before{transform:scaleX(1);}
        .class-card:hover::after{opacity:1;}

        /* Empty state */
        .empty-card{
          background:#fff;border:2px dashed #E2E8F0;border-radius:24px;
          padding:4rem 2rem;text-align:center;
        }
      `}</style>

      {/* ══════════════ HEADER ══════════════ */}
      <header className="sticky top-0 z-20 fade-up"
        style={{ background:'#0B1D3A', borderBottom:'2px solid rgba(201,150,58,.5)' }}>
        <div style={{ padding:'.85rem 2rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'.75rem' }}>
            <div style={{ width:34, height:34, borderRadius:10, flexShrink:0, background:'linear-gradient(135deg,#C9963A,#E8B85A)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <School size={16} color="#0B1D3A" />
            </div>
            <p style={{ fontFamily:"'Playfair Display',serif", color:'#fff', fontWeight:700, fontSize:'.9rem' }}>
              Teacher Portal
            </p>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* ══════════════ HERO ══════════════ */}
      <div className="relative overflow-hidden fade-up-1" style={{ background:'#0B1D3A' }}>
        <div className="absolute inset-0 hero-dot-grid" />
        <div className="absolute" style={{ top:-80, right:-40, width:320, height:320, borderRadius:'50%', pointerEvents:'none', background:'radial-gradient(circle,rgba(201,150,58,.13) 0%,transparent 65%)' }} />
        <div className="absolute" style={{ bottom:-60, left:-30, width:220, height:220, borderRadius:'50%', pointerEvents:'none', background:'radial-gradient(circle,rgba(26,86,160,.2) 0%,transparent 65%)' }} />

        <div className="relative" style={{ padding:'2.5rem 2rem 1rem' }}>
          <p style={{ color:'#64748B', fontSize:'.72rem', textTransform:'uppercase', letterSpacing:'.1em', fontWeight:500, marginBottom:'.5rem' }}>
            Teacher Portal
          </p>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(1.7rem,3.5vw,2.5rem)', fontWeight:800, color:'#fff', lineHeight:1.15 }}>
            Choose a <span className="gold-shimmer">Class</span>
          </h1>
          <p style={{ color:'#64748B', fontSize:'.88rem', marginTop:'.5rem' }}>
            Select a class to take attendance, enter scores, or view students.
          </p>

          {/* Stats strip */}
          <div style={{ display:'flex', alignItems:'center', gap:'.75rem', marginTop:'1.5rem', flexWrap:'wrap' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'.5rem', padding:'.45rem 1rem', borderRadius:20, background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', fontSize:'.78rem', fontWeight:500, color:'#94A3B8' }}>
              <BookOpen size={13} />
              <span style={{ color:'#fff', fontWeight:700 }}>{classes.length}</span> class{classes.length !== 1 ? 'es' : ''}
            </div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'.5rem', padding:'.45rem 1rem', borderRadius:20, background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', fontSize:'.78rem', fontWeight:500, color:'#94A3B8' }}>
              <Users size={13} />
              <span style={{ color:'#fff', fontWeight:700 }}>
                {classes.reduce((a, c) => a + (c.studentCount || 0), 0)}
              </span> total students
            </div>
          </div>
        </div>

        <div style={{ height:28, background:'linear-gradient(to bottom,transparent,#F0EFE9)' }} />
      </div>

      {/* ══════════════ MAIN ══════════════ */}
      <main className="fade-up-2" style={{ flex:1, padding:'2rem 2rem 3rem' }}>

        {/* Search + count */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem', marginBottom:'1.75rem', flexWrap:'wrap' }}>
          <div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontWeight:800, fontSize:'1.15rem', color:'#0B1D3A' }}>
              Your Classes
            </h2>
            <p style={{ color:'#94A3B8', fontSize:'.78rem', marginTop:'.2rem' }}>
              {filtered.length} of {classes.length} class{classes.length !== 1 ? 'es' : ''} shown
            </p>
          </div>
          <div className="search-wrap" style={{ width:260 }}>
            <Search size={15} className="search-icon" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search classes…"
              className="search-input"
            />
          </div>
        </div>

        <div className="gold-divider" style={{ marginBottom:'2rem' }} />

        {/* Empty state */}
        {classes.length === 0 ? (
          <div className="empty-card">
            <div style={{ width:64, height:64, borderRadius:18, background:'#EBF4FF', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.25rem' }}>
              <BookOpen size={28} color="#1A56A0" />
            </div>
            <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, color:'#0B1D3A', fontSize:'1.15rem', marginBottom:'.5rem' }}>No Classes Yet</p>
            <p style={{ color:'#94A3B8', fontSize:'.85rem' }}>Contact your school admin to add classes to your account.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-card">
            <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, color:'#0B1D3A', fontSize:'1.1rem', marginBottom:'.4rem' }}>No results for "{query}"</p>
            <p style={{ color:'#94A3B8', fontSize:'.83rem' }}>Try a different search term.</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'1.5rem' }}>
            {filtered.map((cls, i) => {
              const { iconColor, iconBg, accent } = ACCENTS[i % ACCENTS.length];
              return (
                <Link
                  key={cls.id}
                  href={`/teacher/class/${cls.id}`}
                  className={`class-card card-${Math.min(i,11)}`}
                  style={{ '--accent': accent, '--accent-soft': iconBg } as React.CSSProperties}
                >
                  {/* Icon */}
                  <div style={{ width:52, height:52, borderRadius:15, background:iconBg, border:`1px solid ${iconColor}20`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'1.25rem', flexShrink:0 }}>
                    <BookOpen size={24} color={iconColor} />
                  </div>

                  {/* Name */}
                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontWeight:800, color:'#0B1D3A', fontSize:'1.05rem', marginBottom:'.4rem', lineHeight:1.2 }}>
                    {cls.name}
                  </h3>

                  {/* Student count */}
                  <div style={{ display:'flex', alignItems:'center', gap:'.4rem', marginBottom:'1.25rem' }}>
                    <Users size={13} color="#94A3B8" />
                    <p style={{ color:'#94A3B8', fontSize:'.8rem' }}>
                      {cls.studentCount || 0} student{cls.studentCount !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Optional: subject / grade */}
                  {(cls.subject || cls.grade) && (
                    <div style={{ display:'flex', gap:'.5rem', flexWrap:'wrap', marginBottom:'1rem' }}>
                      {cls.subject && (
                        <span style={{ background:iconBg, color:iconColor, fontSize:'.7rem', fontWeight:600, padding:'.2rem .65rem', borderRadius:20 }}>
                          {cls.subject}
                        </span>
                      )}
                      {cls.grade && (
                        <span style={{ background:'#F1F5F9', color:'#64748B', fontSize:'.7rem', fontWeight:600, padding:'.2rem .65rem', borderRadius:20 }}>
                          {cls.grade}
                        </span>
                      )}
                    </div>
                  )}

                  {/* CTA */}
                  <div style={{ display:'flex', alignItems:'center', gap:'.3rem', marginTop:'auto', color:accent, fontSize:'.8rem', fontWeight:700 }}>
                    Open class <ChevronRight size={14} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer style={{ background:'#0B1D3A', borderTop:'1px solid rgba(201,150,58,.15)', padding:'1.1rem 2rem' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'.5rem' }}>
          <p style={{ color:'#475569', fontSize:'.75rem' }}>
            {classes.length} class{classes.length !== 1 ? 'es' : ''} available
          </p>
          <p style={{ color:'#475569', fontSize:'.75rem' }}>
            Powered by <span style={{ color:'#C9963A', fontWeight:600 }}>Klas School Management Platform</span>
          </p>
        </div>
      </footer>

    </div>
  );
}

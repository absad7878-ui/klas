'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { CalendarDays, BookOpen, Users, ArrowLeft, School, ChevronRight } from 'lucide-react';

export default function ClassActionsPage() {
  const router = useRouter();
  const { id } = useParams();
  const [classData, setClassData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/classes/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch class');
        return res.json();
      })
      .then(data => { setClassData(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [router, id]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B1D3A' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap');
          @keyframes spin  { to{transform:rotate(360deg)} }
          @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
        `}</style>
        <div className="text-center">
          <div style={{ width: 52, height: 52, borderRadius: '50%', border: '3px solid rgba(201,150,58,.15)', borderTopColor: '#C9963A', animation: 'spin .8s linear infinite', margin: '0 auto 1.25rem' }} />
          <p style={{ color: '#94A3B8', fontFamily: "'DM Sans', sans-serif", fontSize: '.9rem', animation: 'pulse 1.8s ease infinite' }}>Loading class…</p>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !classData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#F0EFE9', fontFamily: "'DM Sans', sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');`}</style>
        <div style={{ background: '#fff', borderRadius: 24, padding: '2.5rem', maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: '0 4px 28px rgba(11,29,58,.1)', border: '1px solid #FECDD3' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: 26 }}>⚠️</div>
          <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: '#0B1D3A', fontSize: '1.2rem', marginBottom: '.5rem' }}>Class Not Found</p>
          <p style={{ color: '#94A3B8', fontSize: '.85rem', marginBottom: '1.5rem' }}>{error || 'This class could not be loaded.'}</p>
          <button onClick={() => router.back()} style={{ background: '#0B1D3A', color: '#fff', border: 'none', borderRadius: 12, padding: '.75rem 2rem', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: 'pointer' }}>Go Back</button>
        </div>
      </div>
    );
  }

  const actions = [
    {
      href:      `/teacher/attendance/${id}`,
      icon:      CalendarDays,
      label:     'Take Attendance',
      desc:      'Mark present, absent, or late for today\'s session.',
      iconColor: '#B45309',
      iconBg:    '#FFFBEB',
      accent:    '#B45309',
      tag:       'Daily',
      tagBg:     '#FEF3C7',
      tagColor:  '#92400E',
    },
    // {
    //   href:      `/teacher/scores/${id}`,
    //   icon:      BookOpen,
    //   label:     'Enter Scores',
    //   desc:      'Input test, assignment, and exam results for students.',
    //   iconColor: '#059669',
    //   iconBg:    '#E6FFEE',
    //   accent:    '#059669',
    //   tag:       'Grades',
    //   tagBg:     '#D1FAE5',
    //   tagColor:  '#065F46',
    // },
    // {
    //   href:      `/teacher/students/${id}`,
    //   icon:      Users,
    //   label:     'View Students',
    //   desc:      'Browse the full student list enrolled in this class.',
    //   iconColor: '#1A56A0',
    //   iconBg:    '#EBF4FF',
    //   accent:    '#1A56A0',
    //   tag:       'Roster',
    //   tagBg:     '#DBEAFE',
    //   tagColor:  '#1e40af',
    // },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif", background: '#F0EFE9' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        @keyframes fadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }

        .fade-up   { animation: fadeUp .5s ease both; }
        .fade-up-1 { animation: fadeUp .5s .08s ease both; }
        .fade-up-2 { animation: fadeUp .5s .16s ease both; }
        .card-0    { animation: fadeUp .5s .22s ease both; }
        .card-1    { animation: fadeUp .5s .32s ease both; }
        .card-2    { animation: fadeUp .5s .42s ease both; }

        .gold-shimmer {
          background: linear-gradient(90deg, #C9963A 0%, #F0C060 40%, #C9963A 60%, #E8B85A 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        .hero-dot-grid {
          background-image: radial-gradient(circle, rgba(201,150,58,.13) 1px, transparent 1px);
          background-size: 28px 28px;
        }

        .back-btn {
          display: inline-flex; align-items: center; gap: .4rem;
          color: #C9963A; font-size: .82rem; font-weight: 500;
          background: none; border: none; cursor: pointer;
          padding: .4rem .75rem; border-radius: 8px;
          transition: background .2s; font-family: 'DM Sans', sans-serif;
        }
        .back-btn:hover { background: rgba(201,150,58,.1); }

        .gold-divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(201,150,58,.3), transparent); }

        /* Action cards */
        .action-card {
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 22px;
          padding: 2.25rem 2rem;
          display: flex;
          flex-direction: column;
          text-decoration: none;
          box-shadow: 0 2px 16px rgba(11,29,58,.06);
          position: relative;
          overflow: hidden;
          transition: box-shadow .25s, transform .25s, border-color .25s;
        }
        .action-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0;
          height: 4px;
          background: var(--accent);
          transform: scaleX(0); transform-origin: left;
          transition: transform .28s ease;
        }
        .action-card::after {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(circle at 85% 15%, var(--accent-soft) 0%, transparent 55%);
          opacity: 0;
          transition: opacity .3s;
          pointer-events: none;
        }
        .action-card:hover {
          box-shadow: 0 16px 40px rgba(11,29,58,.14);
          transform: translateY(-5px);
          border-color: #CBD5E1;
        }
        .action-card:hover::before { transform: scaleX(1); }
        .action-card:hover::after  { opacity: 1; }

        /* Stats bar at bottom of hero */
        .stat-pill {
          display: inline-flex; align-items: center; gap: .5rem;
          padding: .45rem 1rem; border-radius: 20px;
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.1);
          font-size: .78rem; font-weight: 500; color: #94A3B8;
        }
        .stat-pill span { color: #fff; font-weight: 700; }
      `}</style>

      {/* ══════════════ HEADER ══════════════ */}
      <header className="sticky top-0 z-20 fade-up"
        style={{ background: '#0B1D3A', borderBottom: '2px solid rgba(201,150,58,.5)' }}>
        <div style={{ padding: '.85rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: 'linear-gradient(135deg, #C9963A, #E8B85A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <School size={16} color="#0B1D3A" />
            </div>
            <p style={{ fontFamily: "'Playfair Display', serif", color: '#fff', fontWeight: 700, fontSize: '.9rem' }}>
              {classData.name}
            </p>
          </div>
          <button className="back-btn" onClick={() => router.back()}>
            <ArrowLeft size={14} /> Back
          </button>
        </div>
      </header>

      {/* ══════════════ HERO ══════════════ */}
      <div className="relative overflow-hidden fade-up-1" style={{ background: '#0B1D3A' }}>
        <div className="absolute inset-0 hero-dot-grid" />
        <div className="absolute" style={{ top: -80, right: -40, width: 340, height: 340, borderRadius: '50%', pointerEvents: 'none', background: 'radial-gradient(circle, rgba(201,150,58,.13) 0%, transparent 65%)' }} />
        <div className="absolute" style={{ bottom: -60, left: -30, width: 220, height: 220, borderRadius: '50%', pointerEvents: 'none', background: 'radial-gradient(circle, rgba(26,86,160,.2) 0%, transparent 65%)' }} />

        <div className="relative" style={{ padding: '2.5rem 2rem 1rem' }}>
          <p style={{ color: '#64748B', fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 500, marginBottom: '.5rem' }}>
            Teacher Portal · Class Management
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 800, color: '#fff', lineHeight: 1.15 }}>
            <span className="gold-shimmer">{classData.name}</span>
          </h1>
          <p style={{ color: '#64748B', fontSize: '.88rem', marginTop: '.5rem' }}>
            Choose an action to manage your class below.
          </p>

          {/* Stat pills */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '.75rem', marginTop: '1.5rem' }}>
            {classData.studentCount != null && (
              <div className="stat-pill">
                <Users size={13} />
                <span>{classData.studentCount}</span> students
              </div>
            )}
            {classData.subject && (
              <div className="stat-pill">
                <BookOpen size={13} />
                <span>{classData.subject}</span>
              </div>
            )}
            <div className="stat-pill">
              <CalendarDays size={13} />
              <span>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        <div style={{ height: 28, background: 'linear-gradient(to bottom, transparent, #F0EFE9)' }} />
      </div>

      {/* ══════════════ ACTIONS GRID ══════════════ */}
      <main className="fade-up-2" style={{ flex: 1, padding: '2.5rem 2rem 3.5rem' }}>

        <div style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: '1.2rem', color: '#0B1D3A' }}>
            Class Actions
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '.8rem', marginTop: '.25rem' }}>
            Select what you'd like to do for <strong style={{ color: '#0B1D3A' }}>{classData.name}</strong> today
          </p>
        </div>

        <div className="gold-divider" style={{ marginBottom: '2rem' }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem' }}>
          {actions.map(({ href, icon: Icon, label, desc, iconColor, iconBg, accent, tag, tagBg, tagColor }, i) => (
            <Link
              key={href}
              href={href}
              className={`action-card card-${i}`}
              style={{ '--accent': accent, '--accent-soft': `${iconBg}` } as React.CSSProperties}
            >
              {/* Tag */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <span style={{ background: tagBg, color: tagColor, fontSize: '.7rem', fontWeight: 700, padding: '.25rem .7rem', borderRadius: 20, letterSpacing: '.05em', textTransform: 'uppercase' }}>
                  {tag}
                </span>
              </div>

              {/* Icon */}
              <div style={{ width: 64, height: 64, borderRadius: 18, background: iconBg, border: `1px solid ${iconColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <Icon size={28} color={iconColor} />
              </div>

              {/* Text */}
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, color: '#0B1D3A', fontSize: '1.25rem', marginBottom: '.5rem' }}>
                {label}
              </h3>
              <p style={{ color: '#64748B', fontSize: '.88rem', lineHeight: 1.6, flex: 1 }}>{desc}</p>

              {/* CTA */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem', marginTop: '1.75rem', color: accent, fontSize: '.82rem', fontWeight: 700 }}>
                Open <ChevronRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer style={{ background: '#0B1D3A', borderTop: '1px solid rgba(201,150,58,.15)', padding: '1.1rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.5rem' }}>
          <p style={{ color: '#475569', fontSize: '.75rem' }}>
            Class · <span style={{ color: '#94A3B8' }}>{classData.name}</span>
          </p>
          <p style={{ color: '#475569', fontSize: '.75rem' }}>
            Powered by <span style={{ color: '#C9963A', fontWeight: 600 }}>Klas School Management Platform</span>
          </p>
        </div>
      </footer>

    </div>
  );
}

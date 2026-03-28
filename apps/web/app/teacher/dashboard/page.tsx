'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LogOut, BookOpen, CalendarDays, BarChart2,
  Users, FileText, ChevronRight, School, PenLine, Bell
} from 'lucide-react';
import EnableNotifications from '@/components/EnableNotifications';


export default function TeacherDashboard() {
  const router = useRouter();
  const [teacherName, setTeacherName] = useState('Teacher');
  const [loading, setLoading] = useState(true);
  const [realStats, setRealStats] = useState({ attendance: '—', students: '—', classes: '—' });
  const [schoolId, setSchoolId] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return router.push('/teacher-login');

   fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(async data => {
        if (data.user.role !== 'TEACHER') return router.push('/login');
        setTeacherName(`${data.user.firstName || 'Teacher'} ${data.user.lastName || ''}`.trim());
        setSchoolId(data.user.schoolId || ''); 
        // Fetch real stats
        try {
          const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
          const headers = { Authorization: `Bearer ${token}` };
          const [classRes, attRes] = await Promise.all([
            fetch(`${API}/classes`, { headers }),
            fetch(`${API}/attendance/today-summary`, { headers }),
          ]);
          const classes = classRes.ok ? await classRes.json() : [];
          const att     = attRes.ok  ? await attRes.json()  : null;
          const totalStudents = Array.isArray(classes)
            ? classes.reduce((sum: number, c: any) => sum + (c.studentCount || 0), 0)
            : 0;
          setRealStats({
            classes:    String(Array.isArray(classes) ? classes.length : '—'),
            students:   totalStudents > 0 ? String(totalStudents) : '—',
            attendance: att?.attendanceRate ? `${att.attendanceRate}%` : '—',
          });
        } catch { /* stats stay as — */ }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B1D3A' }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div className="text-center">
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            border: '3px solid rgba(201,150,58,.2)',
            borderTopColor: '#C9963A',
            animation: 'spin .8s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#94A3B8', fontFamily: 'sans-serif' }}>Loading dashboard…</p>
        </div>
      </div>
    );
  }

  const firstName = teacherName.split(' ')[0];

  const stats = [
    { icon: CalendarDays, label: "Today's Attendance", value: realStats.attendance, color: '#1A56A0', bg: '#EBF4FF' },
    { icon: Users,        label: 'Total Students',     value: realStats.students,   color: '#059669', bg: '#E6FFEE' },
    { icon: BookOpen,     label: 'My Classes',         value: realStats.classes,    color: '#B45309', bg: '#FFFBEB' },
  ];

  const actions = [
    {
      href: '/teacher/select-class',
      icon: CalendarDays,
      label: 'Take Attendance',
      desc: 'Mark present / absent / late for your class',
      iconColor: '#1A56A0', iconBg: '#EBF4FF',
      accent: '#1A56A0',
    },
    {
      href: '/teacher/select-class-exam-scores',
      icon: PenLine,
      label: 'Exam Scores',
      desc: 'Enter CA & exam marks per subject and term',
      iconColor: '#0E7490', iconBg: '#ECFEFF',
      accent: '#0E7490',
      badge: 'New',
    },
    // {
    //   href: '/teacher/select-class-scores',
    //   icon: BarChart2,
    //   label: 'Enter Scores',
    //   desc: 'Input test, assignment & quiz marks',
    //   iconColor: '#059669', iconBg: '#E6FFEE',
    //   accent: '#059669',
    // },
    {
      href: '/teacher/select-class-assignment',
      icon: FileText,
      label: 'Post Assignment',
      desc: 'Create homework & tasks for class',
      iconColor: '#B45309', iconBg: '#FFFBEB',
      accent: '#B45309',
    },
      {
   href: '/teacher/announcements',
    icon: Bell,
    label: 'Announcements',
    desc: 'View school announcements and updates',
    iconColor: '#9D174D', iconBg: '#FCE7F3',
    accent: '#9D174D',
  },
    // {
    //   href: '/teacher/select-class-view',
    //   icon: Users,
    //   label: 'View Classes',
    //   desc: 'Browse all classes and students',
    //   iconColor: '#7C3AED', iconBg: '#F3E8FF',
    //   accent: '#7C3AED',
    // },
  ];

  return (
    <div className="min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif", background: '#F7F6F2' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        .display { font-family: 'Playfair Display', serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up   { animation: fadeUp .55s ease both; }
        .fade-up-1 { animation: fadeUp .55s .08s ease both; }
        .fade-up-2 { animation: fadeUp .55s .16s ease both; }
        .fade-up-3 { animation: fadeUp .55s .24s ease both; }
        .ac-0 { animation: fadeUp .5s .22s ease both; }
        .ac-1 { animation: fadeUp .5s .29s ease both; }
        .ac-2 { animation: fadeUp .5s .36s ease both; }
        .ac-3 { animation: fadeUp .5s .43s ease both; }
        .ac-4 { animation: fadeUp .5s .50s ease both; }

        .hero-dot-grid {
          background-image: radial-gradient(circle, rgba(201,150,58,.13) 1px, transparent 1px);
          background-size: 30px 30px;
        }

        .stat-card {
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          padding: 1.25rem;
          display: flex; align-items: center; gap: .85rem;
          box-shadow: 0 2px 12px rgba(11,29,58,.05);
          transition: box-shadow .2s, transform .2s;
        }
        .stat-card:hover {
          box-shadow: 0 6px 24px rgba(11,29,58,.1);
          transform: translateY(-2px);
        }

        .action-card {
          background: #fff;
          border: 1.5px solid #E8EDF3;
          border-radius: 16px;
          padding: 1.25rem;
          display: flex; flex-direction: column;
          box-shadow: 0 2px 12px rgba(11,29,58,.05);
          text-decoration: none;
          transition: box-shadow .22s cubic-bezier(.34,1.56,.64,1), transform .22s, border-color .2s;
          position: relative; overflow: hidden;
        }
        .action-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0;
          height: 3px;
          background: var(--accent-color);
          opacity: 0;
          transition: opacity .2s;
        }
        .action-card:hover {
          box-shadow: 0 14px 40px rgba(11,29,58,.12);
          transform: translateY(-4px);
          border-color: var(--accent-alpha, #E8EDF3);
        }
        .action-card:hover::before { opacity: 1; }

        .logout-btn {
          display: flex; align-items: center; gap: .5rem;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.15);
          color: #CBD5E0;
          padding: .5rem 1rem; border-radius: 10px;
          font-size: .85rem; font-weight: 500;
          cursor: pointer; transition: background .2s, color .2s;
          font-family: 'DM Sans', sans-serif;
        }
        .logout-btn:hover { background: rgba(255,255,255,.15); color: #fff; }

        .gold-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,150,58,.4), transparent);
        }

        .new-badge {
          background: linear-gradient(135deg,#C9963A,#E8B85A);
          color: #0B1D3A;
          font-size: .58rem; font-weight: 800;
          padding: .15rem .45rem; border-radius: 20px;
          text-transform: uppercase; letter-spacing: .05em;
          flex-shrink: 0;
        }
      `}</style>

{/* ── Header ── */}
<header className="sticky top-0 z-10 fade-up" style={{ background: '#0B1D3A', borderBottom: '2px solid #C9963A' }}>
  <div className="max-w-7xl mx-auto px-6 py-3.5 flex justify-between items-center">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #C9963A, #E8B85A)' }}>
        <School className="h-4 w-4 text-[#0B1D3A]" />
      </div>
      <div>
        <p className="display text-white font-bold text-base leading-tight">School Platform</p>
        <p className="text-[#C9963A] text-xs font-medium">Teacher Portal</p>
      </div>
    </div>
  <div className="flex items-center gap-2.5">
  <EnableNotifications role="teacher" schoolId={schoolId} />
  <button
    onClick={() => { localStorage.removeItem('token'); router.push('/teacher-login'); }}
    className="logout-btn"
  >
    <LogOut className="h-4 w-4" />
    <span className="hidden sm:inline">Logout</span>
  </button>
</div>
  </div>
</header>

      {/* ── Welcome Hero ── */}
      <div className="relative overflow-hidden fade-up-1" style={{ background: '#0B1D3A' }}>
        <div className="absolute inset-0 hero-dot-grid" />
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(201,150,58,.15) 0%, transparent 65%)' }} />
        <div className="relative max-w-7xl mx-auto px-6 py-10">
          <p className="text-slate-400 text-sm mb-1">Good day,</p>
          <h1 className="display text-3xl md:text-4xl font-bold text-white">
            {firstName} <span style={{ color: '#C9963A' }}>👋</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="h-5" style={{ background: 'linear-gradient(to bottom,transparent,#F7F6F2)' }} />
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 fade-up-2">
          {stats.map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="stat-card">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: bg }}>
                <Icon className="h-6 w-6" style={{ color }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0B1D3A]">{value}</p>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Section title ── */}
        <div className="mb-3 fade-up-3">
          <h2 className="display text-xl font-bold text-[#0B1D3A]">Quick Actions</h2>
          <p className="text-slate-400 text-sm mt-0.5">Select an action to get started</p>
        </div>
        <div className="gold-divider mb-7" />

        {/* ── Action Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {actions.map(({ href, icon: Icon, label, desc, iconColor, iconBg, accent, badge }: any, i) => (
            <Link
              key={href}
              href={href}
              className={`action-card ac-${i}`}
              style={{ '--accent-color': accent, '--accent-alpha': `${accent}18` } as React.CSSProperties}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: iconBg, border: `1px solid ${iconColor}20` }}>
                <Icon className="h-5 w-5" style={{ color: iconColor }} />
              </div>
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="display font-bold text-[#0B1D3A] text-sm">{label}</h3>
                {badge && <span className="new-badge">{badge}</span>}
              </div>
              <p className="text-slate-400 text-sm leading-relaxed flex-1">{desc}</p>
              <div className="flex items-center gap-1 mt-5 text-xs font-semibold" style={{ color: accent }}>
                Open <ChevronRight size={13} />
              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="mt-8 py-5" style={{ background: '#0B1D3A', borderTop: '1px solid rgba(201,150,58,.15)' }}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-600 text-xs">
           Powered by <span style={{ color: '#C9963A', fontWeight: 600 }}>Klas School Management Platform</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

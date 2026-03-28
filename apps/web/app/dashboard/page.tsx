'use client';

import AnnouncementForm from '@/components/AnnouncementForm';
import EnableNotifications from '@/components/EnableNotifications';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users, GraduationCap, CalendarDays, BookOpen,
   Bell, LogOut, ChevronRight, School,
  TrendingUp, Award, Clock, MessageSquare, CreditCard,
  CheckCircle, AlertTriangle, ShieldAlert, Zap, Calendar,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type SubStatus = 'trial' | 'active' | 'grace' | 'expired' | null;
interface SubData {
  status: SubStatus;
  daysLeft: number;
  trialEndDate: string;
  currentPeriodEnd: string | null;
  amountDue: number;        // ← add this
  studentCount: number;     // ← add this
  pricePerStudent: number;  // ← add this
}

export default function Dashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [smsStats, setSmsStats] = useState<{ credits: number; enabled: boolean } | null>(null);
  const [sub, setSub]           = useState<SubData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/school-login'); return; }

    Promise.all([
      fetch(`${API}/api/me`,              { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API}/sms/stats`,           { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API}/subscription/status`, { headers: { Authorization: `Bearer ${token}` } }),
    ])
      .then(async ([meRes, smsRes, subRes]) => {
        if (!meRes.ok) {
          if (meRes.status === 401 || meRes.status === 403) {
            localStorage.removeItem('token');
            router.push('/school-login');
          }
          throw new Error('Failed to fetch user data');
        }
        const me = await meRes.json();
        setUserData(me);
        if (smsRes.ok) setSmsStats(await smsRes.json());
        if (subRes.ok) {
          const subData = await subRes.json();
          setSub(subData);
          if (subData.status === 'expired') router.push('/subscription');
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/school-login');
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B1D3A' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', border: '3px solid rgba(201,150,58,.15)', borderTopColor: '#C9963A', animation: 'spin .8s linear infinite', margin: '0 auto 1.25rem' }} />
        <p style={{ color: '#94A3B8', fontFamily: "'DM Sans',sans-serif", fontSize: '.9rem', animation: 'pulse 1.8s ease infinite' }}>Loading your dashboard…</p>
      </div>
    </div>
  );

  if (error || !userData?.school) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: '#F7F6F2', fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: '2.5rem 2rem', maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: '0 4px 28px rgba(11,29,58,.1)', border: '1px solid #FECDD3' }}>
        <div style={{ fontSize: 32, marginBottom: '1rem' }}>⚠️</div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '1.3rem', marginBottom: '.5rem' }}>Something went wrong</h2>
        <p style={{ color: '#94A3B8', fontSize: '.85rem', marginBottom: '1.5rem' }}>{error || 'No school associated with your account'}</p>
        <button onClick={handleLogout} style={{ background: '#0B1D3A', color: '#fff', border: 'none', borderRadius: 12, padding: '.75rem 2rem', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, cursor: 'pointer', fontSize: '.9rem' }}>
          Logout &amp; Try Again
        </button>
      </div>
    </div>
  );

  const { school } = userData;

  const stats = [
    { label: 'Students', value: school.studentCount ?? '—', icon: Users,         color: '#1A56A0', bg: 'rgba(26,86,160,.15)'  },
    { label: 'Teachers', value: school.teacherCount ?? '—', icon: GraduationCap, color: '#7C3AED', bg: 'rgba(124,58,237,.15)' },
    { label: 'Classes',  value: school.classCount   ?? '—', icon: BookOpen,      color: '#059669', bg: 'rgba(5,150,105,.15)'  },
    { label: 'Today',    value: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), icon: Clock, color: '#C9963A', bg: 'rgba(201,150,58,.15)' },
  ];

  const creditsLeft = smsStats?.credits ?? 0;
  const smsEnabled  = smsStats?.enabled ?? false;
  const smsBadgeText  = creditsLeft === 0 ? 'No credits' : smsEnabled ? `${creditsLeft} credits · ON` : `${creditsLeft} credits · OFF`;
  const smsBadgeBg    = creditsLeft === 0 ? '#FEE2E2' : smsEnabled ? '#DCFCE7' : '#F1F5F9';
  const smsBadgeColor = creditsLeft === 0 ? '#DC2626' : smsEnabled ? '#16A34A' : '#64748B';

  const navItems = [
    { href: '/dashboard/classes',           icon: BookOpen,      label: 'Classes',           desc: 'Manage classes and view students',          iconColor: '#059669', iconBg: '#E6FFEE', accent: '#059669' },
    { href: '/dashboard/teachers',          icon: GraduationCap, label: 'Teachers',          desc: 'Assign subjects, manage profiles',          iconColor: '#7C3AED', iconBg: '#F3E8FF', accent: '#7C3AED' },
    { href: '/dashboard/attendance',        icon: CalendarDays,  label: 'Attendance',        desc: 'Daily tracking & monthly reports',          iconColor: '#B45309', iconBg: '#FFFBEB', accent: '#B45309', badge: 'Reports', badgeBg: '#FEF3C7', badgeColor: '#92400E' },
    { href: '/dashboard/subjects',          icon: BookOpen,      label: 'Subjects',          desc: 'Add & manage exam subjects',               iconColor: '#0E7490', iconBg: '#ECFEFF', accent: '#0E7490', badge: 'Exam Setup', badgeBg: '#ECFEFF', badgeColor: '#0E7490' },
    { href: '/dashboard/results',           icon: TrendingUp,    label: 'Results',           desc: 'Grades, report cards & analytics',          iconColor: '#1A56A0', iconBg: '#EBF4FF', accent: '#1A56A0' },
    { href: '/dashboard/fees', icon: () => <span style={{ fontWeight: 800, fontSize: '1rem', color: '#065F46', lineHeight: 1 }}>₦</span>, label: 'Fees',             desc: 'Track payments & balances',                iconColor: '#065F46', iconBg: '#D1FAE5', accent: '#065F46' },
    { href: '/dashboard/announcements',     icon: Bell,          label: 'Announcements',     desc: 'Post updates for parents & staff',          iconColor: '#9D174D', iconBg: '#FCE7F3', accent: '#9D174D' },
    // { href: '/dashboard/awards',            icon: Award,         label: 'Honours',           desc: 'Awards, merits & recognition',              iconColor: '#92400E', iconBg: '#FEF3C7', accent: '#92400E' },
    { href: '/dashboard/sms-settings',      icon: MessageSquare, label: 'SMS Notifications', desc: 'Attendance alerts & parent messaging',      iconColor: '#1A56A0', iconBg: '#EFF6FF', accent: '#1A56A0', badge: smsBadgeText, badgeBg: smsBadgeBg, badgeColor: smsBadgeColor },
    { href: '/dashboard/settings/terms',    icon: Calendar,      label: 'Academic Terms',    desc: 'Set term dates, sessions & current term',   iconColor: '#C9963A', iconBg: '#FFFBEB', accent: '#C9963A', badge: 'Settings', badgeBg: '#FEF3C7', badgeColor: '#92400E' },
    { href: '/dashboard/settings/branding', icon: School,        label: 'School Branding',   desc: 'Update your logo and cover banner',         iconColor: '#0E7490', iconBg: '#ECFEFF', accent: '#0E7490', badge: 'Logo', badgeBg: '#ECFEFF', badgeColor: '#0E7490' },
  ];

const amountLabel = sub?.studentCount === 0
  ? 'Add students first'
  : sub?.amountDue
    ? `₦${sub.amountDue.toLocaleString()}/mo`
    : '…';

const subConfig = {
  trial:   { icon: Zap,           color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE', label: 'Free Trial',            message: `${sub?.daysLeft ?? 0} day${(sub?.daysLeft ?? 0) !== 1 ? 's' : ''} remaining in your free trial`, btnText: `Subscribe — ${amountLabel}`, btnGold: true  },
  active:  { icon: CheckCircle,   color: '#065F46', bg: '#ECFDF5', border: '#6EE7B7', label: 'Subscription Active',  message: sub?.currentPeriodEnd ? `Renews ${new Date(sub.currentPeriodEnd).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}` : 'Your subscription is active', btnText: 'Manage', btnGold: false },
  grace:   { icon: AlertTriangle, color: '#92400E', bg: '#FFFBEB', border: '#FCD34D', label: 'Expiring Soon',        message: `${sub?.daysLeft ?? 0} day${(sub?.daysLeft ?? 0) !== 1 ? 's' : ''} left — renew to avoid interruption`, btnText: `Renew — ${amountLabel}`, btnGold: true  },
  expired: { icon: ShieldAlert,   color: '#9F1239', bg: '#FFF1F2', border: '#FECDD3', label: 'Subscription Expired', message: 'Renew now to restore full dashboard access', btnText: `Renew — ${amountLabel}`, btnGold: true  },
} as const;

  const sc = sub?.status ? subConfig[sub.status] : null;

  return (
    <div style={{ minHeight: '100vh', width: '100%', overflowX: 'hidden', fontFamily: "'DM Sans',sans-serif", background: '#F0EFE9', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        .fade-up   { animation: fadeUp .55s ease both; }
        .fade-up-1 { animation: fadeUp .55s .08s ease both; }
        .fade-up-2 { animation: fadeUp .55s .16s ease both; }
        .fade-up-3 { animation: fadeUp .55s .24s ease both; }
        ${Array.from({length:12},(_,i)=>`.nc-${i}{animation:fadeUp .5s ${.28+i*.06}s ease both;}`).join('')}
        .dot-grid { background-image:radial-gradient(circle,rgba(201,150,58,.14) 1px,transparent 1px);background-size:28px 28px; }
        .gold-shimmer { background:linear-gradient(90deg,#C9963A 0%,#F0C060 40%,#C9963A 60%,#E8B85A 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 4s linear infinite; }
        .logout-btn { display:flex;align-items:center;gap:.4rem;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);color:#94A3B8;padding:.5rem .9rem;border-radius:9px;font-size:.82rem;font-weight:500;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif; }
        .logout-btn:hover { background:rgba(239,68,68,.12);border-color:rgba(239,68,68,.35);color:#FCA5A5; }
        .stat-card { background:rgba(255,255,255,.07);border:1px solid rgba(201,150,58,.18);border-radius:15px;padding:1rem 1.1rem;display:flex;align-items:center;gap:.85rem;transition:background .2s; }
        .stat-card:hover { background:rgba(255,255,255,.11); }
        .nav-card { background:#fff;border-radius:18px;border:1.5px solid #E8EDF3;padding:1.4rem;display:flex;flex-direction:column;text-decoration:none;transition:transform .22s cubic-bezier(.34,1.56,.64,1),box-shadow .22s,border-color .2s;position:relative;overflow:hidden; }
        .nav-card::before { content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--accent,#C9963A);opacity:0;transition:opacity .2s; }
        .nav-card:hover { transform:translateY(-3px);box-shadow:0 12px 36px rgba(11,29,58,.1); }
        .nav-card:hover::before { opacity:1; }
        .gold-divider { height:1px;background:linear-gradient(90deg,transparent,rgba(201,150,58,.35),transparent); }

        /* Responsive grid */
        .stats-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:.85rem; }
        .nav-grid   { display:grid;grid-template-columns:repeat(4,1fr);gap:1.1rem; }
        @media(max-width:1100px) { .nav-grid { grid-template-columns:repeat(3,1fr); } }
        @media(max-width:768px)  { .stats-grid { grid-template-columns:repeat(2,1fr); } .nav-grid { grid-template-columns:repeat(2,1fr); } }
        @media(max-width:480px)  { .nav-grid { grid-template-columns:1fr 1fr; gap:.75rem; } .nav-card { padding:1.1rem; } }
      `}</style>

      {/* ── Header ── */}
      <header className="fade-up" style={{ background: '#0B1D3A', borderBottom: '2px solid rgba(201,150,58,.5)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ padding: '.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', maxWidth: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', minWidth: 0 }}>
            {school.logoUrl ? (
              <img src={school.logoUrl} alt={school.name} style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover', border: '2px solid rgba(201,150,58,.5)', flexShrink: 0 }} />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#C9963A,#E8B85A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <School size={16} color="#0B1D3A" />
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <p style={{ fontFamily: "'Playfair Display',serif", color: '#fff', fontWeight: 700, fontSize: '.9rem', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{school.name}</p>
              <p style={{ color: '#C9963A', fontSize: '.7rem', whiteSpace: 'nowrap' }}>{school.subdomain}.klas.ng</p>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn" style={{ flexShrink: 0 }}>
            <LogOut size={14} />
            <span style={{ display: 'none' }} className="sm-show">Logout</span>
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <div className="fade-up-1" style={{ background: '#0B1D3A', position: 'relative', overflow: 'hidden' }}>
        <div className="dot-grid" style={{ position: 'absolute', inset: 0 }} />
        <div style={{ position: 'absolute', top: -80, right: -60, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,150,58,.12) 0%,transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', padding: '2.25rem 1.25rem 1rem' }}>
          <p style={{ color: '#64748B', fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 500, marginBottom: '.4rem' }}>Admin Dashboard</p>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.6rem,4vw,2.6rem)', fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: '.4rem' }}>
            Welcome back,{' '}<span className="gold-shimmer">{school.name}</span>
          </h1>
          <p style={{ color: '#64748B', fontSize: '.84rem' }}>Manage everything in one place — students, staff, fees &amp; more.</p>
        </div>

        {/* Stats */}
        <div className="fade-up-2" style={{ position: 'relative', padding: '1.25rem 1.25rem 0' }}>
          <div className="stats-grid">
            {stats.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="stat-card">
                <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={17} style={{ color }} />
                </div>
                <div>
                  <p style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', lineHeight: 1.1 }}>{value}</p>
                  <p style={{ color: '#64748B', fontSize: '.7rem', marginTop: '.1rem' }}>{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 28, background: 'linear-gradient(to bottom,transparent,#F0EFE9)' }} />
      </div>

      {/* ── Main ── */}
      <main className="fade-up-3" style={{ flex: 1, padding: '1.75rem 1.25rem 3rem' }}>

        {/* Subscription banner */}
        {sc && sub && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', borderRadius: 18, padding: '1rem 1.25rem', marginBottom: '1.75rem', background: sc.bg, border: `1.5px solid ${sc.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.85rem' }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: `${sc.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <sc.icon style={{ height: 18, width: 18, color: sc.color }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
                  <p style={{ fontWeight: 700, color: sc.color, fontSize: '.87rem' }}>{sc.label}</p>
                  {(sub.status === 'trial' || sub.status === 'grace') && (
                    <span style={{ fontSize: '.62rem', fontWeight: 800, padding: '.1rem .45rem', borderRadius: 20, background: sub.status === 'grace' ? '#FEF3C7' : '#DBEAFE', color: sub.status === 'grace' ? '#92400E' : '#1D4ED8', textTransform: 'uppercase' }}>
                      {sub.daysLeft}d left
                    </span>
                  )}
                </div>
                <p style={{ color: sc.color, fontSize: '.77rem', opacity: .72, marginTop: '.1rem' }}>{sc.message}</p>
              </div>
            </div>
            <Link href="/subscription">
              <button style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', padding: '.58rem 1.1rem', borderRadius: 10, fontSize: '.8rem', fontWeight: 700, fontFamily: "'DM Sans',sans-serif", border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', background: sc.btnGold ? 'linear-gradient(135deg,#C9963A,#E8B85A)' : `${sc.color}15`, color: sc.btnGold ? '#0B1D3A' : sc.color, boxShadow: sc.btnGold ? '0 4px 14px rgba(201,150,58,.3)' : 'none' }}>
                <CreditCard size={12} /> {sc.btnText}
              </button>
            </Link>
          </div>
        )}

        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.75rem' }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: '1.15rem', color: '#0B1D3A' }}>Manage Your School</h2>
          <span style={{ fontSize: '.72rem', color: '#94A3B8', fontWeight: 500 }}>{navItems.length} modules</span>
        </div>
        <div className="gold-divider" style={{ marginBottom: '1.5rem' }} />

        {/* Nav grid */}
        <div className="nav-grid">
          {navItems.map(({ href, icon: Icon, label, desc, iconColor, iconBg, accent, badge, badgeBg, badgeColor }: any, i) => (
            <Link key={href} href={href} className={`nav-card nc-${i}`}
              style={{ '--accent': accent } as React.CSSProperties}>
              <div style={{ width: 46, height: 46, borderRadius: 14, background: iconBg, border: `1px solid ${iconColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', flexShrink: 0 }}>
                <Icon size={20} style={{ color: iconColor }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '.4rem', marginBottom: '.3rem' }}>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '.9rem', lineHeight: 1.2 }}>{label}</h3>
                {badge && (
                  <span style={{ fontSize: '.58rem', fontWeight: 700, padding: '.15rem .45rem', borderRadius: 20, background: badgeBg, color: badgeColor, whiteSpace: 'nowrap', flexShrink: 0, marginTop: '.1rem' }}>
                    {badge}
                  </span>
                )}
              </div>
              <p style={{ color: '#94A3B8', fontSize: '.8rem', lineHeight: 1.55, flex: 1 }}>{desc}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem', marginTop: '1rem', fontSize: '.75rem', fontWeight: 700, color: accent }}>
                Open <ChevronRight size={12} />
              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer style={{ background: '#0B1D3A', borderTop: '1px solid rgba(201,150,58,.15)', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.5rem' }}>
          <p style={{ color: '#475569', fontSize: '.75rem' }}>© {new Date().getFullYear()} <span style={{ color: '#94A3B8' }}>{school.name}</span></p>
          <p style={{ color: '#475569', fontSize: '.75rem' }}>Powered by <span style={{ color: '#C9963A', fontWeight: 600 }}>Klas School Management Platform</span></p>
        </div>
      </footer>
    </div>
  );
}

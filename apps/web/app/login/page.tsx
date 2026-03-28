'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { School, Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function SchoolLoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('token', data.token);

      // ── Role-based redirect (FIXED) ──────────────────────────────────────
      const role = data.user?.role;
      if      (role === 'SUPER_ADMIN')  router.push('/super-admin');
      else if (role === 'SCHOOL_ADMIN') router.push('/dashboard');
      else if (role === 'TEACHER')      router.push('/teacher/dashboard');
      else if (role === 'PARENT')       router.push('/parent/dashboard');
      else                              setError('Unknown role — contact support');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeLeft{ from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:translateX(0)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .fade-up   { animation: fadeUp .6s ease both; }
        .fade-up-1 { animation: fadeUp .6s .1s ease both; }
        .fade-up-2 { animation: fadeUp .6s .2s ease both; }
        .fade-left { animation: fadeLeft .6s .1s ease both; }
        .gold-shimmer {
          background:linear-gradient(90deg,#C9963A 0%,#F0C060 40%,#C9963A 60%,#E8B85A 100%);
          background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;
          background-clip:text;animation:shimmer 4s linear infinite;
        }
        .dot-grid {
          position:absolute;inset:0;pointer-events:none;
          background-image:radial-gradient(circle,rgba(201,150,58,.13) 1px,transparent 1px);
          background-size:28px 28px;
        }
        .float-icon { animation: float 4s ease-in-out infinite; }
        .feature-row {
          display:flex;align-items:flex-start;gap:.85rem;
          padding:.8rem 0;border-bottom:1px solid rgba(255,255,255,.06);
        }
        .feature-row:last-child { border-bottom:none; }
        .login-input {
          width:100%;padding:.88rem 1rem .88rem 2.85rem;
          font-family:'DM Sans',sans-serif;font-size:.92rem;
          border:1.5px solid #E2E8F0;border-radius:13px;
          background:#FAFBFF;color:#0B1D3A;outline:none;
          transition:border-color .2s,box-shadow .2s,background .2s;
          box-sizing:border-box;
        }
        .login-input:focus { border-color:#C9963A;box-shadow:0 0 0 3px rgba(201,150,58,.12);background:#fff; }
        .login-input::placeholder { color:#CBD5E1; }
        .pw-input { padding-right:3.2rem; }
        .pw-toggle {
          position:absolute;right:.85rem;top:50%;transform:translateY(-50%);
          background:none;border:none;cursor:pointer;color:#94A3B8;
          display:flex;align-items:center;padding:.25rem;transition:color .15s;
        }
        .pw-toggle:hover { color:#C9963A; }
        .submit-btn {
          width:100%;display:flex;align-items:center;justify-content:center;gap:.6rem;
          padding:1rem;border-radius:13px;border:none;cursor:pointer;
          font-family:'DM Sans',sans-serif;font-weight:700;font-size:.95rem;
          background:linear-gradient(135deg,#C9963A 0%,#E8B85A 100%);
          color:#0B1D3A;box-shadow:0 4px 20px rgba(201,150,58,.35);
          transition:transform .2s,box-shadow .2s,opacity .2s;
        }
        .submit-btn:hover:not(:disabled) { transform:translateY(-2px);box-shadow:0 8px 28px rgba(201,150,58,.45); }
        .submit-btn:disabled { opacity:.6;cursor:not-allowed; }
        .gold-divider { height:1px;background:linear-gradient(90deg,transparent,rgba(201,150,58,.3),transparent);margin:1.5rem 0; }
      `}</style>

      {/* ── Left decorative panel ── */}
      <div style={{ width: 460, flexShrink: 0, background: '#0B1D3A', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '3rem' }}
        className="hidden lg:flex lg:flex-col">
        <div className="dot-grid" />
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,150,58,.15) 0%,transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -40, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle,rgba(26,86,160,.25) 0%,transparent 65%)', pointerEvents: 'none' }} />

        {/* Top */}
        <div className="relative fade-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '3rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#C9963A,#E8B85A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <School size={20} color="#0B1D3A" />
            </div>
            <p style={{ fontFamily: "'Playfair Display',serif", color: '#fff', fontWeight: 700, fontSize: '1rem' }}>Klas School Management Platform</p>
          </div>

          <div className="float-icon" style={{ width: 76, height: 76, borderRadius: 22, background: 'rgba(201,150,58,.1)', border: '1px solid rgba(201,150,58,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.75rem' }}>
            <School size={36} color="#C9963A" />
          </div>

          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '2rem', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: '.75rem' }}>
            School <span className="gold-shimmer">Dashboard</span>
          </h2>
          <p style={{ color: '#64748B', fontSize: '.88rem', lineHeight: 1.65, maxWidth: 300 }}>
            One secure login for admins, teachers, and parents. You'll be directed to the right dashboard automatically.
          </p>
        </div>

        {/* Features */}
        <div className="relative fade-up-1" style={{ margin: '2rem 0' }}>
          {[
            { emoji: '🏫', title: 'School Admins',  desc: 'Full management — students, staff, fees & reports.' },
            { emoji: '👨‍🏫', title: 'Teachers',       desc: 'Attendance, scores and class management.' },
            { emoji: '👨‍👩‍👧', title: 'Parents',        desc: 'View your child\'s results and updates.' },
          ].map(({ emoji, title, desc }) => (
            <div key={title} className="feature-row">
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                {emoji}
              </div>
              <div>
                <p style={{ color: '#fff', fontWeight: 600, fontSize: '.88rem', lineHeight: 1.2 }}>{title}</p>
                <p style={{ color: '#64748B', fontSize: '.78rem', marginTop: '.2rem' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="relative fade-up-2">
          <p style={{ color: '#334155', fontSize: '.72rem' }}>
            © {new Date().getFullYear()} Klas School Management Platform
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div style={{ flex: 1, background: '#F0EFE9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1.5rem' }}>
        <div className="fade-left" style={{ width: '100%', maxWidth: 460, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 28, boxShadow: '0 8px 40px rgba(11,29,58,.1)', padding: '2.75rem 2.5rem' }}>

          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem', justifyContent: 'center', marginBottom: '1.75rem' }} className="lg:hidden">
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#0B1D3A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <School size={18} color="#C9963A" />
            </div>
            <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '1.05rem' }}>Klas School Management Platform</span>
          </div>

          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: '1.7rem', color: '#0B1D3A', marginBottom: '.4rem' }}>
              Welcome back
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '.85rem' }}>
              Sign in — you'll be redirected to your portal automatically
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', background: '#FFF1F2', border: '1.5px solid #FECDD3', borderRadius: 13, padding: '.85rem 1rem', marginBottom: '1.25rem' }}>
              <AlertCircle size={15} color="#E11D48" style={{ flexShrink: 0 }} />
              <span style={{ color: '#BE123C', fontSize: '.85rem', fontWeight: 500 }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '.45rem' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@your-school.com" className="login-input" required />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.45rem' }}>
                <label style={{ fontSize: '.72rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.07em' }}>
                  Password
                </label>
                <Link href="/forgot-password" style={{ fontSize: '.78rem', fontWeight: 600, color: '#C9963A', textDecoration: 'none' }}
                  onMouseOver={e => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseOut={e => (e.currentTarget.style.textDecoration = 'none')}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                <input type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" className="login-input pw-input" required />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(v => !v)}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="gold-divider" />

            <button type="submit" disabled={loading} className="submit-btn">
              {loading
                ? <><div style={{ width: 17, height: 17, borderRadius: '50%', border: '2px solid rgba(11,29,58,.2)', borderTopColor: '#0B1D3A', animation: 'spin .7s linear infinite', flexShrink: 0 }} /> Signing in…</>
                : <>Sign In <ArrowRight size={16} /></>}
            </button>
          </form>

          {/* Role hint */}
          <div style={{ marginTop: '1.25rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '.75rem 1rem' }}>
            <p style={{ fontSize: '.75rem', color: '#64748B', textAlign: 'center', margin: 0 }}>
              🔀 You'll be automatically redirected based on your role — <strong style={{ color: '#0B1D3A' }}>Admin, Teacher, or Parent</strong>
            </p>
          </div>

          <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: '.82rem', marginTop: '1.25rem' }}>
            Don't have an account?{' '}
            <Link href="/register" style={{ color: '#1A56A0', fontWeight: 700, textDecoration: 'none' }}
              onMouseOver={e => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseOut={e => (e.currentTarget.style.textDecoration = 'none')}>
              Register your school
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

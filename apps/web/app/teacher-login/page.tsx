'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, Mail, Lock, ArrowRight, School } from 'lucide-react';
import { teacherLoginMetadata } from '@/app/seo-metadata';


export const metadata = teacherLoginMetadata;
export default function TeacherLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('token', data.token);

      if (data.user.role === 'TEACHER') {
        router.push('/teacher/dashboard');
      } else {
        setError('This login is for teachers only.');
        localStorage.removeItem('token');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'DM Sans', sans-serif", flexDirection: 'row' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        @keyframes fadeUp    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeLeft  { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:translateX(0)} }
        @keyframes shimmer   { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes spin      { to{transform:rotate(360deg)} }
        @keyframes float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse     { 0%,100%{opacity:.5} 50%{opacity:1} }

        .fade-up   { animation: fadeUp .6s ease both; }
        .fade-up-1 { animation: fadeUp .6s .1s ease both; }
        .fade-up-2 { animation: fadeUp .6s .2s ease both; }
        .fade-up-3 { animation: fadeUp .6s .3s ease both; }
        .fade-left { animation: fadeLeft .6s .15s ease both; }
        .alert     { animation: slideDown .3s ease both; }

        /* ── Left panel ── */
        .left-panel {
          width: 480px;
          flex-shrink: 0;
          background: #0B1D3A;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 3rem;
        }
        @media (max-width: 900px) { .left-panel { display: none; } }

        .dot-grid {
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(201,150,58,.13) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }

        .gold-shimmer {
          background: linear-gradient(90deg, #C9963A 0%, #F0C060 40%, #C9963A 60%, #E8B85A 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        .float-icon { animation: float 4s ease-in-out infinite; }

        /* Feature rows */
        .feature-row {
          display: flex; align-items: flex-start; gap: .85rem;
          padding: .85rem 0;
          border-bottom: 1px solid rgba(255,255,255,.06);
        }
        .feature-row:last-child { border-bottom: none; }

        /* ── Right panel (form) ── */
        .right-panel {
          flex: 1;
          background: #F0EFE9;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 2rem;
          min-height: 100vh;
        }

        .form-card {
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 28px;
          box-shadow: 0 8px 40px rgba(11,29,58,.1);
          padding: 2.75rem 2.5rem;
          width: 100%;
          max-width: 460px;
        }

        @media (max-width: 600px) {
          .right-panel { padding: 1.25rem 1rem; align-items: flex-start; padding-top: 2rem; }
          .form-card { padding: 2rem 1.25rem; border-radius: 20px; }
        }

        .field-label {
          font-size: .78rem; font-weight: 600;
          color: #0B1D3A; text-transform: uppercase; letter-spacing: .07em;
          display: flex; align-items: center; gap: .4rem;
          margin-bottom: .5rem;
        }

        .input-wrap { position: relative; }
        .input-icon {
          position: absolute; left: 1rem; top: 50%; transform: translateY(-50%);
          pointer-events: none; color: #94A3B8;
          transition: color .2s;
        }
        .input-icon.top { top: 1.1rem; transform: none; }

        .field-input {
          width: 100%; padding: .9rem 1rem .9rem 2.85rem;
          border: 1.5px solid #E2E8F0; border-radius: 13px;
          font-family: 'DM Sans', sans-serif; font-size: .92rem;
          color: #0B1D3A; background: #FAFAF8; outline: none;
          transition: border-color .2s, box-shadow .2s, background .2s;
          box-sizing: border-box;
        }
        .field-input::placeholder { color: #CBD5E1; }
        .field-input:focus {
          border-color: #C9963A;
          box-shadow: 0 0 0 3px rgba(201,150,58,.12);
          background: #fff;
        }
        .field-input:focus + .input-border-glow { opacity: 1; }

        /* Show/hide password toggle */
        .pw-toggle {
          position: absolute; right: 1rem; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: #94A3B8;
          font-size: .75rem; font-weight: 600; font-family: 'DM Sans', sans-serif;
          transition: color .15s; padding: .25rem .4rem; border-radius: 6px;
        }
        .pw-toggle:hover { color: #C9963A; background: rgba(201,150,58,.08); }

        .gold-divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(201,150,58,.3), transparent); margin: 1.6rem 0; }

        /* Submit button */
        .submit-btn {
          width: 100%; padding: 1rem 1.5rem; border: none; border-radius: 14px; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: .95rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center; gap: .55rem;
          background: linear-gradient(135deg, #0B1D3A 0%, #162D54 100%);
          color: #fff; box-shadow: 0 4px 18px rgba(11,29,58,.22);
          transition: background .2s, transform .15s, box-shadow .2s;
        }
        .submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #162D54 0%, #1e3a6a 100%);
          transform: translateY(-1px); box-shadow: 0 8px 28px rgba(11,29,58,.28);
        }
        .submit-btn:disabled { opacity: .65; cursor: not-allowed; }
      `}</style>

      {/* ══════════════ LEFT PANEL ══════════════ */}
      <div className="left-panel">
        <div className="dot-grid" />

        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,150,58,.14) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -40, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,86,160,.22) 0%, transparent 65%)', pointerEvents: 'none' }} />

        {/* Top: logo + brand */}
        <div className="relative fade-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '3rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #C9963A, #E8B85A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <School size={20} color="#0B1D3A" />
            </div>
            <p style={{ fontFamily: "'Playfair Display', serif", color: '#fff', fontWeight: 700, fontSize: '1rem' }}>
              Klas School Management Platform
            </p>
          </div>

          {/* Floating icon */}
          <div className="float-icon" style={{ width: 80, height: 80, borderRadius: 22, background: 'rgba(201,150,58,.12)', border: '1px solid rgba(201,150,58,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.75rem' }}>
            <GraduationCap size={38} color="#C9963A" />
          </div>

          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: '.75rem' }}>
            Teacher <span className="gold-shimmer">Portal</span>
          </h2>
          <p style={{ color: '#64748B', fontSize: '.88rem', lineHeight: 1.65, maxWidth: 320 }}>
            Your hub for managing attendance, scores, and student progress — all in one place.
          </p>
        </div>

        {/* Middle: features */}
        <div className="relative fade-up-1" style={{ margin: '2rem 0' }}>
          {[
            { emoji: '📋', title: 'Take Attendance', desc: 'Mark present, absent, or late in seconds.' },
            { emoji: '📝', title: 'Enter Scores',    desc: 'Record test, assignment, and exam results.' },
            { emoji: '👥', title: 'View Students',   desc: 'Access your class roster anytime.' },
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

        {/* Bottom: footer note */}
        <div className="relative fade-up-2">
          <p style={{ color: '#334155', fontSize: '.72rem' }}>
            © {new Date().getFullYear()} Klas School Management Platform. <span style={{ color: '#C9963A' }}>For teachers only.</span>
          </p>
        </div>
      </div>

      {/* ══════════════ RIGHT PANEL (FORM) ══════════════ */}
      <div className="right-panel">
        <div className="form-card fade-left">

          {/* Mobile brand header — only shows on small screens */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.65rem', marginBottom: '1.5rem' }} className="lg:hidden">
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#0B1D3A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <School size={18} color="#C9963A" />
            </div>
            <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '1rem' }}>Klas School Management Platform</span>
          </div>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #0B1D3A, #162D54)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.1rem', boxShadow: '0 6px 20px rgba(11,29,58,.25)' }}>
              <GraduationCap size={26} color="#C9963A" />
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: '1.65rem', color: '#0B1D3A', lineHeight: 1.2 }}>
              Teacher Login
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '.82rem', marginTop: '.4rem' }}>
              Sign in to access your classes and tools
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="alert" style={{ marginBottom: '1.25rem', padding: '.9rem 1.1rem', borderRadius: 14, background: '#FFF1F2', border: '1.5px solid #FECDD3', display: 'flex', alignItems: 'center', gap: '.65rem' }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
              <p style={{ color: '#BE123C', fontSize: '.83rem', fontWeight: 500 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Email */}
            <div>
              <label className="field-label">
                <Mail size={12} color="#C9963A" /> Email Address
              </label>
              <div className="input-wrap">
                <Mail size={16} className="input-icon" />
                <input
                  type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="teacher@school.com"
                  className="field-input" required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.5rem' }}>
                <label className="field-label" style={{ margin: 0 }}>
                  <Lock size={12} color="#C9963A" /> Password
                </label>
                <a href="/forgot-password" style={{ fontSize: '.78rem', fontWeight: 600, color: '#C9963A', textDecoration: 'none' }}
                  onMouseOver={e => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseOut={e => (e.currentTarget.style.textDecoration = 'none')}>
                  Forgot password?
                </a>
              </div>
              <div className="input-wrap">
                <Lock size={16} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="field-input"
                  style={{ paddingRight: '4.5rem' }}
                  required
                />
                <button type="button" className="pw-toggle" onClick={() => setShowPassword(v => !v)}>
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="gold-divider" />

            {/* Submit */}
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? (
                <>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(255,255,255,.25)', borderTopColor: '#fff', animation: 'spin .7s linear infinite', flexShrink: 0 }} />
                  Signing in…
                </>
              ) : (
                <>Login as Teacher <ArrowRight size={16} /></>
              )}
            </button>

          </form>

          {/* Footer link */}
          <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: '.8rem', marginTop: '1.5rem' }}>
            Are you a school admin?{' '}
            <Link href="/school-login" style={{ color: '#C9963A', fontWeight: 700, textDecoration: 'none' }}
              onMouseOver={e => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseOut={e => (e.currentTarget.style.textDecoration = 'none')}>
              Go to School Login →
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
}

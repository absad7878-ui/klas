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

      const role = data.user?.role;
      if (role === 'TEACHER') throw new Error('This login is for school admins only. Please use the Teacher Login page.');
      if (role === 'PARENT')  throw new Error('This login is for school admins only. Please contact your school for the parent portal link.');

      localStorage.setItem('token', data.token);

      if      (role === 'SUPER_ADMIN')  router.push('/super-admin');
      else if (role === 'SCHOOL_ADMIN') router.push('/dashboard');
      else                              setError('Unknown role — contact support');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', width: '100%', overflowX: 'hidden', fontFamily: "'DM Sans', sans-serif", background: '#F0EFE9', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .fade-up   { animation: fadeUp .6s ease both; }
        .fade-up-1 { animation: fadeUp .6s .1s ease both; }
        .fade-up-2 { animation: fadeUp .6s .2s ease both; }
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
          padding:.85rem 0;border-bottom:1px solid rgba(255,255,255,.06);
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
        .pw-toggle {
          position:absolute;right:.85rem;top:50%;transform:translateY(-50%);
          background:none;border:none;cursor:pointer;color:#94A3B8;
          display:flex;align-items:center;padding:.25rem;transition:color .15s;line-height:0;
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
        .gold-divider { height:1px;background:linear-gradient(90deg,transparent,rgba(201,150,58,.3),transparent);margin:1.25rem 0; }

        /* Layout */
        .page-layout { display:flex;flex:1;min-height:100vh; }
        .side-panel   { width:460px;flex-shrink:0;background:#0B1D3A;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;padding:3rem; }
        .form-panel   { flex:1;display:flex;align-items:center;justify-content:center;padding:2.5rem 1.25rem; }
        .form-card    { width:100%;max-width:460px;background:#fff;border:1px solid #E2E8F0;border-radius:24px;box-shadow:0 8px 40px rgba(11,29,58,.1);padding:2.75rem 2.5rem; }

        /* Hide side panel on mobile */
        @media (max-width: 900px) {
          .side-panel { display: none; }
          .form-panel { padding: 1.5rem 1rem; align-items: flex-start; padding-top: 2rem; }
          .form-card  { padding: 2rem 1.25rem; border-radius: 20px; box-shadow: 0 4px 24px rgba(11,29,58,.08); }
        }
      `}</style>

      {/* ── Mobile Nav ── */}
      <nav style={{ background: '#0B1D3A', borderBottom: '2px solid rgba(201,150,58,.4)', padding: '.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '.6rem', textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#C9963A,#E8B85A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <School size={15} color="#0B1D3A" />
          </div>
          <span style={{ fontFamily: "'Playfair Display',serif", color: '#fff', fontWeight: 700, fontSize: '.9rem' }}>Klas School Management Platform</span>
        </Link>
        <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem', background: 'rgba(201,150,58,.15)', border: '1px solid rgba(201,150,58,.3)', color: '#C9963A', fontWeight: 600, fontSize: '.78rem', padding: '.45rem .9rem', borderRadius: 8, textDecoration: 'none' }}>
          Register Free
        </Link>
      </nav>

      <div className="page-layout">

        {/* ── Left Panel (desktop only) ── */}
        <div className="side-panel">
          <div className="dot-grid" />
          <div style={{ position:'absolute',top:-60,right:-60,width:300,height:300,borderRadius:'50%',background:'radial-gradient(circle,rgba(201,150,58,.15) 0%,transparent 65%)',pointerEvents:'none' }} />
          <div style={{ position:'absolute',bottom:-80,left:-40,width:260,height:260,borderRadius:'50%',background:'radial-gradient(circle,rgba(26,86,160,.25) 0%,transparent 65%)',pointerEvents:'none' }} />

          <div style={{ position: 'relative' }} className="fade-up">
            <div className="float-icon" style={{ width:72,height:72,borderRadius:20,background:'rgba(201,150,58,.1)',border:'1px solid rgba(201,150,58,.25)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'1.75rem' }}>
              <School size={34} color="#C9963A" />
            </div>
            <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:'2rem',fontWeight:800,color:'#fff',lineHeight:1.2,marginBottom:'.75rem' }}>
              School <span className="gold-shimmer">Dashboard</span>
            </h2>
            <p style={{ color:'#64748B',fontSize:'.87rem',lineHeight:1.65,maxWidth:300 }}>
              The admin portal for school management. Teachers have a separate login page.
            </p>
          </div>

          <div style={{ position:'relative',margin:'2rem 0' }} className="fade-up-1">
            {[
              { emoji:'👥', title:'Students & Staff',  desc:'Manage classes, teachers and student profiles.' },
              { emoji:'📊', title:'Results & Reports', desc:'Generate report cards and track performance.' },
              { emoji:'💳', title:'Fees & Finance',    desc:'Track payments, balances and subscriptions.' },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="feature-row">
                <div style={{ width:36,height:36,borderRadius:10,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0 }}>
                  {emoji}
                </div>
                <div>
                  <p style={{ color:'#fff',fontWeight:600,fontSize:'.87rem',lineHeight:1.2 }}>{title}</p>
                  <p style={{ color:'#64748B',fontSize:'.77rem',marginTop:'.2rem' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ position:'relative' }} className="fade-up-2">
            <p style={{ color:'#334155',fontSize:'.72rem' }}>© {new Date().getFullYear()} Klas School Management Platform</p>
          </div>
        </div>

        {/* ── Right Form Panel ── */}
        <div className="form-panel">
          <div className="form-card fade-up">

            {/* Header */}
            <div style={{ marginBottom: '1.75rem' }}>
              <h1 style={{ fontFamily:"'Playfair Display',serif",fontWeight:800,fontSize:'1.65rem',color:'#0B1D3A',marginBottom:'.4rem' }}>
                Welcome back
              </h1>
              <p style={{ color:'#94A3B8',fontSize:'.85rem' }}>
                Sign in to your school admin portal
              </p>
            </div>

            {/* Error */}
            {error && (
              <div style={{ display:'flex',alignItems:'center',gap:'.6rem',background:'#FFF1F2',border:'1.5px solid #FECDD3',borderRadius:12,padding:'.85rem 1rem',marginBottom:'1.25rem' }}>
                <AlertCircle size={15} color="#E11D48" style={{ flexShrink:0 }} />
                <span style={{ color:'#BE123C',fontSize:'.84rem',fontWeight:500 }}>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display:'flex',flexDirection:'column',gap:'1rem' }}>

              {/* Email */}
              <div>
                <label style={{ display:'block',fontSize:'.7rem',fontWeight:700,color:'#94A3B8',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:'.4rem' }}>
                  Email Address
                </label>
                <div style={{ position:'relative' }}>
                  <Mail size={14} style={{ position:'absolute',left:'1rem',top:'50%',transform:'translateY(-50%)',color:'#94A3B8',pointerEvents:'none' }} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="admin@your-school.com" className="login-input" required autoComplete="email" />
                </div>
              </div>

              {/* Password */}
              <div>
                <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'.4rem' }}>
                  <label style={{ fontSize:'.7rem',fontWeight:700,color:'#94A3B8',textTransform:'uppercase',letterSpacing:'.07em' }}>
                    Password
                  </label>
                  <Link href="/forgot-password" style={{ fontSize:'.78rem',fontWeight:600,color:'#C9963A',textDecoration:'none' }}>
                    Forgot password?
                  </Link>
                </div>
                <div style={{ position:'relative' }}>
                  <Lock size={14} style={{ position:'absolute',left:'1rem',top:'50%',transform:'translateY(-50%)',color:'#94A3B8',pointerEvents:'none' }} />
                  <input type={showPw ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" className="login-input" style={{ paddingRight: '3rem' }} required autoComplete="current-password" />
                  <button type="button" className="pw-toggle" onClick={() => setShowPw(v => !v)}>
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="gold-divider" />

              <button type="submit" disabled={loading} className="submit-btn">
                {loading
                  ? <><div style={{ width:17,height:17,borderRadius:'50%',border:'2px solid rgba(11,29,58,.2)',borderTopColor:'#0B1D3A',animation:'spin .7s linear infinite',flexShrink:0 }} /> Signing in…</>
                  : <>Sign In <ArrowRight size={16} /></>}
              </button>
            </form>

            {/* Role hint */}
            <div style={{ marginTop:'1.25rem',background:'#F8FAFC',border:'1px solid #E2E8F0',borderRadius:12,padding:'.75rem 1rem' }}>
              <p style={{ fontSize:'.75rem',color:'#64748B',textAlign:'center',margin:0 }}>
                🔒 Admins only. Teachers use the{' '}
                <a href="/teacher-login" style={{ color:'#C9963A',fontWeight:700 }}>Teacher Login</a> page.
              </p>
            </div>

            <p style={{ textAlign:'center',color:'#94A3B8',fontSize:'.82rem',marginTop:'1.1rem' }}>
              No account?{' '}
              <Link href="/register" style={{ color:'#1A56A0',fontWeight:700,textDecoration:'none' }}>
                Register your school free
              </Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}

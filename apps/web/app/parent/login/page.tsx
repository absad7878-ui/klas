'use client';
// apps/web/app/parent/login/page.tsx

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { School, Lock, Mail, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { parentLoginMetadata } from '@/app/seo-metadata';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';


export default function ParentLoginPage() {
  const router = useRouter();
  const [mode, setMode]           = useState<'login' | 'forgot'>('login');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/parent/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('parentToken', data.token);
      router.push('/parent/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/parent/forgot-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) throw new Error('Failed to send reset email');
      setSuccess('If this email is registered, a reset link has been sent. Check your inbox.');
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#060D1F', fontFamily:"'DM Sans',sans-serif", padding:'1.5rem' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .card { background:#0D1630; border:1px solid rgba(201,150,58,.2); border-radius:22px; padding:2.5rem 2rem; width:100%; max-width:420px; animation:fadeUp .5s ease both; }
        .form-input { width:100%; padding:.9rem 1rem .9rem 2.85rem; font-family:'DM Sans',sans-serif; font-size:.92rem; background:rgba(255,255,255,.05); border:1.5px solid rgba(255,255,255,.1); border-radius:12px; color:#fff; outline:none; transition:border-color .2s,box-shadow .2s; box-sizing:border-box; }
        .form-input:focus { border-color:rgba(201,150,58,.5); box-shadow:0 0 0 3px rgba(201,150,58,.1); }
        .form-input::placeholder { color:rgba(255,255,255,.25); }
        .submit-btn { width:100%; padding:.95rem; border:none; border-radius:12px; background:linear-gradient(135deg,#C9963A,#E8B85A); color:#0B1D3A; font-family:'DM Sans',sans-serif; font-weight:700; font-size:.95rem; cursor:pointer; box-shadow:0 6px 24px rgba(201,150,58,.3); transition:all .25s; display:flex; align-items:center; justify-content:center; gap:.5rem; }
        .submit-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 32px rgba(201,150,58,.45); }
        .submit-btn:disabled { opacity:.65; cursor:not-allowed; }
        .gold { background:linear-gradient(90deg,#C9963A,#F5D070,#C9963A); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation:shimmer 5s linear infinite; }
      `}</style>

      {/* Logo */}
      <div style={{ display:'flex', alignItems:'center', gap:'.6rem', marginBottom:'2rem', animation:'fadeUp .4s ease both' }}>
        <div style={{ width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,#C9963A,#E8B85A)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <School size={18} color="#0B1D3A" />
        </div>
        <span style={{ fontFamily:"'Cormorant Garamond',serif", color:'#fff', fontWeight:700, fontSize:'1.15rem' }}>klas.ng</span>
      </div>

      <div className="card">
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.9rem', fontWeight:700, color:'#fff', margin:'0 0 .4rem' }}>
            {mode === 'login' ? <>Parent <span className="gold">Portal</span></> : <>Reset <span className="gold">Password</span></>}
          </h1>
          <p style={{ color:'rgba(255,255,255,.4)', fontSize:'.85rem' }}>
            {mode === 'login' ? "View your children's attendance, results & fees" : "We'll send a reset link to your email"}
          </p>
        </div>

        {success && (
          <div style={{ display:'flex', alignItems:'flex-start', gap:'.6rem', background:'rgba(34,197,94,.1)', border:'1px solid rgba(34,197,94,.25)', color:'#4ADE80', padding:'.85rem 1rem', borderRadius:11, marginBottom:'1.25rem', fontSize:'.84rem' }}>
            <CheckCircle size={15} style={{ flexShrink:0, marginTop:1 }} /> {success}
          </div>
        )}
        {error && (
          <div style={{ display:'flex', alignItems:'flex-start', gap:'.6rem', background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.25)', color:'#F87171', padding:'.85rem 1rem', borderRadius:11, marginBottom:'1.25rem', fontSize:'.84rem' }}>
            <AlertCircle size={15} style={{ flexShrink:0, marginTop:1 }} /> {error}
          </div>
        )}

        <form onSubmit={mode === 'login' ? handleLogin : handleForgot}>
          <div style={{ marginBottom:'1rem' }}>
            <label style={{ display:'block', fontSize:'.7rem', fontWeight:700, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:'.4rem' }}>
              Email Address
            </label>
            <div style={{ position:'relative' }}>
              <Mail size={15} style={{ position:'absolute', left:'.95rem', top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,.3)', pointerEvents:'none' }} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="form-input" required />
            </div>
          </div>

          {mode === 'login' && (
            <div style={{ marginBottom:'1.5rem' }}>
              <label style={{ display:'block', fontSize:'.7rem', fontWeight:700, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:'.4rem' }}>
                Password
              </label>
              <div style={{ position:'relative' }}>
                <Lock size={15} style={{ position:'absolute', left:'.95rem', top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,.3)', pointerEvents:'none' }} />
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" className="form-input" required style={{ paddingRight:'3rem' }} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{ position:'absolute', right:'.85rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,.3)', lineHeight:0 }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          )}

          {mode === 'login' && (
            <div style={{ marginBottom:'1.25rem', textAlign:'right' }}>
              <button type="button" onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
                style={{ background:'none', border:'none', color:'rgba(201,150,58,.7)', fontSize:'.8rem', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                Forgot password?
              </button>
            </div>
          )}

          <button type="submit" disabled={loading} className="submit-btn">
            {loading
              ? <><div style={{ width:16, height:16, borderRadius:'50%', border:'2px solid rgba(11,29,58,.3)', borderTopColor:'#0B1D3A', animation:'spin .7s linear infinite' }} /> Please wait…</>
              : mode === 'login'
                ? <><Lock size={15} /> Login to Parent Portal</>
                : <>Send Reset Link <ArrowRight size={15} /></>}
          </button>
        </form>

        {mode === 'forgot' && (
          <button type="button" onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
            style={{ width:'100%', marginTop:'.85rem', padding:'.75rem', border:'1px solid rgba(255,255,255,.1)', borderRadius:11, background:'transparent', color:'rgba(255,255,255,.5)', fontFamily:"'DM Sans',sans-serif", fontSize:'.85rem', cursor:'pointer' }}>
            ← Back to Login
          </button>
        )}

        <p style={{ color:'rgba(255,255,255,.2)', fontSize:'.75rem', textAlign:'center', marginTop:'1.5rem' }}>
          First time? Check your email for a setup link from your school.
        </p>
      </div>
    </div>
  );
}

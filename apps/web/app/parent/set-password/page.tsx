'use client';
// apps/web/app/parent/set-password/page.tsx

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { School, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function SetPasswordForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const token        = searchParams.get('token') || '';

  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [done,      setDone]      = useState(false);

  useEffect(() => {
    if (!token) setError('Invalid or missing link. Please ask your school to resend the invite.');
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 6)  { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/parent/set-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to set password');
      localStorage.setItem('parentToken', data.token);
      setDone(true);
      setTimeout(() => router.push('/parent/dashboard'), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#060D1F', fontFamily:"'DM Sans',sans-serif", padding:'1.5rem' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .card { background:#0D1630; border:1px solid rgba(201,150,58,.2); border-radius:22px; padding:2.5rem 2rem; width:100%; max-width:420px; animation:fadeUp .5s ease both; }
        .form-input { width:100%; padding:.9rem 1rem .9rem 2.85rem; font-family:'DM Sans',sans-serif; font-size:.92rem; background:rgba(255,255,255,.05); border:1.5px solid rgba(255,255,255,.1); border-radius:12px; color:#fff; outline:none; transition:border-color .2s; box-sizing:border-box; }
        .form-input:focus { border-color:rgba(201,150,58,.5); box-shadow:0 0 0 3px rgba(201,150,58,.1); }
        .form-input::placeholder { color:rgba(255,255,255,.25); }
        .submit-btn { width:100%; padding:.95rem; border:none; border-radius:12px; background:linear-gradient(135deg,#C9963A,#E8B85A); color:#0B1D3A; font-family:'DM Sans',sans-serif; font-weight:700; font-size:.95rem; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:.5rem; transition:all .25s; }
        .submit-btn:hover:not(:disabled) { transform:translateY(-2px); }
        .submit-btn:disabled { opacity:.65; cursor:not-allowed; }
      `}</style>

      <div style={{ display:'flex', alignItems:'center', gap:'.6rem', marginBottom:'2rem' }}>
        <div style={{ width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,#C9963A,#E8B85A)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <School size={18} color="#0B1D3A" />
        </div>
        <span style={{ fontFamily:"'Cormorant Garamond',serif", color:'#fff', fontWeight:700, fontSize:'1.15rem' }}>klas.ng</span>
      </div>

      <div className="card">
        {done ? (
          <div style={{ textAlign:'center', padding:'1.5rem 0' }}>
            <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(34,197,94,.15)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.25rem' }}>
              <CheckCircle size={30} color="#4ADE80" />
            </div>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", color:'#fff', fontSize:'1.5rem', margin:'0 0 .5rem' }}>All Set! 🎉</h2>
            <p style={{ color:'rgba(255,255,255,.4)', fontSize:'.85rem' }}>Redirecting to your dashboard…</p>
          </div>
        ) : (
          <>
            <div style={{ textAlign:'center', marginBottom:'2rem' }}>
              <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.9rem', fontWeight:700, color:'#fff', margin:'0 0 .4rem' }}>
                Create Your Password
              </h1>
              <p style={{ color:'rgba(255,255,255,.4)', fontSize:'.85rem' }}>Set a secure password to access your parent portal</p>
            </div>

            {error && (
              <div style={{ display:'flex', alignItems:'flex-start', gap:'.6rem', background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.25)', color:'#F87171', padding:'.85rem 1rem', borderRadius:11, marginBottom:'1.25rem', fontSize:'.84rem' }}>
                <AlertCircle size={15} style={{ flexShrink:0, marginTop:1 }} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {[
                { label:'New Password',      value:password,  setter:setPassword },
                { label:'Confirm Password',  value:confirm,   setter:setConfirm  },
              ].map(({ label, value, setter }) => (
                <div key={label} style={{ marginBottom:'1rem' }}>
                  <label style={{ display:'block', fontSize:'.7rem', fontWeight:700, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:'.4rem' }}>
                    {label}
                  </label>
                  <div style={{ position:'relative' }}>
                    <Lock size={15} style={{ position:'absolute', left:'.95rem', top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,.3)', pointerEvents:'none' }} />
                    <input type={showPass ? 'text' : 'password'} value={value} onChange={e => setter(e.target.value)}
                      placeholder="••••••••" className="form-input" required style={{ paddingRight: label === 'New Password' ? '3rem' : undefined }} />
                    {label === 'New Password' && (
                      <button type="button" onClick={() => setShowPass(v => !v)}
                        style={{ position:'absolute', right:'.85rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,.3)', lineHeight:0 }}>
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div style={{ marginBottom:'1.5rem' }}>
                <div style={{ height:4, borderRadius:4, background:'rgba(255,255,255,.08)', overflow:'hidden' }}>
                  <div style={{ height:'100%', borderRadius:4, transition:'width .3s', background: password.length >= 8 ? '#22C55E' : password.length >= 6 ? '#C9963A' : '#EF4444', width: password.length === 0 ? '0%' : password.length < 6 ? '25%' : password.length < 8 ? '60%' : '100%' }} />
                </div>
                <p style={{ color:'rgba(255,255,255,.25)', fontSize:'.7rem', marginTop:'.3rem' }}>
                  {password.length === 0 ? 'Enter a password' : password.length < 6 ? 'Too short' : password.length < 8 ? 'Good' : 'Strong ✓'}
                </p>
              </div>

              <button type="submit" disabled={loading || !token} className="submit-btn">
                {loading
                  ? <><div style={{ width:16, height:16, borderRadius:'50%', border:'2px solid rgba(11,29,58,.3)', borderTopColor:'#0B1D3A', animation:'spin .7s linear infinite' }} /> Setting password…</>
                  : <><Lock size={15} /> Save Password & Login</>}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', background:'#060D1F' }} />}>
      <SetPasswordForm />
    </Suspense>
  );
}

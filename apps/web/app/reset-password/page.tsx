// apps/web/app/reset-password/page.tsx
'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, School, ArrowLeft } from 'lucide-react';

function ResetPasswordPage() {
  const router       = useRouter();
  const params       = useSearchParams();
  const token        = params.get('token') || '';

  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [showCf, setShowCf]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState('');

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  useEffect(() => {
    if (!token) setError('No reset token found. Please request a new reset link.');
  }, [token]);

  const hasUpper   = /[A-Z]/.test(password);
  const hasLower   = /[a-z]/.test(password);
  const hasNumber  = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasLength  = password.length >= 8;
  const matches    = password === confirm && confirm.length > 0;

  const rules = [
    { label: 'At least 8 characters', ok: hasLength },
    { label: 'Uppercase letter',       ok: hasUpper  },
    { label: 'Lowercase letter',       ok: hasLower  },
    { label: 'Number',                 ok: hasNumber },
    { label: 'Special character',      ok: hasSpecial },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!matches) return setError('Passwords do not match');
    if (!hasLength || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      return setError('Password does not meet all requirements');
    }
    setLoading(true);
    try {
      const res  = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      setSuccess(true);
      setTimeout(() => router.push('/school-login'), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-[#F7F6F2]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        .display { font-family: 'Playfair Display', serif; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp .5s ease both; }
        .form-input {
          width: 100%; padding: .9rem 1rem .9rem 2.9rem;
          font-family: 'DM Sans', sans-serif; font-size: .95rem;
          border: 1.5px solid #E2E8F0; border-radius: 12px;
          background: #FAFBFF; color: #0B1D3A; outline: none;
          transition: border-color .2s, box-shadow .2s; box-sizing: border-box;
        }
        .form-input:focus { border-color: #C9963A; box-shadow: 0 0 0 3px rgba(201,150,58,.15); background: #fff; }
        .form-input::placeholder { color: #A0AEC0; }
        .pw-input { padding-right: 3.2rem; }
        .pw-toggle { position: absolute; right: .85rem; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #94A3B8; display: flex; align-items: center; padding: .25rem; transition: color .15s; }
        .pw-toggle:hover { color: #C9963A; }
        .submit-btn {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: .6rem;
          padding: 1rem; border-radius: 12px;
          font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 1rem;
          border: none; cursor: pointer;
          background: linear-gradient(135deg, #C9963A 0%, #E8B85A 100%);
          color: #0B1D3A; box-shadow: 0 4px 20px rgba(201,150,58,.35);
          transition: transform .2s, box-shadow .2s, opacity .2s;
        }
        .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(201,150,58,.45); }
        .submit-btn:disabled { opacity: .6; cursor: not-allowed; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { width: 18px; height: 18px; border-radius: 50%; border: 2px solid rgba(11,29,58,.2); border-top-color: #0B1D3A; animation: spin .75s linear infinite; flex-shrink: 0; }
        .rule-row { display: flex; align-items: center; gap: .5rem; font-size: .76rem; }
        .rule-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; transition: background .2s; }
      `}</style>

      <div className="w-full max-w-md fade-up">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #C9963A, #E8B85A)' }}>
            <School style={{ height: 18, width: 18 }} className="text-[#0B1D3A]" />
          </div>
          <span className="display text-lg font-bold text-[#0B1D3A]">Klas School Management Platform</span>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 md:p-10">
          {success ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: '#ECFDF5' }}>
                <CheckCircle className="h-8 w-8 text-emerald-500" />
              </div>
              <h1 className="display text-2xl font-bold text-[#0B1D3A] mb-2">Password reset!</h1>
              <p className="text-slate-500 text-sm mb-2">Your password has been updated successfully.</p>
              <p className="text-slate-400 text-xs">Redirecting to login in 3 seconds…</p>
            </div>
          ) : (
            <>
              <div className="mb-7">
                <h1 className="display text-2xl font-bold text-[#0B1D3A] mb-1.5">Set new password</h1>
                <p className="text-slate-400 text-sm">Choose a strong password for your account.</p>
              </div>

              {error && (
                <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input type={showPw ? 'text' : 'password'} value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••" className="form-input pw-input" required />
                    <button type="button" className="pw-toggle" onClick={() => setShowPw(v => !v)}>
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-1.5">
                      {rules.map(r => (
                        <div key={r.label} className="rule-row">
                          <div className="rule-dot" style={{ background: r.ok ? '#22C55E' : '#E2E8F0' }} />
                          <span style={{ color: r.ok ? '#15803D' : '#94A3B8' }}>{r.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input type={showCf ? 'text' : 'password'} value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="••••••••" className="form-input pw-input" required />
                    <button type="button" className="pw-toggle" onClick={() => setShowCf(v => !v)}>
                      {showCf ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirm.length > 0 && (
                    <p className="text-xs mt-1.5 flex items-center gap-1"
                      style={{ color: matches ? '#15803D' : '#E11D48' }}>
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: matches ? '#22C55E' : '#E11D48', display: 'inline-block' }} />
                      {matches ? 'Passwords match' : 'Passwords do not match'}
                    </p>
                  )}
                </div>

                <button type="submit" disabled={loading || !token} className="submit-btn" style={{ marginTop: '1.5rem' }}>
                  {loading ? <><div className="spinner" /> Resetting…</> : 'Reset Password'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/school-login"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
                  style={{ color: '#64748B' }}>
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to login
                </Link>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-slate-400 text-xs mt-6">
          © {new Date().getFullYear()} Klas School Management Platform
        </p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F6F2' }}>Loading...</div>}>
      <ResetPasswordPage />
    </Suspense>
  );
}

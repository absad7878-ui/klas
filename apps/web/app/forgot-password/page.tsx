// apps/web/app/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, School, CheckCircle, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setSent(true);
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
        .hero-dot-grid { background-image: radial-gradient(circle, rgba(201,150,58,.13) 1px, transparent 1px); background-size: 28px 28px; }
        .form-input {
          width: 100%; padding: .9rem 1rem .9rem 2.9rem;
          font-family: 'DM Sans', sans-serif; font-size: .95rem;
          border: 1.5px solid #E2E8F0; border-radius: 12px;
          background: #FAFBFF; color: #0B1D3A; outline: none;
          transition: border-color .2s, box-shadow .2s; box-sizing: border-box;
        }
        .form-input:focus { border-color: #C9963A; box-shadow: 0 0 0 3px rgba(201,150,58,.15); background: #fff; }
        .form-input::placeholder { color: #A0AEC0; }
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
      `}</style>

      <div className="w-full max-w-md fade-up">

        {/* Logo */}
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #C9963A, #E8B85A)' }}>
            <School className="h-4.5 w-4.5 text-[#0B1D3A]" style={{ height: 18, width: 18 }} />
          </div>
          <span className="display text-lg font-bold text-[#0B1D3A]">Klas School Management Platform</span>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 md:p-10">

          {sent ? (
            /* ── Success state ── */
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: '#ECFDF5' }}>
                <CheckCircle className="h-8 w-8 text-emerald-500" />
              </div>
              <h1 className="display text-2xl font-bold text-[#0B1D3A] mb-2">Check your email</h1>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                If <strong>{email}</strong> is registered, you'll receive a password reset link shortly.
                The link expires in <strong>1 hour</strong>.
              </p>
              <p className="text-slate-400 text-xs mb-6">
                Didn't get an email? Check your spam folder or{' '}
                <button onClick={() => setSent(false)}
                  className="font-semibold hover:underline" style={{ color: '#C9963A', background: 'none', border: 'none', cursor: 'pointer' }}>
                  try again
                </button>.
              </p>
              <Link href="/school-login"
                className="flex items-center justify-center gap-2 text-sm font-semibold"
                style={{ color: '#1A56A0' }}>
                <ArrowLeft className="h-4 w-4" /> Back to login
              </Link>
            </div>
          ) : (
            /* ── Request form ── */
            <>
              <div className="mb-7">
                <h1 className="display text-2xl font-bold text-[#0B1D3A] mb-1.5">Forgot your password?</h1>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Enter the email address you registered with and we'll send you a reset link.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="admin@your-school.com" className="form-input" required />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? <><div className="spinner" /> Sending link…</> : 'Send Reset Link'}
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

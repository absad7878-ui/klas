'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  School, CheckCircle, AlertCircle, Clock, CreditCard,
  Calendar, ArrowLeft, RefreshCw, ShieldCheck, Zap, Users, FileText,
} from 'lucide-react';

type SubStatus = 'trial' | 'active' | 'grace' | 'expired' | null;

interface SubData {
  status:           SubStatus;
  trialEndDate:     string;
  currentPeriodEnd: string | null;
  lastPaymentDate:  string | null;
  daysLeft:         number;
  amountDue:        number;
  studentCount:     number;
  pricePerStudent:  number;
  payments: { id: string; paystackReference: string; amount: number; paidAt: string; periodEnd: string }[];
}

function SubscriptionPage() {
  const router    = useRouter();
  const params    = useSearchParams();
  const verifyRef = params.get('verify');

  const [sub,       setSub]       = useState<SubData | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [paying,    setPaying]    = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [message,   setMessage]   = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const API   = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchStatus = async () => {
    if (!token) return router.push('/school-login');
    try {
      const res = await fetch(`${API}/subscription/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) return router.push('/school-login');
      const data = await res.json();
      setSub(data);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load subscription data' });
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (ref: string) => {
    setVerifying(true); setMessage(null);
    try {
      const res  = await fetch(`${API}/subscription/verify/${ref}`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      setMessage({ type: 'success', text: data.alreadyApplied ? 'Subscription is already active.' : '🎉 Payment confirmed! Your subscription is now active.' });
      await fetchStatus();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setVerifying(false);
      window.history.replaceState({}, '', '/subscription');
    }
  };

  useEffect(() => { fetchStatus(); }, []);
  useEffect(() => { if (verifyRef && token) verifyPayment(verifyRef); }, [verifyRef, token]);

  const handlePay = async () => {
    if (!token) return;
    setPaying(true); setMessage(null);
    try {
      const res  = await fetch(`${API}/subscription/initialize`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initialize payment');
      window.location.href = data.authorization_url;
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
      setPaying(false);
    }
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

  const statusConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
    trial:   { label: 'Free Trial',    color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE', icon: Clock       },
    active:  { label: 'Active',        color: '#065F46', bg: '#ECFDF5', border: '#6EE7B7', icon: CheckCircle },
    grace:   { label: 'Expiring Soon', color: '#92400E', bg: '#FFFBEB', border: '#FCD34D', icon: AlertCircle },
    expired: { label: 'Expired',       color: '#9F1239', bg: '#FFF1F2', border: '#FECDD3', icon: AlertCircle },
  };

  const cfg = sub?.status ? statusConfig[sub.status] : null;

  const features = [
    { icon: Users,       label: 'Unlimited teachers & classes' },
    { icon: FileText,    label: 'Attendance, results & report cards' },
    { icon: Zap,         label: 'SMS notifications for parents' },
    { icon: ShieldCheck, label: 'Secure, private school data' },
  ];

  const needsPayment = sub?.status === 'trial' || sub?.status === 'grace' || sub?.status === 'expired';

  return (
    <div style={{ minHeight: '100vh', width: '100%', fontFamily: "'DM Sans',sans-serif", background: '#F7F6F2' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        .fade-up   { animation: fadeUp .5s ease both; }
        .fade-up-1 { animation: fadeUp .5s .08s ease both; }
        .fade-up-2 { animation: fadeUp .5s .16s ease both; }
        .hero-dot-grid { background-image:radial-gradient(circle,rgba(201,150,58,.13) 1px,transparent 1px);background-size:30px 30px; }
        .gold-shimmer { background:linear-gradient(90deg,#C9963A 0%,#F0C060 40%,#C9963A 60%,#E8B85A 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 4s linear infinite; }
        .pay-btn { display:flex;align-items:center;justify-content:center;gap:.6rem;width:100%;padding:1.05rem;font-family:'DM Sans',sans-serif;font-weight:700;font-size:1rem;border:none;border-radius:13px;cursor:pointer;background:linear-gradient(135deg,#C9963A,#E8B85A);color:#0B1D3A;box-shadow:0 4px 20px rgba(201,150,58,.35);transition:transform .2s,box-shadow .2s,opacity .2s; }
        .pay-btn:hover:not(:disabled) { transform:translateY(-1px);box-shadow:0 8px 28px rgba(201,150,58,.45); }
        .pay-btn:disabled { opacity:.6;cursor:not-allowed; }
        .spinner { width:20px;height:20px;border-radius:50%;border:2.5px solid rgba(11,29,58,.2);border-top-color:#0B1D3A;animation:spin .75s linear infinite;flex-shrink:0; }
        .hist-row { display:flex;align-items:center;justify-content:space-between;padding:.85rem 1.25rem;border-bottom:1px solid #F1F5F9; }
        .hist-row:last-child { border-bottom:none; }
        .card { background:#fff;border-radius:20px;border:1px solid #E8EDF3;box-shadow:0 2px 14px rgba(11,29,58,.05);overflow:hidden; }
        .card-header { padding:1.25rem 1.5rem;border-bottom:1px solid #F1F5F9;background:#FAFBFF; }
        .card-body { padding:1.5rem; }
      `}</style>

      {/* Header */}
      <header className="fade-up" style={{ background:'#0B1D3A', borderBottom:'2px solid rgba(201,150,58,.5)', position:'sticky', top:0, zIndex:20 }}>
        <div style={{ padding:'.85rem 1.25rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'.6rem' }}>
            <div style={{ width:30, height:30, borderRadius:9, background:'linear-gradient(135deg,#C9963A,#E8B85A)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <School size={14} color="#0B1D3A" />
            </div>
            <span style={{ fontFamily:"'Playfair Display',serif", color:'#fff', fontWeight:700, fontSize:'.9rem' }}>Klas School Platform</span>
          </div>
          {(sub?.status === 'active' || sub?.status === 'grace') && (
            <Link href="/dashboard" style={{ display:'flex', alignItems:'center', gap:'.4rem', color:'#C9963A', border:'1px solid rgba(201,150,58,.3)', padding:'.45rem .9rem', borderRadius:9, fontSize:'.8rem', fontWeight:600, textDecoration:'none' }}>
              <ArrowLeft size={13} /> Back to dashboard
            </Link>
          )}
        </div>
      </header>

      {/* Hero */}
      <div className="fade-up-1" style={{ background:'#0B1D3A', position:'relative', overflow:'hidden' }}>
        <div className="hero-dot-grid" style={{ position:'absolute', inset:0 }} />
        <div style={{ position:'absolute', top:-60, right:-40, width:280, height:280, borderRadius:'50%', background:'radial-gradient(circle,rgba(201,150,58,.15) 0%,transparent 65%)', pointerEvents:'none' }} />
        <div style={{ position:'relative', padding:'2.5rem 1.5rem', textAlign:'center' }}>
          <p style={{ color:'#64748B', fontSize:'.72rem', textTransform:'uppercase', letterSpacing:'.1em', fontWeight:500, marginBottom:'.5rem' }}>Subscription</p>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:800, color:'#fff', lineHeight:1.15, marginBottom:'.5rem' }}>
            Pay <span className="gold-shimmer">Per Student</span>
          </h1>
          <p style={{ color:'#64748B', fontSize:'.9rem', maxWidth:440, margin:'0 auto' }}>
            ₦20 per student per month. Your school's size determines your bill — fair, simple, transparent.
          </p>
        </div>
        <div style={{ height:24, background:'linear-gradient(to bottom,transparent,#F7F6F2)' }} />
      </div>

      <div style={{ maxWidth:720, margin:'0 auto', padding:'1.5rem 1.25rem 4rem', display:'flex', flexDirection:'column', gap:'1.25rem' }} className="fade-up-2">

        {/* Verification / messages */}
        {verifying && (
          <div style={{ display:'flex', alignItems:'center', gap:'.75rem', background:'#EFF6FF', border:'1px solid #BFDBFE', color:'#1D4ED8', padding:'1rem 1.25rem', borderRadius:14, fontSize:'.88rem', fontWeight:500 }}>
            <div className="spinner" style={{ borderTopColor:'#1D4ED8', borderColor:'rgba(29,78,216,.2)' }} /> Verifying your payment…
          </div>
        )}
        {message && (
          <div style={{ display:'flex', alignItems:'flex-start', gap:'.65rem', padding:'1rem 1.25rem', borderRadius:14, fontSize:'.88rem', fontWeight:500,
            background: message.type==='success'?'#ECFDF5':'#FFF1F2',
            border:     message.type==='success'?'1px solid #6EE7B7':'1px solid #FECDD3',
            color:      message.type==='success'?'#065F46':'#9F1239' }}>
            {message.type==='success' ? <CheckCircle size={16} style={{ flexShrink:0, marginTop:1 }} /> : <AlertCircle size={16} style={{ flexShrink:0, marginTop:1 }} />}
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="card" style={{ padding:'5rem 1rem', textAlign:'center' }}>
            <div style={{ width:40, height:40, borderRadius:'50%', border:'3px solid rgba(201,150,58,.2)', borderTopColor:'#C9963A', animation:'spin .8s linear infinite', margin:'0 auto 1rem' }} />
            <p style={{ color:'#94A3B8', fontSize:'.88rem' }}>Loading subscription…</p>
          </div>

        ) : sub && cfg ? (
          <>
            {/* ── Status card ── */}
            <div className="card">
              <div className="card-header" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'.75rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'.85rem' }}>
                  <div style={{ width:40, height:40, borderRadius:11, background:cfg.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <cfg.icon size={20} style={{ color:cfg.color }} />
                  </div>
                  <div>
                    <p style={{ fontSize:'.68rem', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:'.15rem' }}>Status</p>
                    <p style={{ fontWeight:700, color:'#0B1D3A', fontSize:'.95rem' }}>{cfg.label}</p>
                  </div>
                </div>
                <span style={{ padding:'.3rem .85rem', borderRadius:999, fontSize:'.75rem', fontWeight:700, background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}` }}>
                  {sub.daysLeft > 0 ? `${sub.daysLeft} days left` : 'Expired'}
                </span>
              </div>
              <div style={{ padding:'1.1rem 1.5rem', display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:'1rem' }}>
                <div>
                  <p style={{ fontSize:'.67rem', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:'.2rem' }}>Trial ends</p>
                  <p style={{ fontWeight:600, color:'#0B1D3A', fontSize:'.85rem' }}>{fmt(sub.trialEndDate)}</p>
                </div>
                {sub.currentPeriodEnd && (
                  <div>
                    <p style={{ fontSize:'.67rem', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:'.2rem' }}>Period ends</p>
                    <p style={{ fontWeight:600, color:'#0B1D3A', fontSize:'.85rem' }}>{fmt(sub.currentPeriodEnd)}</p>
                  </div>
                )}
                {sub.lastPaymentDate && (
                  <div>
                    <p style={{ fontSize:'.67rem', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:'.2rem' }}>Last payment</p>
                    <p style={{ fontWeight:600, color:'#0B1D3A', fontSize:'.85rem' }}>{fmt(sub.lastPaymentDate)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Pricing breakdown (always visible) ── */}
            <div className="card">
              <div className="card-header">
                <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, color:'#0B1D3A', fontSize:'1rem', margin:0 }}>Your Monthly Bill</p>
                <p style={{ color:'#94A3B8', fontSize:'.78rem', marginTop:'.2rem' }}>Calculated from your current student count</p>
              </div>
              <div className="card-body">
                {/* Calculation display */}
                <div style={{ background:'#F8FAFC', border:'1.5px solid #E2E8F0', borderRadius:14, padding:'1.1rem 1.25rem', marginBottom:'1.25rem' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'.75rem' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'.5rem' }}>
                      <Users size={14} color="#94A3B8" />
                      <span style={{ color:'#64748B', fontSize:'.85rem' }}>Registered students</span>
                    </div>
                    <span style={{ fontWeight:700, color:'#0B1D3A', fontSize:'.9rem' }}>{sub.studentCount}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'.75rem' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'.5rem' }}>
                      <span style={{ fontSize:'.85rem', color:'#64748B' }}>Rate per student</span>
                    </div>
                    <span style={{ fontWeight:700, color:'#0B1D3A', fontSize:'.9rem' }}>₦{sub.pricePerStudent}/student</span>
                  </div>
                  <div style={{ height:1, background:'#E2E8F0', margin:'.25rem 0 .75rem' }} />
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{ fontWeight:700, color:'#0B1D3A', fontSize:'.9rem' }}>Total due this month</span>
                    <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:800, color:'#C9963A', fontSize:'1.4rem' }}>
                      ₦{sub.amountDue.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'.65rem', marginBottom:'1.25rem' }}>
                  {features.map(f => (
                    <div key={f.label} style={{ display:'flex', alignItems:'center', gap:'.55rem' }}>
                      <div style={{ width:28, height:28, borderRadius:8, background:'rgba(201,150,58,.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <f.icon size={13} style={{ color:'#C9963A' }} />
                      </div>
                      <span style={{ color:'#64748B', fontSize:'.82rem' }}>{f.label}</span>
                    </div>
                  ))}
                </div>

                {/* Pay button — show when not active OR when active (to extend) */}
                {needsPayment ? (
                  <>
                    {sub.studentCount === 0 ? (
                      <div style={{ background:'#FFFBEB', border:'1px solid #FDE68A', borderRadius:12, padding:'.85rem 1rem', fontSize:'.84rem', color:'#92400E' }}>
                        ⚠️ Add students first before subscribing. Your bill is based on student count.
                      </div>
                    ) : (
                      <>
                        <button onClick={handlePay} disabled={paying} className="pay-btn">
                          {paying
                            ? <><div className="spinner" /> Redirecting to Paystack…</>
                            : <><CreditCard size={17} /> Pay ₦{sub.amountDue.toLocaleString()} with Paystack</>}
                        </button>
                        <p style={{ textAlign:'center', color:'#94A3B8', fontSize:'.75rem', marginTop:'.75rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'.35rem' }}>
                          <ShieldCheck size={12} /> Secured by Paystack · Card, bank transfer, USSD
                        </p>
                      </>
                    )}
                  </>
                ) : (
                  <button onClick={handlePay} disabled={paying}
                    style={{ display:'flex', alignItems:'center', gap:'.5rem', padding:'.7rem 1.25rem', borderRadius:11, border:'1.5px solid #E2E8F0', background:'#F8FAFF', color:'#0B1D3A', fontFamily:"'DM Sans',sans-serif", fontSize:'.85rem', fontWeight:600, cursor:'pointer', transition:'all .2s' }}>
                    <RefreshCw size={14} />
                    {paying ? 'Redirecting…' : `Extend by 30 days — ₦${sub.amountDue.toLocaleString()}`}
                  </button>
                )}
              </div>
            </div>

            {/* ── Payment history ── */}
            {sub.payments.length > 0 && (
              <div className="card">
                <div className="card-header" style={{ display:'flex', alignItems:'center', gap:'.5rem' }}>
                  <Calendar size={14} color="#94A3B8" />
                  <span style={{ fontSize:'.72rem', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.07em' }}>Payment History</span>
                </div>
                {sub.payments.map(p => (
                  <div key={p.id} className="hist-row">
                    <div style={{ display:'flex', alignItems:'center', gap:'.75rem' }}>
                      <div style={{ width:34, height:34, borderRadius:9, background:'#ECFDF5', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <CheckCircle size={15} color="#059669" />
                      </div>
                      <div>
                        <p style={{ fontWeight:600, color:'#0B1D3A', fontSize:'.86rem' }}>Monthly Subscription</p>
                        <p style={{ color:'#94A3B8', fontSize:'.72rem', fontFamily:'monospace' }}>{p.paystackReference}</p>
                      </div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <p style={{ fontWeight:700, color:'#0B1D3A', fontSize:'.88rem' }}>₦{p.amount.toLocaleString()}</p>
                      <p style={{ color:'#94A3B8', fontSize:'.72rem' }}>{fmt(p.paidAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="card" style={{ padding:'3rem', textAlign:'center' }}>
            <AlertCircle size={32} color="#CBD5E1" style={{ margin:'0 auto .75rem' }} />
            <p style={{ color:'#94A3B8', fontSize:'.88rem' }}>Could not load subscription data.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F7F6F2' }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ width:40, height:40, borderRadius:'50%', border:'3px solid rgba(201,150,58,.2)', borderTopColor:'#C9963A', animation:'spin .8s linear infinite' }} />
      </div>
    }>
      <SubscriptionPage />
    </Suspense>
  );
}

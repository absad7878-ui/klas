'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, School, MessageSquare, ToggleLeft, ToggleRight,
  CreditCard, Send, AlertCircle, CheckCircle,
  Clock, X, RefreshCw, Info, ShieldCheck, Lock
} from 'lucide-react';

declare global {
  interface Window {
    PaystackPop: {
      setup: (options: {
        key:       string;
        email:     string;
        amount:    number;
        currency:  string;
        ref:       string;
        metadata?: Record<string, any>;
        onClose:   () => void;
        callback:  (response: { reference: string }) => void;
      }) => { openIframe: () => void };
    };
  }
}

const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_KEY || 'pk_test_529b215d85e811dff905fad2db147fa4c274eed3';

interface SmsSettings {
  enabled:       boolean;
  credits:       number;
  sendOnPresent: boolean;
  sendOnAbsent:  boolean;
  termiiApiKey:  string;
  senderId:      string;
}

interface SmsLog {
  id:          string;
  studentId:   string;
  phone:       string;
  message:     string;
  status:      string;
  creditsUsed: number;
  createdAt:   string;
}

interface Stats {
  totalSent:   number;
  totalFailed: number;
  monthSent:   number;
  credits:     number;
  enabled:     boolean;
}

interface SchoolProfile {
  email: string;
  name:  string;
}

// ₦15 per credit — minimum ₦1,500
const PACKAGES = [
  { credits:  100, price:  1500, label: 'Starter',  popular: false },
  { credits:  200, price:  3000, label: 'Basic',     popular: false },
  { credits:  333, price:  5000, label: 'Standard',  popular: true  },
  { credits:  667, price: 10000, label: 'Growth',    popular: false },
];

const genRef = () => `SCHOOL-SMS-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

type PaystackStep = 'select' | 'processing' | 'success' | 'failed';

export default function SmsSettingsPage() {
  const router = useRouter();

  const [settings, setSettings]   = useState<SmsSettings | null>(null);
  const [stats, setStats]         = useState<Stats | null>(null);
  const [logs, setLogs]           = useState<SmsLog[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [success, setSuccess]     = useState('');
  const [error, setError]         = useState('');
  const [school, setSchool]       = useState<SchoolProfile | null>(null);

  const [showPaystack, setShowPaystack]   = useState(false);
  const [manualEmail,  setManualEmail]    = useState('');
  const [selectedPkg,  setSelectedPkg]   = useState<typeof PACKAGES[0] | null>(null);
  const [paystackStep, setPaystackStep]  = useState<PaystackStep>('select');
  const [payError,     setPayError]      = useState('');
  const [psScriptReady, setPsScriptReady] = useState(false);

  const API   = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const token = () => localStorage.getItem('token') || '';

  const flash = (msg: string, isError = false) => {
    if (isError) { setError(msg);   setTimeout(() => setError(''),   4500); }
    else         { setSuccess(msg); setTimeout(() => setSuccess(''), 4500); }
  };

  useEffect(() => {
    if (document.getElementById('paystack-script')) { setPsScriptReady(true); return; }
    const script = document.createElement('script');
    script.id    = 'paystack-script';
    script.src   = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => setPsScriptReady(true);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    const t = token();
    if (!t) { router.push('/login'); return; }
    loadAll(t);
  }, []);

  const loadAll = async (t: string) => {
    setLoading(true);
    try {
      const [settRes, statsRes, logsRes, schoolRes] = await Promise.all([
        fetch(`${API}/sms/settings`,      { headers: { Authorization: `Bearer ${t}` } }),
        fetch(`${API}/sms/stats`,         { headers: { Authorization: `Bearer ${t}` } }),
        fetch(`${API}/sms/logs?limit=15`, { headers: { Authorization: `Bearer ${t}` } }),
        fetch(`${API}/api/me`,            { headers: { Authorization: `Bearer ${t}` } }),
      ]);
      if (settRes.ok)  setSettings(await settRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
      if (logsRes.ok)  { const d = await logsRes.json(); setLogs(d.logs || []); }
      if (schoolRes.ok) {
        const me = await schoolRes.json();
        const email = me.school?.email || me.user?.email || me.email || '';
        setSchool({ email, name: me.school?.name || me.name || '' });
      }
    } catch { flash('Failed to load SMS settings', true); }
    finally  { setLoading(false); }
  };

  const saveSettings = async (patch: Partial<SmsSettings>) => {
    setSaving(true); setError('');
    try {
      const res = await fetch(`${API}/sms/settings`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ ...settings, ...patch }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to save'); }
      const result = await res.json();
      setSettings(prev => prev ? { ...prev, ...patch, enabled: result.enabled } : prev);
      flash('Settings saved');
    } catch (err: any) { flash(err.message, true); }
    finally { setSaving(false); }
  };

  const handleToggle = () => {
    if (!settings) return;
    if (settings.credits === 0) {
      flash('No credits remaining — please purchase credits to enable SMS', true); return;
    }
    saveSettings({ enabled: !settings.enabled });
  };

  const openPaystack = () => {
    setSelectedPkg(PACKAGES[2] ?? null);
    setPaystackStep('select');
    setPayError('');
    setShowPaystack(true);
  };

  const verifyPayment = async (reference: string) => {
    try {
      const res = await fetch(`${API}/sms/credits/topup`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ amount: selectedPkg!.credits, reference, price: selectedPkg!.price }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Verification failed'); }
      const data = await res.json();
      setSettings(prev => prev ? { ...prev, credits: data.credits } : prev);
      setStats(prev   => prev ? { ...prev, credits: data.credits } : prev);
      setPaystackStep('success');
      loadAll(token());
    } catch (err: any) {
      setPaystackStep('failed');
      setPayError(err.message);
    }
  };

  const handlePay = () => {
    if (!selectedPkg) { setPayError('Please select a package'); return; }
    if (!psScriptReady || !window.PaystackPop) {
      setPayError('Paystack is still loading — please wait a moment and try again'); return;
    }
    const email = school?.email || manualEmail.trim();
    if (!email) { setPayError('Please enter your email address below to continue'); return; }

    const reference = genRef();
    const handler = window.PaystackPop.setup({
      key:      PAYSTACK_PUBLIC_KEY,
      email,
      amount:   selectedPkg.price * 100,
      currency: 'NGN',
      ref:      reference,
      metadata: {
        custom_fields: [
          { display_name: 'Package',     variable_name: 'package',     value: selectedPkg.label },
          { display_name: 'SMS Credits', variable_name: 'sms_credits', value: selectedPkg.credits },
          { display_name: 'School',      variable_name: 'school_name', value: school?.name || '' },
        ],
      },
      onClose: () => {
        if (paystackStep === 'processing') {
          setPaystackStep('select');
          setPayError('Payment cancelled — the Paystack window was closed');
        }
      },
      callback: (response: { reference: string }) => {
        setPaystackStep('processing');
        verifyPayment(response.reference);
      },
    });
    handler.openIframe();
  };

  const closePaystack = () => {
    setShowPaystack(false);
    if (paystackStep === 'success') flash(`✓ ${selectedPkg?.credits} credits added successfully!`);
  };

  const statusStyle = (status: string) => {
    if (status === 'sent')   return { bg: '#DCFCE7', color: '#16A34A', label: 'Sent' };
    if (status === 'failed') return { bg: '#FEE2E2', color: '#DC2626', label: 'Failed' };
    if (status === 'topup')  return { bg: '#EFF6FF', color: '#1D4ED8', label: 'Top-up' };
    return                          { bg: '#F1F5F9', color: '#64748B', label: status };
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B1D3A' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(201,150,58,.2)', borderTopColor: '#C9963A', animation: 'spin .8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: '#94A3B8', fontSize: '.9rem' }}>Loading SMS settings…</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div className="min-h-screen w-screen" style={{ fontFamily: "'DM Sans',sans-serif", background: '#F7F6F2' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        .display { font-family:'Playfair Display',serif; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes popIn  { 0%{opacity:0;transform:scale(.92)} 100%{opacity:1;transform:scale(1)} }
        @keyframes checkDraw { 0%{stroke-dashoffset:50} 100%{stroke-dashoffset:0} }
        .fade-up   { animation:fadeUp .5s ease both; }
        .fade-up-1 { animation:fadeUp .5s .08s ease both; }
        .fade-up-2 { animation:fadeUp .5s .16s ease both; }
        .fade-up-3 { animation:fadeUp .5s .24s ease both; }
        .hero-dot-grid { background-image:radial-gradient(circle,rgba(201,150,58,.13) 1px,transparent 1px);background-size:30px 30px; }
        .card { background:#fff;border-radius:18px;border:1px solid #E2E8F0;box-shadow:0 2px 12px rgba(11,29,58,.05);overflow:hidden; }
        .card-header { padding:1.1rem 1.4rem;border-bottom:1px solid #F1F5F9;display:flex;align-items:center;gap:.65rem;background:#FAFBFF; }
        .card-body { padding:1.4rem; }
        .toggle-wrap { display:flex;align-items:center;justify-content:space-between;padding:.9rem 1rem;border-radius:13px;border:1.5px solid #E2E8F0;background:#FAFBFF; }
        .toggle-btn { background:none;border:none;cursor:pointer;padding:0;line-height:0;transition:opacity .2s; }
        .toggle-btn:hover { opacity:.8; }
        .stat-card { background:#fff;border-radius:15px;border:1px solid #E2E8F0;padding:1.1rem 1.25rem; }
        .log-row { padding:.75rem 1rem;border-bottom:1px solid #F1F5F9;display:flex;align-items:flex-start;gap:.75rem; }
        .log-row:last-child { border-bottom:none; }
        .status-pill { display:inline-block;font-size:.68rem;font-weight:700;padding:.18rem .55rem;border-radius:20px;flex-shrink:0; }
        .ps-overlay { position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:60;padding:1rem;backdrop-filter:blur(6px); }
        .ps-modal { background:#fff;border-radius:22px;width:100%;max-width:460px;overflow:hidden;box-shadow:0 32px 80px rgba(0,0,0,.28);animation:popIn .3s cubic-bezier(.34,1.56,.64,1) both; }
        .ps-header { background:linear-gradient(135deg,#0B1D3A 0%,#1A3A6A 100%);padding:1.4rem 1.6rem;position:relative; }
        .ps-body { padding:1.5rem 1.6rem; }
        .pkg-card { border:2px solid #E2E8F0;border-radius:13px;padding:.85rem 1rem;cursor:pointer;transition:all .18s;position:relative; }
        .pkg-card:hover { border-color:#C9963A;background:#FFFBEB; }
        .pkg-card.selected { border-color:#C9963A;background:#FFFBEB; }
        .pkg-card.popular::after { content:'Most Popular';position:absolute;top:-9px;right:10px;background:#C9963A;color:#0B1D3A;font-size:.62rem;font-weight:800;padding:.15rem .55rem;border-radius:20px;letter-spacing:.04em; }
        .pay-btn { width:100%;padding:.95rem;border-radius:12px;border:none;cursor:pointer;background:linear-gradient(135deg,#00C3FF,#0080FF);color:#fff;font-weight:800;font-size:.95rem;font-family:'DM Sans',sans-serif;box-shadow:0 5px 20px rgba(0,128,255,.35);transition:transform .18s,box-shadow .18s,opacity .2s;display:flex;align-items:center;justify-content:center;gap:.5rem; }
        .pay-btn:hover:not(:disabled) { transform:translateY(-1px);box-shadow:0 8px 28px rgba(0,128,255,.45); }
        .pay-btn:disabled { opacity:.7;cursor:not-allowed; }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-10 fade-up" style={{ background: '#0B1D3A', borderBottom: '2px solid #C9963A' }}>
        <div className="w-full px-6 py-3.5 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-[#C9963A] hover:text-[#E8B85A] font-semibold text-sm transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#C9963A,#E8B85A)' }}>
              <School className="h-3.5 w-3.5 text-[#0B1D3A]" />
            </div>
            <span className="display text-white font-bold text-sm">School Platform</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden fade-up-1" style={{ background: '#0B1D3A' }}>
        <div className="absolute inset-0 hero-dot-grid" />
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(201,150,58,.15) 0%,transparent 65%)' }} />
        <div className="relative w-full px-6 py-8">
          <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider font-medium">SMS Settings</p>
          <h1 className="display text-3xl md:text-4xl font-bold text-white leading-tight">
            SMS <span style={{ color: '#C9963A' }}>Notifications</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">1 credit = 1 SMS · ₦15 per credit</p>
        </div>
      </div>

      <div className="w-full px-4 md:px-6 py-8 max-w-4xl mx-auto space-y-6">

        {/* Alerts */}
        {success && (
          <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium fade-up">
            <CheckCircle className="h-4 w-4 shrink-0" /> {success}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm fade-up">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {/* Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 fade-up-2">
          {[
            { label: 'Credits Left',    value: stats?.credits     ?? 0, icon: CreditCard,  color: '#C9963A', bg: '#FFFBEB' },
            { label: 'Sent This Month', value: stats?.monthSent   ?? 0, icon: Send,        color: '#059669', bg: '#F0FDF4' },
            { label: 'Total Sent',      value: stats?.totalSent   ?? 0, icon: CheckCircle, color: '#1A56A0', bg: '#EFF6FF' },
            { label: 'Failed',          value: stats?.totalFailed ?? 0, icon: AlertCircle, color: '#DC2626', bg: '#FFF1F2' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="stat-card">
              <div className="flex items-center gap-2 mb-2">
                <div style={{ width: 28, height: 28, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={13} style={{ color }} />
                </div>
                <span style={{ fontSize: '.68rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</span>
              </div>
              <p style={{ fontSize: '1.6rem', fontWeight: 800, color: label === 'Credits Left' && value === 0 ? '#DC2626' : '#0B1D3A', margin: 0, fontFamily: "'Playfair Display',serif" }}>
                {value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* Notification Toggles — full width */}
        <div className="card fade-up-2">
          <div className="card-header">
            <div style={{ width: 32, height: 32, borderRadius: 9, background: '#0B1D3A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={14} color="#C9963A" />
            </div>
            <span className="display font-bold text-[#0B1D3A]">Notification Settings</span>
          </div>
          <div className="card-body space-y-3">
            <div className="toggle-wrap" style={{ borderColor: settings?.enabled ? '#86EFAC' : '#E2E8F0', background: settings?.enabled ? '#F0FDF4' : '#FAFBFF' }}>
              <div>
                <p style={{ fontWeight: 700, color: '#0B1D3A', fontSize: '.9rem', margin: 0 }}>SMS Notifications</p>
                <p style={{ fontSize: '.75rem', margin: '.15rem 0 0' }}>
                  {settings?.enabled
                    ? <span style={{ color: '#16A34A', fontWeight: 600 }}>● Active — sending enabled</span>
                    : <span style={{ color: '#94A3B8' }}>○ Inactive — no SMS will be sent</span>}
                </p>
              </div>
              <button className="toggle-btn" onClick={handleToggle} disabled={saving}>
                {settings?.enabled ? <ToggleRight size={38} color="#16A34A" /> : <ToggleLeft size={38} color="#CBD5E1" />}
              </button>
            </div>

            <div className="toggle-wrap">
              <div>
                <p style={{ fontWeight: 600, color: '#0B1D3A', fontSize: '.88rem', margin: 0 }}>Notify on Absent</p>
                <p style={{ fontSize: '.72rem', color: '#94A3B8', margin: '.1rem 0 0' }}>SMS parent when student is absent</p>
              </div>
              <button className="toggle-btn" onClick={() => settings && saveSettings({ sendOnAbsent: !settings.sendOnAbsent })}>
                {settings?.sendOnAbsent ? <ToggleRight size={32} color="#C9963A" /> : <ToggleLeft size={32} color="#CBD5E1" />}
              </button>
            </div>

            <div className="toggle-wrap">
              <div>
                <p style={{ fontWeight: 600, color: '#0B1D3A', fontSize: '.88rem', margin: 0 }}>Notify on Present</p>
                <p style={{ fontSize: '.72rem', color: '#94A3B8', margin: '.1rem 0 0' }}>SMS parent when student arrives</p>
              </div>
              <button className="toggle-btn" onClick={() => settings && saveSettings({ sendOnPresent: !settings.sendOnPresent })}>
                {settings?.sendOnPresent ? <ToggleRight size={32} color="#C9963A" /> : <ToggleLeft size={32} color="#CBD5E1" />}
              </button>
            </div>

            {settings?.credits === 0 && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-600 px-3.5 py-2.5 rounded-xl text-xs font-medium">
                <Info size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                No credits remaining — purchase credits to send SMS
              </div>
            )}
            {(settings?.credits ?? 0) > 0 && (settings?.credits ?? 0) <= 10 && (
              <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 text-amber-700 px-3.5 py-2.5 rounded-xl text-xs font-medium">
                <Info size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                Low credits — only {settings?.credits} remaining
              </div>
            )}
          </div>
        </div>

        {/* Buy Credits */}
        <div className="card fade-up-3">
          <div className="card-header">
            <div style={{ width: 32, height: 32, borderRadius: 9, background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={14} color="#C9963A" />
            </div>
            <span className="display font-bold text-[#0B1D3A]">Buy Credits</span>
            <div className="ml-auto flex items-center gap-1.5">
              <span style={{ fontSize: '.72rem', color: '#94A3B8', fontWeight: 600 }}>Balance:</span>
              <span style={{ fontSize: '.9rem', fontWeight: 800, color: (settings?.credits ?? 0) > 0 ? '#16A34A' : '#DC2626' }}>
                {settings?.credits ?? 0} credits
              </span>
            </div>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {PACKAGES.map(pkg => (
                <div key={pkg.credits}
                  style={{ textAlign: 'center', padding: '1rem .75rem', borderRadius: 14, border: `1.5px solid ${pkg.popular ? '#C9963A' : '#E2E8F0'}`, background: pkg.popular ? '#FFFBEB' : '#FAFBFF', position: 'relative', cursor: 'pointer' }}
                  onClick={() => { setSelectedPkg(pkg); openPaystack(); }}>
                  {pkg.popular && (
                    <div style={{ position: 'absolute', top: -9, left: '50%', transform: 'translateX(-50%)', background: '#C9963A', color: '#0B1D3A', fontSize: '.58rem', fontWeight: 800, padding: '.1rem .5rem', borderRadius: 20, whiteSpace: 'nowrap' }}>
                      POPULAR
                    </div>
                  )}
                  <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: '1.3rem', color: '#0B1D3A', margin: '0 0 .15rem' }}>{pkg.credits}</p>
                  <p style={{ fontSize: '.65rem', color: '#94A3B8', margin: '0 0 .4rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>SMS</p>
                  <p style={{ fontSize: '.9rem', fontWeight: 800, color: pkg.popular ? '#C9963A' : '#0B1D3A', margin: 0 }}>₦{pkg.price.toLocaleString()}</p>
                  <p style={{ fontSize: '.65rem', color: '#94A3B8', margin: '.1rem 0 0' }}>₦15 per SMS</p>
                </div>
              ))}
            </div>
            <button onClick={openPaystack}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem', padding: '.9rem', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#00C3FF,#0080FF)', color: '#fff', fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: '.95rem', boxShadow: '0 5px 20px rgba(0,128,255,.3)' }}>
              <CreditCard size={16} /> Pay with Paystack
            </button>
            <p style={{ textAlign: 'center', fontSize: '.71rem', color: '#94A3B8', marginTop: '.65rem' }}>
              🔒 Secured by Paystack · Cards, Bank Transfer, USSD · Credits added instantly
            </p>
          </div>
        </div>

        {/* SMS Log */}
        <div className="card fade-up-3">
          <div className="card-header">
            <div style={{ width: 32, height: 32, borderRadius: 9, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={14} color="#6B7280" />
            </div>
            <span className="display font-bold text-[#0B1D3A]">Recent Activity</span>
            <button onClick={() => loadAll(token())}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', lineHeight: 0, padding: '.25rem' }}>
              <RefreshCw size={14} />
            </button>
          </div>
          {logs.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <MessageSquare size={32} color="#E2E8F0" style={{ margin: '0 auto .75rem' }} />
              <p style={{ color: '#94A3B8', fontSize: '.88rem' }}>No SMS activity yet</p>
            </div>
          ) : (
            <div>
              {logs.map(log => {
                const st = statusStyle(log.status);
                const isTopup = log.status === 'topup';
                return (
                  <div key={log.id} className="log-row">
                    <span className="status-pill" style={{ background: st.bg, color: st.color, marginTop: '.15rem' }}>{st.label}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '.82rem', color: '#0B1D3A', fontWeight: 600 }}>
                        {isTopup ? log.message : log.phone}
                      </p>
                      {!isTopup && (
                        <p style={{ margin: '.15rem 0 0', fontSize: '.75rem', color: '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {log.message}
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ margin: 0, fontSize: '.72rem', color: '#94A3B8' }}>
                        {new Date(log.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                      </p>
                      {!isTopup && <p style={{ margin: '.1rem 0 0', fontSize: '.7rem', color: '#DC2626', fontWeight: 600 }}>-1 cr</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <footer style={{ background: '#0B1D3A', borderTop: '1px solid rgba(201,150,58,.2)', marginTop: '3rem', padding: '1.25rem', textAlign: 'center' }}>
        <p style={{ color: '#475569', fontSize: '.78rem', margin: 0 }}>
          SMS Notifications · Payments via <span style={{ color: '#00C3FF', fontWeight: 600 }}>Paystack</span> · Credits never expire
        </p>
      </footer>

      {/* Paystack Modal */}
      {showPaystack && (
        <div className="ps-overlay" onClick={e => { if (e.target === e.currentTarget && paystackStep !== 'processing') closePaystack(); }}>
          <div className="ps-modal">
            <div className="ps-header">
              {paystackStep === 'select' && (
                <button onClick={closePaystack}
                  style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,.1)', border: 'none', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={13} color="#fff" />
                </button>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg,#00C3FF,#0080FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff', fontSize: '1.1rem', fontFamily: 'serif', flexShrink: 0 }}>P</div>
                <div>
                  <p style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', margin: 0 }}>Buy SMS Credits</p>
                  <p style={{ color: '#94A3B8', fontSize: '.72rem', margin: 0 }}>
                    {school?.email ? `Paying as ${school.email}` : 'Secure payment via Paystack'}
                  </p>
                </div>
              </div>
              {selectedPkg && paystackStep === 'select' && (
                <div style={{ marginTop: '1rem', background: 'rgba(255,255,255,.08)', borderRadius: 10, padding: '.6rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#94A3B8', fontSize: '.8rem' }}>{selectedPkg.credits} SMS Credits · {selectedPkg.label}</span>
                  <span style={{ color: '#C9963A', fontWeight: 800, fontSize: '1.05rem' }}>₦{selectedPkg.price.toLocaleString()}</span>
                </div>
              )}
            </div>

            {paystackStep === 'select' && (
              <div className="ps-body">
                <p style={{ fontSize: '.72rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '.85rem' }}>
                  Choose a Package · ₦15 per credit
                </p>
                {payError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '.65rem .9rem', borderRadius: 10, fontSize: '.8rem', marginBottom: '1rem' }}>
                    <AlertCircle size={13} style={{ flexShrink: 0 }} /> {payError}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.55rem', marginBottom: '1.25rem' }}>
                  {PACKAGES.map(pkg => (
                    <div key={pkg.credits}
                      className={`pkg-card ${pkg.popular ? 'popular' : ''} ${selectedPkg?.credits === pkg.credits ? 'selected' : ''}`}
                      onClick={() => setSelectedPkg(pkg)}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>
                          <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${selectedPkg?.credits === pkg.credits ? '#C9963A' : '#E2E8F0'}`, background: selectedPkg?.credits === pkg.credits ? '#C9963A' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {selectedPkg?.credits === pkg.credits && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                          </div>
                          <div>
                            <span style={{ fontWeight: 700, color: '#0B1D3A', fontSize: '.9rem' }}>{pkg.credits} SMS</span>
                            <span style={{ fontSize: '.72rem', color: '#94A3B8', marginLeft: '.4rem' }}>· {pkg.label}</span>
                          </div>
                        </div>
                        <span style={{ fontWeight: 800, color: selectedPkg?.credits === pkg.credits ? '#C9963A' : '#475569', fontSize: '.9rem' }}>
                          ₦{pkg.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {!school?.email && (
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '.4rem' }}>
                      Your Email (for Paystack receipt)
                    </label>
                    <input type="email" value={manualEmail} onChange={e => setManualEmail(e.target.value)}
                      placeholder="admin@yourschool.com"
                      style={{ width: '100%', padding: '.75rem 1rem', border: '1.5px solid #E2E8F0', borderRadius: 10, fontFamily: "'DM Sans',sans-serif", fontSize: '.88rem', color: '#0B1D3A', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                )}
                <button className="pay-btn" onClick={handlePay} disabled={!selectedPkg || !psScriptReady}>
                  {!psScriptReady
                    ? <><div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', animation: 'spin .7s linear infinite' }} /> Loading Paystack…</>
                    : <><Lock size={14} /> Pay ₦{selectedPkg?.price.toLocaleString() ?? '…'} with Paystack</>}
                </button>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.4rem', marginTop: '.65rem' }}>
                  <ShieldCheck size={12} color="#94A3B8" />
                  <span style={{ fontSize: '.7rem', color: '#94A3B8' }}>256-bit SSL · PCI DSS compliant · Cards, Bank Transfer, USSD</span>
                </div>
              </div>
            )}

            {paystackStep === 'processing' && (
              <div style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', border: '4px solid rgba(0,195,255,.15)', borderTopColor: '#00C3FF', animation: 'spin .8s linear infinite', margin: '0 auto 1.5rem' }} />
                <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '1.1rem', margin: '0 0 .4rem' }}>Verifying Payment…</p>
                <p style={{ color: '#94A3B8', fontSize: '.85rem', margin: 0 }}>Confirming with Paystack · Please wait</p>
              </div>
            )}

            {paystackStep === 'success' && (
              <div style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
                <div style={{ width: 70, height: 70, borderRadius: '50%', background: 'linear-gradient(135deg,#DCFCE7,#BBF7D0)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', boxShadow: '0 8px 28px rgba(22,163,74,.2)' }}>
                  <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                    <path d="M6 15l7 7 11-13" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      style={{ strokeDasharray: 55, strokeDashoffset: 0, animation: 'checkDraw .5s ease both' }} />
                  </svg>
                </div>
                <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, color: '#0B1D3A', fontSize: '1.25rem', margin: '0 0 .4rem' }}>Payment Verified! 🎉</p>
                <p style={{ color: '#64748B', fontSize: '.9rem', margin: '0 0 .3rem' }}>
                  <span style={{ fontWeight: 700, color: '#16A34A' }}>{selectedPkg?.credits} credits</span> added to your balance
                </p>
                <p style={{ color: '#94A3B8', fontSize: '.78rem', margin: '0 0 1.75rem' }}>
                  New balance: <span style={{ fontWeight: 700, color: '#0B1D3A' }}>{settings?.credits} credits</span>
                </p>
                <button onClick={closePaystack}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', padding: '.85rem 2.5rem', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#C9963A,#E8B85A)', color: '#0B1D3A', fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: '.92rem', boxShadow: '0 4px 16px rgba(201,150,58,.3)' }}>
                  <CheckCircle size={15} /> Done
                </button>
              </div>
            )}

            {paystackStep === 'failed' && (
              <div style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                  <X size={28} color="#DC2626" />
                </div>
                <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, color: '#0B1D3A', fontSize: '1.1rem', margin: '0 0 .4rem' }}>Verification Failed</p>
                <p style={{ color: '#DC2626', fontSize: '.85rem', margin: '0 0 1.5rem' }}>{payError}</p>
                <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center' }}>
                  <button onClick={() => { setPaystackStep('select'); setPayError(''); }}
                    style={{ padding: '.75rem 1.5rem', borderRadius: 11, border: '1.5px solid #E2E8F0', background: '#fff', color: '#0B1D3A', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: '.88rem', cursor: 'pointer' }}>
                    Try Again
                  </button>
                  <button onClick={closePaystack}
                    style={{ padding: '.75rem 1.5rem', borderRadius: 11, border: 'none', background: '#FEE2E2', color: '#DC2626', fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: '.88rem', cursor: 'pointer' }}>
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

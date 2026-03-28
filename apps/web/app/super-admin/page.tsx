'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield, School, Globe, CheckCircle, XCircle,
  LogOut, ToggleLeft, ToggleRight, Search, RefreshCw,
  MessageSquare, CreditCard, Plus, Eye, EyeOff, Save, Zap, X
} from 'lucide-react';

type SchoolRow = {
  id:        string;
  name:      string;
  subdomain: string;
  logoUrl:   string | null;
  isActive:  boolean;
  createdAt: string;
  smsCredits?: number;
  smsEnabled?: boolean;
};

type TermiiConfig = {
  apiKey:   string;
  senderId: string;
};

export default function SuperAdminPage() {
  const [schools, setSchools]         = useState<SchoolRow[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [togglingId, setTogglingId]   = useState<string | null>(null);
  const [query, setQuery]             = useState('');
  const [filter, setFilter]           = useState<'all' | 'active' | 'inactive'>('all');

  // Termii global config
  const [termiiConfig, setTermiiConfig] = useState<TermiiConfig>({ apiKey: '', senderId: 'SchoolApp' });
  const [showApiKey, setShowApiKey]     = useState(false);
  const [savingTermii, setSavingTermii] = useState(false);
  const [termiiMsg, setTermiiMsg]       = useState('');

  // Credit top-up modal
  const [topupModal, setTopupModal]   = useState<SchoolRow | null>(null);
  const [topupAmount, setTopupAmount] = useState('');
  const [topping, setTopping]         = useState(false);
  const [topupMsg, setTopupMsg]       = useState('');

  const router = useRouter();
  const API = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`;
  const token = () => localStorage.getItem('token') || '';

  useEffect(() => {
    const t = token();
    if (!t) { router.push('/login'); return; }
    fetchAll(t);
  }, [router]);

  const fetchAll = async (t: string) => {
    setLoading(true); setError(null);
    try {
      const [schoolsRes, termiiRes] = await Promise.all([
        fetch(`${API}/super-admin/schools`,        { headers: { Authorization: `Bearer ${t}` } }),
        fetch(`${API}/super-admin/termii-config`,  { headers: { Authorization: `Bearer ${t}` } }),
      ]);
      if (!schoolsRes.ok) throw new Error('Failed to fetch schools');
      const schoolsData: SchoolRow[] = await schoolsRes.json();

      // Fetch SMS credits for each school in parallel
      const withCredits = await Promise.all(
        schoolsData.map(async (s) => {
          try {
            const smsRes = await fetch(`${API}/super-admin/schools/${s.id}/sms-stats`, {
              headers: { Authorization: `Bearer ${t}` },
            });
            if (smsRes.ok) {
              const sms = await smsRes.json();
              return { ...s, smsCredits: sms.credits ?? 0, smsEnabled: sms.enabled ?? false };
            }
          } catch { /* ignore */ }
          return { ...s, smsCredits: 0, smsEnabled: false };
        })
      );
      setSchools(withCredits);

      if (termiiRes.ok) {
        const cfg = await termiiRes.json();
        setTermiiConfig({ apiKey: cfg.apiKey ? '••••' + cfg.apiKey.slice(-4) : '', senderId: cfg.senderId || 'SchoolApp' });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    setTogglingId(id);
    try {
      const res = await fetch(`${API}/super-admin/schools/${id}/toggle-active`, {
        method: 'PATCH', headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error('Failed to toggle');
      setSchools(prev => prev.map(s => s.id === id ? { ...s, isActive: !current } : s));
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setTogglingId(null);
    }
  };

  const saveTermiiConfig = async () => {
    setSavingTermii(true); setTermiiMsg('');
    try {
      const res = await fetch(`${API}/super-admin/termii-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify(termiiConfig),
      });
      if (!res.ok) throw new Error('Failed to save');
      setTermiiMsg('✓ Termii config saved');
      setTimeout(() => setTermiiMsg(''), 3000);
    } catch (err: any) {
      setTermiiMsg('✗ ' + err.message);
    } finally {
      setSavingTermii(false);
    }
  };

  const handleTopup = async () => {
    if (!topupModal) return;
    const amount = parseInt(topupAmount);
    if (!amount || amount < 1) { setTopupMsg('Enter a valid amount'); return; }
    setTopping(true); setTopupMsg('');
    try {
      const res = await fetch(`${API}/super-admin/schools/${topupModal.id}/sms-credits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ amount }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed'); }
      const data = await res.json();
      setSchools(prev => prev.map(s => s.id === topupModal.id ? { ...s, smsCredits: data.credits } : s));
      setTopupMsg(`✓ ${amount} credits added! New balance: ${data.credits}`);
      setTopupAmount('');
      setTimeout(() => { setTopupModal(null); setTopupMsg(''); }, 2000);
    } catch (err: any) {
      setTopupMsg('✗ ' + err.message);
    } finally {
      setTopping(false);
    }
  };

  const handleLogout = () => { localStorage.removeItem('token'); router.push('/login'); };

  const filtered = schools.filter(s => {
    const q = query.toLowerCase();
    const matchQ = s.name.toLowerCase().includes(q) || s.subdomain.toLowerCase().includes(q);
    const matchF = filter === 'all' || (filter === 'active' && s.isActive) || (filter === 'inactive' && !s.isActive);
    return matchQ && matchF;
  });

  const activeCount   = schools.filter(s => s.isActive).length;
  const inactiveCount = schools.filter(s => !s.isActive).length;
  const totalCredits  = schools.reduce((a, s) => a + (s.smsCredits ?? 0), 0);

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B1D3A' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap');
        @keyframes spin  { to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
      `}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', border: '3px solid rgba(201,150,58,.15)', borderTopColor: '#C9963A', animation: 'spin .8s linear infinite', margin: '0 auto 1.25rem' }} />
        <p style={{ color: '#94A3B8', fontFamily: "'DM Sans',sans-serif", fontSize: '.9rem', animation: 'pulse 1.8s ease infinite' }}>Loading…</p>
      </div>
    </div>
  );

  /* ── Error ── */
  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#F0EFE9', fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');`}</style>
      <div style={{ background: '#fff', borderRadius: 24, padding: '2.5rem', maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: '0 4px 28px rgba(11,29,58,.1)', border: '1px solid #FECDD3' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: 26 }}>⚠️</div>
        <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '1.2rem', marginBottom: '.5rem' }}>Failed to Load</p>
        <p style={{ color: '#94A3B8', fontSize: '.85rem', marginBottom: '1.5rem' }}>{error}</p>
        <button onClick={() => fetchAll(token())}
          style={{ background: '#0B1D3A', color: '#fff', border: 'none', borderRadius: 12, padding: '.75rem 2rem', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, cursor: 'pointer' }}>
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'DM Sans',sans-serif", background: '#F0EFE9', width: '100%', overflowX: 'hidden' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        @keyframes fadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes popIn   { 0%{opacity:0;transform:scale(.94)} 100%{opacity:1;transform:scale(1)} }

        .fade-up   { animation: fadeUp .5s ease both; }
        .fade-up-1 { animation: fadeUp .5s .08s ease both; }
        .fade-up-2 { animation: fadeUp .5s .16s ease both; }
        ${Array.from({length:30},(_,i)=>`.row-${i}{animation:fadeUp .4s ${.2+i*.04}s ease both;}`).join('')}

        .gold-shimmer {
          background:linear-gradient(90deg,#C9963A 0%,#F0C060 40%,#C9963A 60%,#E8B85A 100%);
          background-size:200% auto;
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;
          background-clip:text;animation:shimmer 4s linear infinite;
        }
        .hero-dot-grid {
          background-image:radial-gradient(circle,rgba(201,150,58,.13) 1px,transparent 1px);
          background-size:28px 28px;
        }
        .logout-btn {
          display:inline-flex;align-items:center;gap:.45rem;
          background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.13);
          color:#94A3B8;padding:.5rem 1rem;border-radius:10px;
          font-size:.83rem;font-weight:500;cursor:pointer;
          transition:all .2s;font-family:'DM Sans',sans-serif;
        }
        .logout-btn:hover{background:rgba(239,68,68,.12);border-color:rgba(239,68,68,.35);color:#FCA5A5;}

        .stat-card {
          background:#fff;border:1px solid #E2E8F0;border-radius:18px;
          padding:1.25rem 1.5rem;display:flex;align-items:center;gap:1rem;
          box-shadow:0 2px 12px rgba(11,29,58,.06);transition:transform .2s,box-shadow .2s;flex:1;
        }
        .stat-card:hover{transform:translateY(-2px);box-shadow:0 6px 22px rgba(11,29,58,.1);}

        .main-card {
          background:#fff;border:1px solid #E2E8F0;border-radius:22px;
          box-shadow:0 4px 22px rgba(11,29,58,.07);overflow:hidden;width:100%;
        }

        .toolbar {
          padding:1.1rem 1.5rem;border-bottom:1px solid #F1F5F9;
          display:flex;align-items:center;gap:1rem;flex-wrap:wrap;
        }
        .search-wrap{position:relative;flex:1;min-width:200px;}
        .search-icon{position:absolute;left:.9rem;top:50%;transform:translateY(-50%);color:#94A3B8;pointer-events:none;}
        .search-input{
          width:100%;padding:.7rem .9rem .7rem 2.5rem;
          border:1.5px solid #E2E8F0;border-radius:12px;
          font-family:'DM Sans',sans-serif;font-size:.85rem;color:#0B1D3A;
          background:#FAFAF8;outline:none;box-sizing:border-box;
          transition:border-color .2s,box-shadow .2s;
        }
        .search-input::placeholder{color:#CBD5E1;}
        .search-input:focus{border-color:#C9963A;box-shadow:0 0 0 3px rgba(201,150,58,.12);background:#fff;}

        .filter-btn{
          padding:.6rem 1rem;border-radius:10px;border:1.5px solid #E2E8F0;
          font-family:'DM Sans',sans-serif;font-size:.8rem;font-weight:600;cursor:pointer;
          background:#fff;color:#64748B;transition:all .15s;
        }
        .filter-btn.active-all    { background:#0B1D3A;color:#fff;border-color:#0B1D3A; }
        .filter-btn.active-active { background:#DCFCE7;color:#15803D;border-color:#86EFAC; }
        .filter-btn.active-inactive{ background:#FEE2E2;color:#B91C1C;border-color:#FCA5A5; }
        .filter-btn:not([class*="active-"]):hover{ border-color:#C9963A;color:#C9963A; }

        .schools-table{width:100%;border-collapse:collapse;}
        .schools-table thead th{
          padding:.85rem 1.25rem;text-align:left;
          font-size:.7rem;font-weight:600;color:#94A3B8;
          text-transform:uppercase;letter-spacing:.07em;
          background:#FAFAF8;border-bottom:1px solid #F1F5F9;white-space:nowrap;
        }
        .schools-table tbody tr{border-bottom:1px solid #F8FAFC;transition:background .15s;}
        .schools-table tbody tr:last-child{border-bottom:none;}
        .schools-table tbody tr:hover{background:#FAFAF8;}
        .schools-table tbody td{padding:.9rem 1.25rem;vertical-align:middle;}

        .toggle-btn{
          display:inline-flex;align-items:center;gap:.4rem;
          padding:.5rem 1rem;border:none;border-radius:10px;cursor:pointer;
          font-family:'DM Sans',sans-serif;font-size:.78rem;font-weight:700;
          transition:transform .15s,box-shadow .15s,opacity .15s;
        }
        .toggle-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,.15);}
        .toggle-btn:disabled{opacity:.6;cursor:not-allowed;}
        .toggle-btn.deactivate{background:#FEE2E2;color:#B91C1C;}
        .toggle-btn.activate  {background:#DCFCE7;color:#15803D;}

        .topup-btn{
          display:inline-flex;align-items:center;gap:.35rem;
          padding:.45rem .9rem;border:none;border-radius:9px;cursor:pointer;
          font-family:'DM Sans',sans-serif;font-size:.75rem;font-weight:700;
          background:#EFF6FF;color:#1D4ED8;transition:background .15s;
        }
        .topup-btn:hover{background:#DBEAFE;}

        .refresh-btn{
          display:inline-flex;align-items:center;gap:.4rem;
          padding:.6rem 1rem;border-radius:10px;
          border:1.5px solid #E2E8F0;background:#fff;
          font-family:'DM Sans',sans-serif;font-size:.8rem;font-weight:600;
          color:#64748B;cursor:pointer;transition:all .15s;
        }
        .refresh-btn:hover{border-color:#C9963A;color:#C9963A;background:rgba(201,150,58,.05);}

        /* Termii config card */
        .config-card{background:#fff;border:1px solid #E2E8F0;border-radius:22px;box-shadow:0 4px 22px rgba(11,29,58,.07);overflow:hidden;}
        .config-input{
          width:100%;padding:.8rem 1rem;box-sizing:border-box;
          font-family:'DM Sans',sans-serif;font-size:.88rem;
          border:1.5px solid #E2E8F0;border-radius:11px;
          background:#FAFBFF;color:#0B1D3A;outline:none;
          transition:border-color .2s,box-shadow .2s;
        }
        .config-input:focus{border-color:#C9963A;box-shadow:0 0 0 3px rgba(201,150,58,.12);background:#fff;}
        .config-input::placeholder{color:#A0AEC0;}

        /* Top-up modal */
        .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:60;padding:1rem;backdrop-filter:blur(4px);}
        .modal-box{background:#fff;border-radius:22px;width:100%;max-width:400px;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,.22);animation:popIn .25s ease both;}
        .modal-header{background:#0B1D3A;padding:1.25rem 1.5rem;display:flex;align-items:center;justify-content:space-between;}
        .modal-body{padding:1.5rem;}
        .modal-input{
          width:100%;padding:.85rem 1rem;box-sizing:border-box;
          font-family:'DM Sans',sans-serif;font-size:1rem;font-weight:600;
          border:2px solid #E2E8F0;border-radius:12px;
          background:#FAFBFF;color:#0B1D3A;outline:none;
          transition:border-color .2s,box-shadow .2s;
        }
        .modal-input:focus{border-color:#C9963A;box-shadow:0 0 0 3px rgba(201,150,58,.12);}
        .modal-input::placeholder{color:#A0AEC0;font-weight:400;}
        .modal-save{
          width:100%;padding:.9rem;border-radius:12px;border:none;cursor:pointer;
          background:linear-gradient(135deg,#0B1D3A,#1A3A6A);color:#fff;
          font-family:'DM Sans',sans-serif;font-weight:800;font-size:.92rem;
          display:flex;align-items:center;justify-content:center;gap:.5rem;
          box-shadow:0 4px 16px rgba(11,29,58,.25);transition:transform .15s,opacity .2s;
        }
        .modal-save:hover:not(:disabled){transform:translateY(-1px);}
        .modal-save:disabled{opacity:.65;cursor:not-allowed;}

        .gold-divider{height:1px;background:linear-gradient(90deg,transparent,rgba(201,150,58,.3),transparent);}
        .empty-row td{padding:3.5rem 1.25rem;text-align:center;}
      `}</style>

      {/* ══════════════ HEADER ══════════════ */}
      <header className="sticky top-0 z-20 fade-up"
        style={{ background: '#0B1D3A', borderBottom: '2px solid rgba(201,150,58,.5)' }}>
        <div style={{ padding: '.85rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: 'linear-gradient(135deg,#C9963A,#E8B85A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={16} color="#0B1D3A" />
            </div>
            <p style={{ fontFamily: "'Playfair Display',serif", color: '#fff', fontWeight: 700, fontSize: '.9rem' }}>
              Super Admin
            </p>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={14} /> <span>Logout</span>
          </button>
        </div>
      </header>

      {/* ══════════════ HERO ══════════════ */}
      <div className="relative overflow-hidden fade-up-1" style={{ background: '#0B1D3A' }}>
        <div className="absolute inset-0 hero-dot-grid" />
        <div className="absolute pointer-events-none" style={{ top: -80, right: -40, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,150,58,.13) 0%,transparent 65%)' }} />
        <div className="absolute pointer-events-none" style={{ bottom: -60, left: -30, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle,rgba(26,86,160,.2) 0%,transparent 65%)' }} />
        <div className="relative" style={{ padding: '2.25rem 2rem 1rem' }}>
          <p style={{ color: '#64748B', fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 500, marginBottom: '.5rem' }}>
            Platform Control
          </p>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.6rem,3vw,2.3rem)', fontWeight: 800, color: '#fff', lineHeight: 1.15 }}>
            <span className="gold-shimmer">Super Admin</span> Dashboard
          </h1>
          <p style={{ color: '#64748B', fontSize: '.85rem', marginTop: '.5rem' }}>Manage schools, SMS credits & Termii configuration.</p>
        </div>
        <div style={{ height: 24, background: 'linear-gradient(to bottom,transparent,#F0EFE9)' }} />
      </div>

      <main className="fade-up-2" style={{ flex: 1, padding: '2rem 2rem 3rem', width: '100%', boxSizing: 'border-box' }}>

        {/* ── Stats strip ── */}
        <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Schools',     value: schools.length,  icon: School,        color: '#1A56A0', bg: '#EBF4FF' },
            { label: 'Active Schools',    value: activeCount,     icon: CheckCircle,   color: '#059669', bg: '#DCFCE7' },
            { label: 'Inactive Schools',  value: inactiveCount,   icon: XCircle,       color: '#B91C1C', bg: '#FEE2E2' },
            { label: 'Total SMS Credits', value: totalCredits,    icon: MessageSquare, color: '#C9963A', bg: '#FFFBEB' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="stat-card">
              <div style={{ width: 46, height: 46, borderRadius: 13, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={22} color={color} />
              </div>
              <div>
                <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0B1D3A', lineHeight: 1.1 }}>{value}</p>
                <p style={{ fontSize: '.72rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', marginTop: '.1rem' }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Termii API Config card ── */}
        <div className="config-card" style={{ marginBottom: '2rem' }}>
          <div style={{ padding: '1.1rem 1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '.65rem', background: '#FAFBFF' }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={14} color="#1A56A0" />
            </div>
            <div>
              <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '1rem', margin: 0 }}>Termii API Configuration</p>
              <p style={{ color: '#94A3B8', fontSize: '.72rem', margin: 0 }}>Global SMS provider settings — applies to all schools on the platform</p>
            </div>
            {termiiMsg && (
              <span style={{ marginLeft: 'auto', fontSize: '.8rem', fontWeight: 600, color: termiiMsg.startsWith('✓') ? '#16A34A' : '#DC2626' }}>
                {termiiMsg}
              </span>
            )}
          </div>
          <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', fontSize: '.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '.4rem' }}>
                Termii API Key
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={termiiConfig.apiKey}
                  onChange={e => setTermiiConfig(p => ({ ...p, apiKey: e.target.value }))}
                  placeholder="Paste Termii API key…"
                  className="config-input"
                  style={{ paddingRight: '2.8rem' }}
                />
                <button onClick={() => setShowApiKey(!showApiKey)}
                  style={{ position: 'absolute', right: '.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', lineHeight: 0 }}>
                  {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <p style={{ fontSize: '.68rem', color: '#94A3B8', marginTop: '.3rem' }}>
                Get from <a href="https://termii.com" target="_blank" rel="noreferrer" style={{ color: '#C9963A' }}>termii.com</a> → Settings → API Keys
              </p>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '.4rem' }}>
                Sender ID
              </label>
              <input
                type="text"
                value={termiiConfig.senderId}
                onChange={e => setTermiiConfig(p => ({ ...p, senderId: e.target.value }))}
                placeholder="e.g. SchoolApp (max 11 chars)"
                maxLength={11}
                className="config-input"
              />
              <p style={{ fontSize: '.68rem', color: '#94A3B8', marginTop: '.3rem' }}>
                Must be registered on Termii. Max 11 chars.
              </p>
            </div>
            <button onClick={saveTermiiConfig} disabled={savingTermii}
              style={{ display: 'flex', alignItems: 'center', gap: '.45rem', padding: '.8rem 1.4rem', borderRadius: 11, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#C9963A,#E8B85A)', color: '#0B1D3A', fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: '.88rem', boxShadow: '0 4px 14px rgba(201,150,58,.3)', opacity: savingTermii ? .6 : 1, transition: 'opacity .2s,transform .15s', whiteSpace: 'nowrap' }}
              onMouseOver={e => { if (!savingTermii) e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = ''; }}>
              {savingTermii
                ? <><div style={{ width: 13, height: 13, borderRadius: '50%', border: '2px solid rgba(11,29,58,.2)', borderTopColor: '#0B1D3A', animation: 'spin .6s linear infinite' }} /> Saving…</>
                : <><Save size={13} /> Save Config</>}
            </button>
          </div>
        </div>

        {/* ── Schools Table ── */}
        <div className="main-card">
          <div className="toolbar">
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '1rem' }}>All Schools</p>
              <p style={{ color: '#94A3B8', fontSize: '.72rem', marginTop: '.1rem' }}>
                {filtered.length} of {schools.length} school{schools.length !== 1 ? 's' : ''} shown
              </p>
            </div>
            <div className="search-wrap">
              <Search size={14} className="search-icon" />
              <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search by name or subdomain…" className="search-input" />
            </div>
            <div style={{ display: 'flex', gap: '.5rem' }}>
              {(['all','active','inactive'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`filter-btn ${filter === f ? `active-${f}` : ''}`}>
                  {f === 'all' ? `All (${schools.length})` : f === 'active' ? `Active (${activeCount})` : `Inactive (${inactiveCount})`}
                </button>
              ))}
            </div>
            <button className="refresh-btn" onClick={() => fetchAll(token())}>
              <RefreshCw size={13} /> Refresh
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="schools-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: '1.5rem' }}>#</th>
                  <th>Logo</th>
                  <th>School Name</th>
                  <th>Subdomain</th>
                  <th>Registered</th>
                  <th>Status</th>
                  <th>SMS Credits</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr className="empty-row">
                    <td colSpan={8}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.75rem' }}>
                        <School size={36} color="#E2E8F0" />
                        <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '1rem' }}>
                          {query || filter !== 'all' ? 'No schools match' : 'No schools registered yet'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map((school, idx) => (
                  <tr key={school.id} className={`row-${Math.min(idx, 29)}`}>

                    <td style={{ paddingLeft: '1.5rem' }}>
                      <span style={{ width: 28, height: 28, borderRadius: 8, background: '#F1F5F9', color: '#94A3B8', fontSize: '.72rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        {idx + 1}
                      </span>
                    </td>

                    <td>
                      {school.logoUrl ? (
                        <img src={school.logoUrl} alt={school.name} style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover', border: '1px solid #E2E8F0' }} />
                      ) : (
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#0B1D3A,#1A3A6A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <School size={18} color="#C9963A" />
                        </div>
                      )}
                    </td>

                    <td>
                      <p style={{ fontWeight: 600, color: '#0B1D3A', fontSize: '.88rem' }}>{school.name}</p>
                      <p style={{ color: '#94A3B8', fontSize: '.73rem', marginTop: '.1rem' }}>ID: {school.id.slice(0, 8)}…</p>
                    </td>

                    <td>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', background: '#EBF4FF', borderRadius: 20, padding: '.25rem .75rem' }}>
                        <Globe size={11} color="#1A56A0" />
                        <span style={{ color: '#1A56A0', fontSize: '.78rem', fontWeight: 600 }}>{school.subdomain}</span>
                      </div>
                    </td>

                    <td>
                      <p style={{ color: '#64748B', fontSize: '.82rem' }}>
                        {new Date(school.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </td>

                    <td>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', padding: '.3rem .85rem', borderRadius: 20, background: school.isActive ? '#DCFCE7' : '#FEE2E2', border: `1px solid ${school.isActive ? '#86EFAC' : '#FCA5A5'}` }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: school.isActive ? '#16A34A' : '#DC2626', flexShrink: 0 }} />
                        <span style={{ fontSize: '.75rem', fontWeight: 700, color: school.isActive ? '#15803D' : '#B91C1C' }}>
                          {school.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>

                    {/* SMS Credits cell */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                        <span style={{
                          fontSize: '.82rem', fontWeight: 700,
                          color: (school.smsCredits ?? 0) === 0 ? '#DC2626' : (school.smsCredits ?? 0) < 10 ? '#CA8A04' : '#0B1D3A',
                        }}>
                          {school.smsCredits ?? 0}
                        </span>
                        {school.smsEnabled && (
                          <span style={{ fontSize: '.6rem', fontWeight: 700, background: '#DCFCE7', color: '#16A34A', padding: '.1rem .4rem', borderRadius: 20 }}>ON</span>
                        )}
                        <button className="topup-btn" onClick={() => { setTopupModal(school); setTopupAmount(''); setTopupMsg(''); }}>
                          <Plus size={11} /> Add
                        </button>
                      </div>
                    </td>

                    <td>
                      <button
                        onClick={() => toggleActive(school.id, school.isActive)}
                        disabled={togglingId === school.id}
                        className={`toggle-btn ${school.isActive ? 'deactivate' : 'activate'}`}>
                        {togglingId === school.id ? (
                          <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid currentColor', borderTopColor: 'transparent', animation: 'spin .6s linear infinite' }} />
                        ) : school.isActive ? (
                          <><ToggleLeft size={14} /> Deactivate</>
                        ) : (
                          <><ToggleRight size={14} /> Activate</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length > 0 && (
            <div style={{ padding: '.85rem 1.5rem', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.5rem' }}>
              <p style={{ color: '#94A3B8', fontSize: '.75rem' }}>
                Showing <span style={{ color: '#0B1D3A', fontWeight: 600 }}>{filtered.length}</span> schools
              </p>
              <div style={{ display: 'flex', gap: '.75rem' }}>
                <span style={{ background: '#DCFCE7', color: '#15803D', fontSize: '.72rem', fontWeight: 700, padding: '.2rem .65rem', borderRadius: 20 }}>{activeCount} active</span>
                <span style={{ background: '#FEE2E2', color: '#B91C1C', fontSize: '.72rem', fontWeight: 700, padding: '.2rem .65rem', borderRadius: 20 }}>{inactiveCount} inactive</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer style={{ background: '#0B1D3A', borderTop: '1px solid rgba(201,150,58,.15)', padding: '1.1rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.5rem' }}>
          <p style={{ color: '#475569', fontSize: '.75rem' }}>
            Super Admin · <span style={{ color: '#C9963A' }}>{schools.length} schools registered</span>
          </p>
          <p style={{ color: '#475569', fontSize: '.75rem' }}>
            Powered by <span style={{ color: '#C9963A', fontWeight: 600 }}>Klas School Management Platform</span>
          </p>
        </div>
      </footer>

      {/* ══════════════ CREDIT TOP-UP MODAL ══════════════ */}
      {topupModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setTopupModal(null); }}>
          <div className="modal-box">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(201,150,58,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageSquare size={15} color="#C9963A" />
                </div>
                <div>
                  <p style={{ color: '#fff', fontWeight: 700, fontSize: '.92rem', margin: 0 }}>Add SMS Credits</p>
                  <p style={{ color: '#64748B', fontSize: '.72rem', margin: 0 }}>{topupModal.name}</p>
                </div>
              </div>
              <button onClick={() => setTopupModal(null)}
                style={{ background: 'rgba(255,255,255,.08)', border: 'none', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={13} color="#94A3B8" />
              </button>
            </div>
            <div className="modal-body">
              {/* Current balance */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '.85rem 1rem', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '.8rem', color: '#64748B', fontWeight: 500 }}>Current balance</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: (topupModal.smsCredits ?? 0) > 0 ? '#0B1D3A' : '#DC2626' }}>
                  {topupModal.smsCredits ?? 0} credits
                </span>
              </div>

              {/* Amount input */}
              <label style={{ display: 'block', fontSize: '.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '.45rem' }}>
                Credits to Add
              </label>
              <input
                type="number" min={1} max={50000}
                value={topupAmount}
                onChange={e => setTopupAmount(e.target.value)}
                placeholder="e.g. 500"
                className="modal-input"
                style={{ marginBottom: '.75rem' }}
              />

              {/* Quick amounts */}
              <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '.7rem', color: '#94A3B8', fontWeight: 600, alignSelf: 'center' }}>Quick:</span>
                {[100, 250, 500, 1000, 2000].map(n => (
                  <button key={n} onClick={() => setTopupAmount(String(n))}
                    style={{ padding: '.3rem .75rem', borderRadius: 8, border: `1.5px solid ${topupAmount === String(n) ? '#C9963A' : '#E2E8F0'}`, background: topupAmount === String(n) ? '#FFFBEB' : '#fff', color: topupAmount === String(n) ? '#C9963A' : '#475569', fontSize: '.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", transition: 'all .12s' }}>
                    {n}
                  </button>
                ))}
              </div>

              {topupMsg && (
                <div style={{ marginBottom: '1rem', padding: '.7rem 1rem', borderRadius: 10, background: topupMsg.startsWith('✓') ? '#F0FDF4' : '#FFF1F2', border: `1px solid ${topupMsg.startsWith('✓') ? '#BBF7D0' : '#FECDD3'}`, color: topupMsg.startsWith('✓') ? '#16A34A' : '#DC2626', fontSize: '.82rem', fontWeight: 600 }}>
                  {topupMsg}
                </div>
              )}

              <button className="modal-save" disabled={topping || !topupAmount} onClick={handleTopup}>
                {topping
                  ? <><div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,.25)', borderTopColor: '#fff', animation: 'spin .6s linear infinite' }} /> Adding…</>
                  : <><CreditCard size={14} /> Add {topupAmount ? `${topupAmount} Credits` : 'Credits'} to {topupModal.name}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

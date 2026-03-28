'use client';
// Route: /dashboard/terms
// Place at: apps/web/app/dashboard/terms/page.tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar, Plus, Trash2, ArrowLeft, Check,
  AlertCircle, Pencil, X, Star, StarOff,
} from 'lucide-react';

interface AcademicTerm {
  id:        string;
  name:      string;
  session:   string;
  startDate: string;
  endDate:   string;
  isCurrent: boolean;
}

const TERM_NAMES = ['First Term', 'Second Term', 'Third Term'];

function sessionOptions(): string[] {
  const year = new Date().getFullYear();
  return [`${year - 1}/${year}`, `${year}/${year + 1}`, `${year + 1}/${year + 2}`];
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

function termStatus(t: AcademicTerm) {
  const now = new Date(), start = new Date(t.startDate), end = new Date(t.endDate);
  if (now < start) return 'upcoming';
  if (now > end)   return 'ended';
  return 'ongoing';
}

const statusStyle: Record<string, { bg: string; color: string; label: string }> = {
  upcoming: { bg: '#EBF4FF', color: '#1A56A0', label: 'Upcoming' },
  ongoing:  { bg: '#DCFCE7', color: '#15803D', label: 'Ongoing'  },
  ended:    { bg: '#F1F5F9', color: '#64748B', label: 'Ended'    },
};

export default function TermSettingsPage() {
  const router = useRouter();
const API    = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const token  = () => localStorage.getItem('token') || '';

  const [terms,   setTerms]   = useState<AcademicTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  const [showForm,  setShowForm]  = useState(false);
  const [editId,    setEditId]    = useState<string | null>(null);
  const [formName,  setFormName]  = useState(TERM_NAMES[0]!);
  const [formSess,  setFormSess]  = useState(sessionOptions()[0]!);
  const [formStart, setFormStart] = useState('');
  const [formEnd,   setFormEnd]   = useState('');
  const [formCurr,  setFormCurr]  = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/terms`, { headers: { Authorization: `Bearer ${token()}` } });
      if (r.ok) setTerms(await r.json());
    } finally { setLoading(false); }
  };

  const resetForm = () => {
    setEditId(null); setFormName(TERM_NAMES[0]!); setFormSess(sessionOptions()[0]!);
    setFormStart(''); setFormEnd(''); setFormCurr(false); setShowForm(false); setError('');
  };

  const openEdit = (t: AcademicTerm) => {
    setEditId(t.id); setFormName(t.name); setFormSess(t.session);
    setFormStart(t.startDate.slice(0, 10)); setFormEnd(t.endDate.slice(0, 10));
    setFormCurr(t.isCurrent); setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!formStart || !formEnd) { setError('Please fill in start and end dates.'); return; }
    if (new Date(formEnd) <= new Date(formStart)) { setError('End date must be after start date.'); return; }
    setError(''); setSaving(true);
    try {
      const r = await fetch(editId ? `${API}/terms/${editId}` : `${API}/terms`, {
        method:  editId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body:    JSON.stringify({ name: formName, session: formSess, startDate: formStart, endDate: formEnd, isCurrent: formCurr }),
      });
      if (!r.ok) { const e = await r.json(); throw new Error(e.error || 'Failed'); }
      setSuccess(editId ? 'Term updated!' : 'Term created!');
      setTimeout(() => setSuccess(''), 3500);
      resetForm(); load();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const setAsCurrent = async (t: AcademicTerm) => {
    await fetch(`${API}/terms/${t.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ isCurrent: true }),
    });
    setSuccess(`"${t.name} ${t.session}" is now the active term.`);
    setTimeout(() => setSuccess(''), 3500);
    load();
  };

  const deleteTerm = async (id: string) => {
    if (!confirm('Delete this term? Past exam scores are not affected.')) return;
    await fetch(`${API}/terms/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    load();
  };

  const grouped = terms.reduce<Record<string, AcademicTerm[]>>((acc, t) => {
    if (!acc[t.session]) acc[t.session] = [];
    acc[t.session]!.push(t);
    return acc;
  }, {});

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: '#F0EFE9', fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .fade-up   { animation:fadeUp .4s ease both; }
        .fade-up-1 { animation:fadeUp .4s .07s ease both; }
        .fade-up-2 { animation:fadeUp .4s .14s ease both; }
        .card { background:#fff;border:1px solid #E2E8F0;border-radius:18px;box-shadow:0 2px 14px rgba(11,29,58,.06); }
        .form-input { width:100%;padding:.72rem 1rem;border:1.5px solid #E2E8F0;border-radius:11px;font-family:'DM Sans',sans-serif;font-size:.88rem;color:#0B1D3A;background:#FAFBFF;outline:none;transition:border-color .2s,box-shadow .2s;box-sizing:border-box; }
        .form-input:focus { border-color:#C9963A;box-shadow:0 0 0 3px rgba(201,150,58,.12); }
        .term-row { border:1.5px solid #E8EDF3;border-radius:14px;padding:1rem 1.25rem;background:#fff;transition:box-shadow .2s,border-color .2s; }
        .term-row:hover { box-shadow:0 4px 16px rgba(11,29,58,.08);border-color:rgba(201,150,58,.3); }
        .icon-btn { background:none;border:none;cursor:pointer;padding:.3rem;border-radius:7px;line-height:0;transition:background .15s; }
        .icon-btn:hover { background:#F1F5F9; }
        .overlay { position:fixed;inset:0;background:rgba(11,29,58,.45);backdrop-filter:blur(3px);z-index:40;animation:fadeIn .2s ease; }
        .modal { position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:50;width:min(520px,95vw);animation:fadeUp .3s ease; }
        .gold-btn { display:flex;align-items:center;justify-content:center;gap:.45rem;padding:.8rem 1.5rem;border:none;border-radius:12px;cursor:pointer;background:linear-gradient(135deg,#C9963A,#E8B85A);color:#0B1D3A;font-family:'DM Sans',sans-serif;font-size:.88rem;font-weight:700;transition:transform .15s,opacity .2s; }
        .gold-btn:hover:not(:disabled) { transform:translateY(-1px); }
        .gold-btn:disabled { opacity:.6;cursor:not-allowed; }
        .toggle-knob { position:absolute;top:3px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.2);transition:left .2s; }
      `}</style>

      {/* Modal */}
      {showForm && (
        <>
          <div className="overlay" onClick={resetForm} />
          <div className="modal">
            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: '1.1rem', color: '#0B1D3A', margin: 0 }}>
                  {editId ? 'Edit Term' : 'Add New Term'}
                </p>
                <button onClick={resetForm} className="icon-btn"><X size={18} color="#94A3B8" /></button>
              </div>
              {error && (
                <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: 10, padding: '.7rem .9rem', marginBottom: '1rem', color: '#BE123C', fontSize: '.82rem', display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                  <AlertCircle size={14} /> {error}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.85rem', marginBottom: '.85rem' }}>
                {[
                  { label: 'Term Name',        el: <select className="form-input" value={formName} onChange={e => setFormName(e.target.value)}>{TERM_NAMES.map(n => <option key={n}>{n}</option>)}</select> },
                  { label: 'Academic Session', el: <select className="form-input" value={formSess} onChange={e => setFormSess(e.target.value)}>{sessionOptions().map(s => <option key={s}>{s}</option>)}</select> },
                  { label: 'Start Date',       el: <input type="date" className="form-input" value={formStart} onChange={e => setFormStart(e.target.value)} /> },
                  { label: 'End Date',         el: <input type="date" className="form-input" value={formEnd}  onChange={e => setFormEnd(e.target.value)}  /> },
                ].map(({ label, el }) => (
                  <div key={label}>
                    <label style={{ display: 'block', fontSize: '.68rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.35rem' }}>{label}</label>
                    {el}
                  </div>
                ))}
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '.6rem', cursor: 'pointer', marginBottom: '1.25rem', userSelect: 'none' }}>
                <div style={{ width: 40, height: 22, borderRadius: 20, background: formCurr ? '#0B1D3A' : '#E2E8F0', position: 'relative', flexShrink: 0, cursor: 'pointer' }}
                  onClick={() => setFormCurr(v => !v)}>
                  <div className="toggle-knob" style={{ left: formCurr ? '21px' : '3px' }} />
                </div>
                <span style={{ fontSize: '.85rem', color: '#334155', fontWeight: 500 }}>Set as current active term</span>
              </label>
              <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end' }}>
                <button onClick={resetForm} style={{ padding: '.75rem 1.25rem', border: '1.5px solid #E2E8F0', borderRadius: 11, background: '#fff', color: '#64748B', fontFamily: "'DM Sans',sans-serif", fontSize: '.85rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSubmit} disabled={saving} className="gold-btn">
                  {saving ? 'Saving…' : <><Check size={14} /> {editId ? 'Update Term' : 'Create Term'}</>}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Header */}
      <header style={{ background: '#0B1D3A', borderBottom: '2px solid rgba(201,150,58,.5)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ padding: '.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#C9963A,#E8B85A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={15} color="#0B1D3A" />
            </div>
            <span style={{ fontFamily: "'Playfair Display',serif", color: '#fff', fontWeight: 700, fontSize: '.9rem' }}>Academic Term Settings</span>
          </div>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', color: '#C9963A', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.35rem', fontSize: '.82rem', fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>
            <ArrowLeft size={14} /> Dashboard
          </button>
        </div>
      </header>

      {/* Hero */}
      <div style={{ background: '#0B1D3A', position: 'relative', overflow: 'hidden' }} className="fade-up">
        <div style={{ backgroundImage: 'radial-gradient(circle,rgba(201,150,58,.13) 1px,transparent 1px)', backgroundSize: '28px 28px', position: 'absolute', inset: 0 }} />
        <div style={{ padding: '2rem 1.5rem 1rem', position: 'relative' }}>
          <p style={{ color: '#64748B', fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 500, marginBottom: '.4rem' }}>Settings</p>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.5rem,3vw,2.1rem)', fontWeight: 800, color: '#fff', margin: 0 }}>
            Academic Terms
          </h1>
          <p style={{ color: '#64748B', fontSize: '.83rem', marginTop: '.35rem' }}>
            Add terms with start &amp; end dates. All score entry pages pull terms from here — no more hardcoding.
          </p>
        </div>
        <div style={{ height: 22, background: 'linear-gradient(to bottom,transparent,#F0EFE9)' }} />
      </div>

      <main style={{ padding: '1.5rem', maxWidth: 780, margin: '0 auto' }}>
        {success && (
          <div style={{ background: '#ECFDF5', border: '1.5px solid #6EE7B7', borderRadius: 12, padding: '.75rem 1rem', marginBottom: '1.25rem', color: '#065F46', fontSize: '.85rem', fontWeight: 600, display: 'flex', gap: '.5rem', alignItems: 'center' }}>
            <Check size={14} /> {success}
          </div>
        )}

        <div className="fade-up-1" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="gold-btn">
            <Plus size={15} /> Add New Term
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8', fontSize: '.9rem' }}>Loading terms…</div>
        ) : terms.length === 0 ? (
          <div className="card fade-up-2" style={{ padding: '3rem', textAlign: 'center' }}>
            <Calendar size={40} color="#E2E8F0" style={{ margin: '0 auto .75rem' }} />
            <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '1.1rem', marginBottom: '.4rem' }}>No Terms Yet</p>
            <p style={{ color: '#94A3B8', fontSize: '.85rem', marginBottom: '1.5rem' }}>Add your first academic term. Teachers will see it when entering exam scores.</p>
            <button onClick={() => setShowForm(true)} className="gold-btn" style={{ margin: '0 auto' }}>
              <Plus size={15} /> Add First Term
            </button>
          </div>
        ) : (
          Object.entries(grouped)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([session, sessionTerms]) => (
              <div key={session} className="fade-up-2" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.85rem' }}>
                  <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, color: '#0B1D3A', fontSize: '1rem', margin: 0 }}>{session} Session</p>
                  <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,#E2E8F0,transparent)' }} />
                  <span style={{ fontSize: '.72rem', color: '#94A3B8', fontWeight: 600 }}>{sessionTerms.length} term{sessionTerms.length !== 1 ? 's' : ''}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
                  {sessionTerms.map(t => {
                    const st = termStatus(t);
                    const ss = statusStyle[st]!;
                    return (
                      <div key={t.id} className="term-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                          <div style={{ width: 38, height: 38, borderRadius: 10, background: t.isCurrent ? 'linear-gradient(135deg,#C9963A,#E8B85A)' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {t.isCurrent ? <Star size={17} color="#0B1D3A" fill="#0B1D3A" /> : <StarOff size={17} color="#CBD5E1" />}
                          </div>
                          <div style={{ flex: 1, minWidth: 140 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
                              <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '.95rem', margin: 0 }}>{t.name}</p>
                              {t.isCurrent && <span style={{ background: '#0B1D3A', color: '#E8B85A', fontSize: '.65rem', fontWeight: 700, padding: '.18rem .6rem', borderRadius: 20 }}>ACTIVE</span>}
                              <span style={{ background: ss.bg, color: ss.color, fontSize: '.65rem', fontWeight: 700, padding: '.18rem .6rem', borderRadius: 20 }}>{ss.label}</span>
                            </div>
                            <p style={{ color: '#94A3B8', fontSize: '.75rem', marginTop: '.2rem' }}>{fmt(t.startDate)} — {fmt(t.endDate)}</p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '.35rem' }}>
                            {!t.isCurrent && (
                              <button onClick={() => setAsCurrent(t)}
                                style={{ display: 'flex', alignItems: 'center', gap: '.3rem', padding: '.45rem .8rem', borderRadius: 9, border: '1.5px solid #E2E8F0', background: '#fff', color: '#64748B', fontSize: '.75rem', fontWeight: 600, fontFamily: "'DM Sans',sans-serif", cursor: 'pointer' }}
                                onMouseOver={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor='#C9963A'; b.style.color='#C9963A'; }}
                                onMouseOut={e =>  { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor='#E2E8F0';  b.style.color='#64748B'; }}>
                                <Star size={12} /> Set Active
                              </button>
                            )}
                            <button onClick={() => openEdit(t)} className="icon-btn" title="Edit"><Pencil size={14} color="#94A3B8" /></button>
                            <button onClick={() => deleteTerm(t.id)} className="icon-btn" title="Delete"><Trash2 size={14} color="#CBD5E1" /></button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
        )}
      </main>
    </div>
  );
}

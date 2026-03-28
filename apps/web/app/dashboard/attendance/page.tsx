'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, CalendarDays, Users, Search,
  ChevronLeft, ChevronRight, Check, X, Clock,
  BookOpen, TrendingUp,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ClassItem  { id: string; name: string; studentCount?: number; }
interface AttRecord  { studentId: string; studentName: string; status: 'PRESENT' | 'ABSENT' | 'LATE'; subject?: string; }
interface DaySummary { date: string; presentCount: number; absentCount: number; lateCount: number; subject: string; total: number; }

const fmt        = (d: Date) => d.toISOString().split('T')[0]!;
const today      = fmt(new Date());
const parseLocal = (ds: string) => { const [y,m,d] = ds.split('-').map(Number); return new Date(y!,m!-1,d!); };

export default function AdminAttendancePage() {
  const router = useRouter();
  const token  = () => localStorage.getItem('token') || '';

  const [classes,  setClasses]  = useState<ClassItem[]>([]);
  const [selClass, setSelClass] = useState<ClassItem | null>(null);
  const [query,    setQuery]    = useState('');
  const [clsLoad,  setClsLoad]  = useState(true);
  const [tab,      setTab]      = useState<'day' | 'month'>('day');

  const [date,    setDate]    = useState(today);
  const [records, setRecords] = useState<AttRecord[]>([]);
  const [recLoad, setRecLoad] = useState(false);
  const [noRecord,setNoRecord]= useState(false);

  const [monthYear, setMonthYear] = useState(() => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}`; });
  const [summary,   setSummary]   = useState<DaySummary[]>([]);
  const [sumLoad,   setSumLoad]   = useState(false);

  useEffect(() => {
    const t = token();
    if (!t) { router.push('/school-login'); return; }
    fetch(`${API}/classes`, { headers: { Authorization: `Bearer ${t}` } })
      .then(r => r.ok ? r.json() : [])
      .then(d => setClasses(d))
      .finally(() => setClsLoad(false));
  }, []);

  const loadDay = useCallback(async (classId: string, d: string) => {
    setRecLoad(true); setNoRecord(false); setRecords([]);
    try {
      const res = await fetch(`${API}/attendance?classId=${classId}&date=${d}`, { headers: { Authorization: `Bearer ${token()}` } });
      if (res.ok) { const data = await res.json(); if (data.length === 0) setNoRecord(true); else setRecords(data); }
    } catch { /**/ }
    setRecLoad(false);
  }, []);

  const loadMonth = useCallback(async (classId: string, my: string) => {
    setSumLoad(true); setSummary([]);
    try {
      const res = await fetch(`${API}/attendance/monthly?classId=${classId}&month=${my}`, { headers: { Authorization: `Bearer ${token()}` } });
      if (res.ok) setSummary(await res.json());
    } catch { /**/ }
    setSumLoad(false);
  }, []);

  useEffect(() => {
    if (!selClass) return;
    if (tab === 'day')   loadDay(selClass.id, date);
    if (tab === 'month') loadMonth(selClass.id, monthYear);
  }, [selClass, date, tab, monthYear]);

  const changeDate = (delta: number) => {
    const d = parseLocal(date); d.setDate(d.getDate() + delta);
    const next = fmt(d); if (next > today) return; setDate(next);
  };

  const changeMonth = (delta: number) => {
    const [y, m] = monthYear.split('-').map(Number);
    const d = new Date(y!, m! - 1 + delta, 1);
    const now = new Date(); if (d > now) return;
    setMonthYear(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`);
  };

  const presentCount = records.filter(r => r.status === 'PRESENT').length;
  const absentCount  = records.filter(r => r.status === 'ABSENT').length;
  const lateCount    = records.filter(r => r.status === 'LATE').length;
  const pct = records.length ? Math.round((presentCount / records.length) * 100) : 0;
  const filteredClasses = classes.filter(c => c.name?.toLowerCase().includes(query.toLowerCase()));

  if (clsLoad) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B1D3A' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid rgba(201,150,58,.15)', borderTopColor: '#C9963A', animation: 'spin .8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', width: '100%', overflowX: 'hidden', display: 'flex', flexDirection: 'column', fontFamily: "'DM Sans',sans-serif", background: '#F0EFE9' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        .fade-up   { animation:fadeUp .5s ease both; }
        .fade-up-1 { animation:fadeUp .5s .08s ease both; }
        .gold-shimmer { background:linear-gradient(90deg,#C9963A 0%,#F0C060 40%,#C9963A 60%,#E8B85A 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 4s linear infinite; }
        .dot-grid  { position:absolute;inset:0;background-image:radial-gradient(circle,rgba(201,150,58,.13) 1px,transparent 1px);background-size:28px 28px; }
        .card { background:#fff;border:1px solid #E2E8F0;border-radius:18px;box-shadow:0 2px 12px rgba(11,29,58,.06); }
        .class-card { background:#fff;border:1.5px solid #E2E8F0;border-radius:16px;padding:1.2rem;cursor:pointer;transition:box-shadow .2s,transform .2s,border-color .2s; }
        .class-card:hover { box-shadow:0 10px 28px rgba(11,29,58,.1);transform:translateY(-3px);border-color:#C9963A; }
        .date-nav { background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);color:#fff;width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s;flex-shrink:0; }
        .date-nav:hover:not(:disabled) { background:rgba(255,255,255,.18); }
        .date-nav:disabled { opacity:.3;cursor:not-allowed; }
        .date-input { padding:.5rem .85rem;border:1.5px solid rgba(255,255,255,.18);border-radius:9px;font-family:'DM Sans',sans-serif;font-size:.83rem;color:#fff;background:rgba(255,255,255,.1);outline:none;min-width:0;flex:1;max-width:180px; }
        .date-input::-webkit-calendar-picker-indicator { filter:invert(1) opacity(.6);cursor:pointer; }
        .tab-btn { flex:1;padding:.6rem;border:none;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:.82rem;font-weight:600;cursor:pointer;transition:all .15s; }
        .tab-btn.active { background:#0B1D3A;color:#fff; }
        .tab-btn:not(.active) { background:transparent;color:#64748B; }
        .search-input { width:100%;padding:.65rem .9rem .65rem 2.4rem;border:1.5px solid #E2E8F0;border-radius:11px;font-family:'DM Sans',sans-serif;font-size:.84rem;color:#0B1D3A;background:#fff;outline:none;box-sizing:border-box;transition:border-color .2s; }
        .search-input:focus { border-color:#C9963A; }
        .tbl { width:100%;border-collapse:collapse; }
        .tbl thead th { padding:.7rem 1rem;font-size:.67rem;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:.07em;background:#FAFAF8;border-bottom:1px solid #F1F5F9;text-align:left; }
        .tbl tbody tr { border-bottom:1px solid #F8FAFC; }
        .tbl tbody tr:last-child { border-bottom:none; }
        .tbl tbody tr:hover { background:#FAFAF8; }
        .tbl tbody td { padding:.7rem 1rem;font-size:.86rem; }
        .pill-p { background:#DCFCE7;color:#15803D; }
        .pill-a { background:#FEE2E2;color:#B91C1C; }
        .pill-l { background:#FEF9C3;color:#A16207; }
        .month-row { padding:.75rem 1rem;border-bottom:1px solid #F8FAFC;display:flex;align-items:center;justify-content:space-between;gap:.75rem;cursor:pointer;flex-wrap:wrap; }
        .month-row:last-child { border-bottom:none; }
        .month-row:hover { background:#FAFAF8; }
        .gold-divider { height:1px;background:linear-gradient(90deg,transparent,rgba(201,150,58,.3),transparent); }
        .back-btn { display:flex;align-items:center;gap:.35rem;color:#C9963A;background:none;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:600;font-size:.82rem; }

        /* Day view: sidebar below table on mobile */
        .day-layout { display:grid;grid-template-columns:1fr 220px;gap:1.1rem;align-items:start; }
        @media(max-width:768px) {
          .day-layout { grid-template-columns:1fr; }
          .tbl thead { display:none; }
          .tbl, .tbl tbody, .tbl tr, .tbl td { display:block;width:100%; }
          .tbl tr { padding:.85rem 1rem;border-bottom:1px solid #F1F5F9; }
          .tbl td { padding:.2rem 0;border:none; }
          .tbl td::before { content:attr(data-label);font-size:.62rem;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:.07em;display:block;margin-bottom:.15rem; }
          .month-row { flex-direction:column;align-items:flex-start; }
        }
      `}</style>

      {/* Header */}
      <header className="fade-up" style={{ background: '#0B1D3A', borderBottom: '2px solid rgba(201,150,58,.5)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ padding: '.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.7rem', minWidth: 0 }}>
            {selClass && (
              <button onClick={() => { setSelClass(null); setRecords([]); setSummary([]); }}
                style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(255,255,255,.15)', background: 'rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                <ArrowLeft size={14} color="#fff" />
              </button>
            )}
            <div style={{ width: 30, height: 30, borderRadius: 9, background: 'linear-gradient(135deg,#C9963A,#E8B85A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CalendarDays size={14} color="#0B1D3A" />
            </div>
            <p style={{ fontFamily: "'Playfair Display',serif", color: '#fff', fontWeight: 700, fontSize: '.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {selClass ? `Attendance — ${selClass.name}` : 'Attendance'}
            </p>
          </div>
          <button onClick={() => router.push('/dashboard')} className="back-btn" style={{ flexShrink: 0 }}>
            <ArrowLeft size={13} /> Dashboard
          </button>
        </div>
      </header>

      {/* Hero */}
      <div className="fade-up-1" style={{ background: '#0B1D3A', position: 'relative', overflow: 'hidden' }}>
        <div className="dot-grid" />
        <div style={{ padding: '1.75rem 1.25rem 1rem', position: 'relative' }}>
          <p style={{ color: '#64748B', fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 500, marginBottom: '.35rem' }}>Admin View</p>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.5rem,4vw,2.1rem)', fontWeight: 800, color: '#fff', lineHeight: 1.15 }}>
            {selClass ? <span className="gold-shimmer">{selClass.name}</span> : <>Attendance <span className="gold-shimmer">Reports</span></>}
          </h1>

          {selClass && (
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
              <div style={{ display: 'flex', background: 'rgba(255,255,255,.08)', borderRadius: 12, padding: '.2rem', width: 'fit-content', gap: '.2rem' }}>
                <button className={`tab-btn ${tab === 'day' ? 'active' : ''}`} onClick={() => setTab('day')} style={{ minWidth: 85 }}>By Date</button>
                <button className={`tab-btn ${tab === 'month' ? 'active' : ''}`} onClick={() => setTab('month')} style={{ minWidth: 95 }}>Monthly</button>
              </div>

              {tab === 'day' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', flexWrap: 'wrap' }}>
                  <button className="date-nav" onClick={() => changeDate(-1)}><ChevronLeft size={14} /></button>
                  <input type="date" max={today} value={date} onChange={e => { if (e.target.value <= today) setDate(e.target.value); }} className="date-input" />
                  <button className="date-nav" onClick={() => changeDate(1)} disabled={date >= today}><ChevronRight size={14} /></button>
                  {date !== today && (
                    <button onClick={() => setDate(today)} style={{ padding: '.35rem .7rem', borderRadius: 7, border: '1px solid rgba(201,150,58,.4)', background: 'rgba(201,150,58,.12)', color: '#C9963A', fontSize: '.72rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Today</button>
                  )}
                </div>
              )}
              {tab === 'month' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                  <button className="date-nav" onClick={() => changeMonth(-1)}><ChevronLeft size={14} /></button>
                  <input type="month" max={`${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`} value={monthYear} onChange={e => setMonthYear(e.target.value)} className="date-input" />
                  <button className="date-nav" onClick={() => changeMonth(1)} disabled={monthYear >= `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`}><ChevronRight size={14} /></button>
                </div>
              )}
            </div>
          )}
        </div>
        <div style={{ height: 22, background: 'linear-gradient(to bottom,transparent,#F0EFE9)' }} />
      </div>

      <main style={{ flex: 1, padding: '1.5rem 1.25rem 3rem' }}>

        {/* Pick class */}
        {!selClass && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem', gap: '1rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: '1.05rem', color: '#0B1D3A', margin: 0 }}>Select a Class</h2>
              <div style={{ position: 'relative', width: 220 }}>
                <Search size={13} style={{ position: 'absolute', left: '.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search classes…" className="search-input" />
              </div>
            </div>
            <div className="gold-divider" style={{ marginBottom: '1.25rem' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '.9rem' }}>
              {filteredClasses.map(cls => (
                <div key={cls.id} onClick={() => setSelClass(cls)} className="class-card">
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: '#EBF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '.8rem' }}>
                    <BookOpen size={19} color="#1A56A0" />
                  </div>
                  <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, color: '#0B1D3A', fontSize: '.93rem', marginBottom: '.25rem' }}>{cls.name}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                    <Users size={11} color="#94A3B8" />
                    <p style={{ color: '#94A3B8', fontSize: '.73rem', margin: 0 }}>{cls.studentCount || 0} students</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Day view */}
        {selClass && tab === 'day' && (
          <div className="day-layout">
            {/* Records table */}
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '.85rem 1rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.5rem' }}>
                <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '.88rem', margin: 0 }}>
                  {parseLocal(date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                {records.length > 0 && (
                  <div style={{ display: 'flex', gap: '.35rem', flexWrap: 'wrap' }}>
                    {[{ l: `${presentCount}P`, c: '#15803D', bg: '#DCFCE7' }, { l: `${absentCount}A`, c: '#B91C1C', bg: '#FEE2E2' }, { l: `${lateCount}L`, c: '#A16207', bg: '#FEF9C3' }].map(({ l, c, bg }) => (
                      <span key={l} style={{ background: bg, color: c, fontSize: '.68rem', fontWeight: 700, padding: '.18rem .55rem', borderRadius: 20 }}>{l}</span>
                    ))}
                    <span style={{ background: '#F1F5F9', color: '#64748B', fontSize: '.68rem', fontWeight: 700, padding: '.18rem .55rem', borderRadius: 20 }}>{pct}% present</span>
                  </div>
                )}
              </div>

              {recLoad ? (
                <div style={{ padding: '2.5rem', textAlign: 'center' }}><div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid rgba(201,150,58,.15)', borderTopColor: '#C9963A', animation: 'spin .7s linear infinite', margin: '0 auto' }} /></div>
              ) : noRecord ? (
                <div style={{ padding: '3rem', textAlign: 'center' }}>
                  <CalendarDays size={34} color="#E2E8F0" style={{ margin: '0 auto .75rem' }} />
                  <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', marginBottom: '.35rem' }}>No attendance recorded</p>
                  <p style={{ color: '#94A3B8', fontSize: '.82rem' }}>No attendance was taken for this class on this date.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="tbl">
                    <thead><tr><th>#</th><th>Student</th><th>Status</th><th>Subject</th></tr></thead>
                    <tbody>
                      {records.map((r, i) => (
                        <tr key={r.studentId}>
                          <td data-label="#" style={{ color: '#94A3B8', fontSize: '.75rem' }}>{i + 1}</td>
                          <td data-label="Student" style={{ fontWeight: 600, color: '#0B1D3A' }}>{r.studentName}</td>
                          <td data-label="Status">
                            <span className={`pill-${r.status === 'PRESENT' ? 'p' : r.status === 'ABSENT' ? 'a' : 'l'}`}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem', padding: '.22rem .65rem', borderRadius: 20, fontSize: '.74rem', fontWeight: 700 }}>
                              {r.status === 'PRESENT' ? <><Check size={10} /> Present</> : r.status === 'ABSENT' ? <><X size={10} /> Absent</> : <><Clock size={10} /> Late</>}
                            </span>
                          </td>
                          <td data-label="Subject" style={{ color: '#64748B', fontSize: '.8rem' }}>{r.subject || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Summary sidebar */}
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '.85rem 1rem', borderBottom: '1px solid #F1F5F9' }}>
                <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '.88rem', margin: 0 }}>📊 Summary</p>
              </div>
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '.55rem' }}>
                {records.length === 0 ? (
                  <p style={{ color: '#94A3B8', fontSize: '.8rem', textAlign: 'center', padding: '.5rem 0' }}>No data for this date</p>
                ) : (
                  <>
                    {[
                      { label: 'Total',   value: records.length, color: '#1A56A0', bg: '#EBF4FF' },
                      { label: 'Present', value: presentCount,   color: '#059669', bg: '#DCFCE7' },
                      { label: 'Absent',  value: absentCount,    color: '#DC2626', bg: '#FEE2E2' },
                      { label: 'Late',    value: lateCount,      color: '#CA8A04', bg: '#FEF9C3' },
                    ].map(({ label, value, color, bg }) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <p style={{ color: '#64748B', fontSize: '.82rem', margin: 0 }}>{label}</p>
                        <span style={{ background: bg, color, fontWeight: 700, fontSize: '.8rem', padding: '.15rem .6rem', borderRadius: 20 }}>{value}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: '.2rem' }}>
                      <div style={{ height: 5, borderRadius: 5, background: '#F1F5F9', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 5, background: 'linear-gradient(90deg,#22C55E,#16A34A)', width: `${pct}%`, transition: 'width .4s' }} />
                      </div>
                      <p style={{ fontSize: '.68rem', color: '#94A3B8', textAlign: 'right', marginTop: '.2rem' }}>{pct}% present</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Monthly view */}
        {selClass && tab === 'month' && (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '.85rem 1rem', borderBottom: '1px solid #F1F5F9' }}>
              <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '.9rem', margin: 0 }}>
                Monthly Overview — {new Date(monthYear + '-01').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            {sumLoad ? (
              <div style={{ padding: '2.5rem', textAlign: 'center' }}><div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid rgba(201,150,58,.15)', borderTopColor: '#C9963A', animation: 'spin .7s linear infinite', margin: '0 auto' }} /></div>
            ) : summary.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <CalendarDays size={34} color="#E2E8F0" style={{ margin: '0 auto .75rem' }} />
                <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', marginBottom: '.35rem' }}>No records this month</p>
                <p style={{ color: '#94A3B8', fontSize: '.82rem' }}>No attendance was recorded for this class in this month.</p>
              </div>
            ) : (
              <>
                <div style={{ padding: '1rem', borderBottom: '1px solid #F1F5F9', display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                  {[
                    { label: 'School Days',  value: summary.length },
                    { label: 'Avg Present',  value: `${Math.round(summary.reduce((a,s) => a + (s.total ? s.presentCount/s.total*100 : 0), 0) / summary.length)}%` },
                    { label: 'Total Absent', value: summary.reduce((a,s) => a + s.absentCount, 0) },
                    { label: 'Total Late',   value: summary.reduce((a,s) => a + s.lateCount, 0) },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p style={{ fontSize: '.64rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.07em', margin: '0 0 .15rem' }}>{label}</p>
                      <p style={{ fontSize: '1rem', fontWeight: 800, color: '#0B1D3A', fontFamily: "'Playfair Display',serif", margin: 0 }}>{value}</p>
                    </div>
                  ))}
                </div>
                {summary.map(s => {
                  const p = s.total ? Math.round(s.presentCount / s.total * 100) : 0;
                  return (
                    <div key={s.date} className="month-row" onClick={() => { setDate(s.date); setTab('day'); }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.85rem' }}>
                        <div style={{ width: 42, textAlign: 'center', flexShrink: 0 }}>
                          <p style={{ fontSize: '.63rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', margin: 0 }}>{parseLocal(s.date).toLocaleDateString('en-GB', { weekday: 'short' })}</p>
                          <p style={{ fontSize: '1rem', fontWeight: 800, color: '#0B1D3A', fontFamily: "'Playfair Display',serif", margin: 0 }}>{parseLocal(s.date).getDate()}</p>
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, color: '#0B1D3A', fontSize: '.84rem', margin: 0 }}>{s.subject || 'General'}</p>
                          <p style={{ color: '#94A3B8', fontSize: '.71rem', margin: 0 }}>{s.total} students · {p}% present</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '.35rem', alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
                        <span style={{ background: '#DCFCE7', color: '#15803D', fontSize: '.67rem', fontWeight: 700, padding: '.13rem .45rem', borderRadius: 20 }}>{s.presentCount}P</span>
                        <span style={{ background: '#FEE2E2', color: '#B91C1C', fontSize: '.67rem', fontWeight: 700, padding: '.13rem .45rem', borderRadius: 20 }}>{s.absentCount}A</span>
                        {s.lateCount > 0 && <span style={{ background: '#FEF9C3', color: '#A16207', fontSize: '.67rem', fontWeight: 700, padding: '.13rem .45rem', borderRadius: 20 }}>{s.lateCount}L</span>}
                        <div style={{ width: 44, height: 4, borderRadius: 4, background: '#F1F5F9', overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: 4, background: p >= 80 ? '#22C55E' : p >= 50 ? '#EAB308' : '#EF4444', width: `${p}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
      </main>

      <footer style={{ background: '#0B1D3A', borderTop: '1px solid rgba(201,150,58,.15)', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.5rem' }}>
          <p style={{ color: '#475569', fontSize: '.75rem', margin: 0 }}>{selClass?.name || `${classes.length} classes`}</p>
          <p style={{ color: '#475569', fontSize: '.75rem', margin: 0 }}>Powered by <span style={{ color: '#C9963A', fontWeight: 600 }}>Klas School Management Platform</span></p>
        </div>
      </footer>
    </div>
  );
}

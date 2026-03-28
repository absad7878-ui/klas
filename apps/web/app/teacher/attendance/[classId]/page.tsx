'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Save, Check, X, Clock, ArrowLeft, CalendarDays,
  BookOpen, ChevronLeft, ChevronRight, AlertCircle, History
} from 'lucide-react';

interface Student { id: string; firstName: string; lastName: string; studentId?: string; }
type AttStatus = 'PRESENT' | 'ABSENT' | 'LATE';

const fmt = (d: Date) => d.toISOString().split('T')[0]!;
const today = fmt(new Date());

const parseLocal = (dateStr: string) => {
  const [y, m, day] = dateStr.split('-').map(Number);
  return new Date(y!, m! - 1, day!);
};

export default function TakeAttendancePage() {
  const router = useRouter();
  const { classId } = useParams();

  const [classData, setClassData]   = useState<any>(null);
  const [students,  setStudents]    = useState<Student[]>([]);
  const [subject,   setSubject]     = useState('');
  const [date,      setDate]        = useState<string>(today);
  const [attendance, setAttendance] = useState<Record<string, AttStatus>>({});

  const [alreadyTaken,  setAlreadyTaken]  = useState(false);
  const [loadingAtt,    setLoadingAtt]    = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [error,         setError]         = useState('');
  const [success,       setSuccess]       = useState('');

  const [showHistory,   setShowHistory]   = useState(false);
  const [history,       setHistory]       = useState<any[]>([]);
  const [historyLoad,   setHistoryLoad]   = useState(false);

  const API   = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`;
  const token = () => localStorage.getItem('token') || '';

  useEffect(() => {
    if (!token()) return router.push('/teacher-login');
    const t = token();
    Promise.all([
      fetch(`${API}/classes/${classId}`,          { headers: { Authorization: `Bearer ${t}` } }),
      fetch(`${API}/classes/${classId}/students`, { headers: { Authorization: `Bearer ${t}` } }),
    ]).then(async ([cr, sr]) => {
      if (cr.ok) setClassData(await cr.json());
      if (sr.ok) {
        const data = await sr.json();
        const s = data.students || [];
        setStudents(s);
        const init: Record<string, AttStatus> = {};
        s.forEach((x: Student) => { init[x.id] = 'PRESENT'; });
        setAttendance(init);
      }
      setLoading(false);
    }).catch(() => { setError('Failed to load class data'); setLoading(false); });
  }, [classId]);

  const loadAttendanceForDate = useCallback(async (d: string) => {
    if (!students.length) return;
    setLoadingAtt(true); setAlreadyTaken(false); setError('');
    try {
      const res = await fetch(
        `${API}/attendance?classId=${classId}&date=${d}`,
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      if (res.ok) {
        const data: any[] = await res.json();
        if (data.length > 0) {
          setAlreadyTaken(true);
          const map: Record<string, AttStatus> = {};
          students.forEach(s => { map[s.id] = 'PRESENT'; });
          data.forEach(r => { if (map[r.studentId] !== undefined) map[r.studentId] = r.status; });
          setAttendance(map);
          if (data[0]?.subject) setSubject(data[0].subject);
        } else {
          setAlreadyTaken(false);
          const init: Record<string, AttStatus> = {};
          students.forEach(s => { init[s.id] = 'PRESENT'; });
          setAttendance(init);
        }
      }
    } catch { /* silent */ }
    setLoadingAtt(false);
  }, [students, classId]);

  useEffect(() => { if (students.length) loadAttendanceForDate(date); }, [date, students]);

  const loadHistory = async () => {
    setHistoryLoad(true);
    try {
      const res = await fetch(
        `${API}/attendance/history?classId=${classId}&limit=30`,
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      if (res.ok) setHistory(await res.json());
    } catch { /* silent */ }
    setHistoryLoad(false);
  };

  const toggleHistory = () => {
    setShowHistory(v => !v);
    if (!showHistory && !history.length) loadHistory();
  };

  const changeDate = (delta: number) => {
    const d = parseLocal(date);
    d.setDate(d.getDate() + delta);
    const next = fmt(d);
    if (next > today) return;
    setDate(next);
  };

  const isFuture    = (d: string) => d > today;
  const isToday     = date === today;
  const displayDate = parseLocal(date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const toggle  = (id: string, s: AttStatus) => setAttendance(p => ({ ...p, [id]: s }));
  const markAll = (s: AttStatus) => {
    const all: Record<string, AttStatus> = {};
    students.forEach(x => { all[x.id] = s; });
    setAttendance(all);
  };

  const handleSave = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      const res = await fetch(`${API}/attendance/bulk`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({
          classId, date,
          records: Object.entries(attendance).map(([studentId, status]) => ({
            studentId, status, subject: subject || 'General Attendance',
          })),
        }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to save'); }
      setSuccess(`Attendance ${alreadyTaken ? 'updated' : 'saved'} for ${displayDate}`);
      setAlreadyTaken(true);
      setTimeout(() => setSuccess(''), 5000);
      if (showHistory) loadHistory();
    } catch (err: any) { setError(err.message); }
    setSaving(false);
  };

  const presentCount = Object.values(attendance).filter(s => s === 'PRESENT').length;
  const absentCount  = Object.values(attendance).filter(s => s === 'ABSENT').length;
  const lateCount    = Object.values(attendance).filter(s => s === 'LATE').length;
  const pct          = students.length ? Math.round((presentCount / students.length) * 100) : 0;

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0B1D3A' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}`}</style>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:52, height:52, borderRadius:'50%', border:'3px solid rgba(201,150,58,.15)', borderTopColor:'#C9963A', animation:'spin .8s linear infinite', margin:'0 auto 1.25rem' }} />
        <p style={{ color:'#94A3B8', fontFamily:"'DM Sans',sans-serif", animation:'pulse 1.8s ease infinite' }}>Loading…</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', fontFamily:"'DM Sans',sans-serif", background:'#F0EFE9', width:'100%', maxWidth:'100vw', overflowX:'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing:border-box; }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer   { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes spin      { to{transform:rotate(360deg)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pop       { 0%{transform:scale(.85)} 60%{transform:scale(1.1)} 100%{transform:scale(1)} }
        .fade-up   { animation:fadeUp .5s ease both; }
        .fade-up-1 { animation:fadeUp .5s .08s ease both; }
        .fade-up-2 { animation:fadeUp .5s .16s ease both; }
        .gold-shimmer { background:linear-gradient(90deg,#C9963A 0%,#F0C060 40%,#C9963A 60%,#E8B85A 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 4s linear infinite; }
        .card { background:#fff;border:1px solid #E2E8F0;border-radius:20px;box-shadow:0 2px 14px rgba(11,29,58,.07); }
        .date-nav-btn { background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);color:#fff;width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s;flex-shrink:0; }
        .date-nav-btn:hover:not(:disabled) { background:rgba(255,255,255,.14); }
        .date-nav-btn:disabled { opacity:.3;cursor:not-allowed; }
        .date-input { padding:.55rem 1rem;border:1.5px solid rgba(255,255,255,.18);border-radius:10px;font-family:'DM Sans',sans-serif;font-size:.85rem;color:#fff;background:rgba(255,255,255,.1);outline:none;cursor:pointer;transition:border-color .2s;flex:1;min-width:0; }
        .date-input::-webkit-calendar-picker-indicator { filter:invert(1) opacity(.6);cursor:pointer; }
        .date-input:focus { border-color:#C9963A; }

        .student-card { background:#fff;border:1.5px solid #E8EDF3;border-radius:14px;padding:.9rem 1rem;display:flex;align-items:center;justify-content:space-between;gap:.75rem;transition:border-color .15s; }
        .student-card.is-absent  { border-color:#FECACA;background:#FFF8F8; }
        .student-card.is-late    { border-color:#FDE68A;background:#FFFDF0; }
        .student-card.is-present { border-color:#BBF7D0;background:#F0FDF4; }
        .att-btn { height:40px;border-radius:10px;border:1.5px solid;display:inline-flex;align-items:center;justify-content:center;gap:.3rem;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:.72rem;font-weight:700;transition:transform .12s,box-shadow .12s;padding:0 .65rem;flex-shrink:0; }
        .att-btn:active { transform:scale(.93); }
        .att-btn.p-off { background:#F1F5F9;border-color:#E2E8F0;color:#94A3B8; }
        .att-btn.p-off:hover { background:#DCFCE7;border-color:#86EFAC;color:#15803D; }
        .att-btn.p-on  { background:#22C55E;border-color:#16A34A;color:#fff;box-shadow:0 3px 10px rgba(34,197,94,.3);animation:pop .2s ease; }
        .att-btn.a-off { background:#F1F5F9;border-color:#E2E8F0;color:#94A3B8; }
        .att-btn.a-off:hover { background:#FEE2E2;border-color:#FCA5A5;color:#DC2626; }
        .att-btn.a-on  { background:#EF4444;border-color:#DC2626;color:#fff;box-shadow:0 3px 10px rgba(239,68,68,.3);animation:pop .2s ease; }
        .att-btn.l-off { background:#F1F5F9;border-color:#E2E8F0;color:#94A3B8; }
        .att-btn.l-off:hover { background:#FEF9C3;border-color:#FDE047;color:#CA8A04; }
        .att-btn.l-on  { background:#EAB308;border-color:#CA8A04;color:#fff;box-shadow:0 3px 10px rgba(234,179,8,.3);animation:pop .2s ease; }

        .subject-input { padding:.75rem 1rem;border:1.5px solid #E2E8F0;border-radius:11px;font-family:'DM Sans',sans-serif;font-size:.88rem;color:#0B1D3A;background:#FAFBFF;outline:none;transition:border-color .2s,box-shadow .2s;width:100%;box-sizing:border-box; }
        .subject-input:focus { border-color:#C9963A;box-shadow:0 0 0 3px rgba(201,150,58,.12); }
        .subject-input::placeholder { color:#CBD5E1; }
        .save-btn { display:flex;align-items:center;justify-content:center;gap:.55rem;width:100%;padding:.95rem;border:none;border-radius:13px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:.95rem;font-weight:700;background:linear-gradient(135deg,#C9963A,#E8B85A);color:#0B1D3A;box-shadow:0 4px 18px rgba(201,150,58,.3);transition:transform .15s,opacity .2s; }
        .save-btn:hover:not(:disabled) { transform:translateY(-2px); }
        .save-btn:disabled { opacity:.6;cursor:not-allowed; }
        .history-row { padding:.65rem .9rem;border-bottom:1px solid #F8FAFC;display:flex;align-items:center;justify-content:space-between;gap:.5rem;cursor:pointer; }
        .history-row:last-child { border-bottom:none; }
        .history-row:hover { background:#FAFAF8; }
        .overlay-shimmer { position:absolute;inset:0;background:rgba(255,255,255,.65);border-radius:20px;display:flex;align-items:center;justify-content:center;z-index:5; }

        /* ── Full-width layout ── */
        .att-inner { width:100%;padding:1.25rem 2rem; }
        .page-grid  { display:grid;grid-template-columns:1fr 300px;gap:1.5rem;align-items:start;width:100%; }

        @media(max-width:960px)  { .page-grid { grid-template-columns:1fr; } }
        @media(max-width:700px)  { .att-inner { padding:.85rem 1rem; } }
      `}</style>

      {/* ── Header ── */}
      <header className="fade-up" style={{ background:'#0B1D3A', borderBottom:'2px solid rgba(201,150,58,.5)', position:'sticky', top:0, zIndex:20, width:'100%' }}>
        <div style={{ padding:'.85rem 2rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'.65rem' }}>
            <div style={{ width:32, height:32, borderRadius:9, background:'linear-gradient(135deg,#C9963A,#E8B85A)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <CalendarDays size={15} color="#0B1D3A" />
            </div>
            <p style={{ fontFamily:"'Playfair Display',serif", color:'#fff', fontWeight:700, fontSize:'.88rem', margin:0 }}>
              {classData?.name || 'Attendance'}
            </p>
          </div>
          <div style={{ display:'flex', gap:'.5rem' }}>
            <button onClick={toggleHistory}
              style={{ display:'flex', alignItems:'center', gap:'.3rem', padding:'.45rem .75rem', borderRadius:9, border:`1.5px solid ${showHistory?'#C9963A':'rgba(255,255,255,.15)'}`, background:showHistory?'rgba(201,150,58,.15)':'rgba(255,255,255,.07)', color:showHistory?'#C9963A':'#94A3B8', fontSize:'.78rem', fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
              <History size={13} /> History
            </button>
            <button onClick={() => router.back()}
              style={{ display:'flex', alignItems:'center', gap:'.3rem', background:'none', border:'none', color:'#C9963A', cursor:'pointer', fontSize:'.78rem', fontWeight:600, fontFamily:"'DM Sans',sans-serif" }}>
              <ArrowLeft size={13} /> Back
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <div className="fade-up-1" style={{ background:'#0B1D3A', position:'relative', overflow:'hidden', width:'100%' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle,rgba(201,150,58,.13) 1px,transparent 1px)', backgroundSize:'28px 28px' }} />
        <div style={{ padding:'1.5rem 2rem .75rem', position:'relative' }}>
          <p style={{ color:'#64748B', fontSize:'.7rem', textTransform:'uppercase', letterSpacing:'.1em', fontWeight:500, marginBottom:'.3rem' }}>Attendance Register</p>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(1.3rem,3vw,1.8rem)', fontWeight:800, color:'#fff', margin:'0 0 1rem' }}>
            <span className="gold-shimmer">{classData?.name || 'Class'}</span>
          </h1>

          {/* Date navigator */}
          <div style={{ display:'flex', alignItems:'center', gap:'.6rem', flexWrap:'wrap', maxWidth:500 }}>
            <button className="date-nav-btn" onClick={() => changeDate(-1)}><ChevronLeft size={15} /></button>
            <input type="date" max={today} value={date}
              onChange={e => { if (!isFuture(e.target.value)) setDate(e.target.value); }}
              className="date-input" style={{ maxWidth:180 }} />
            <button className="date-nav-btn" onClick={() => changeDate(1)} disabled={isToday}><ChevronRight size={15} /></button>
            {!isToday && (
              <button onClick={() => setDate(today)}
                style={{ padding:'.4rem .8rem', borderRadius:8, border:'1px solid rgba(201,150,58,.4)', background:'rgba(201,150,58,.12)', color:'#C9963A', fontSize:'.72rem', fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", flexShrink:0 }}>
                Today
              </button>
            )}
            {alreadyTaken && !loadingAtt && (
              <span style={{ display:'inline-flex', alignItems:'center', gap:'.3rem', padding:'.3rem .75rem', borderRadius:20, background:'rgba(34,197,94,.15)', border:'1px solid rgba(34,197,94,.3)', color:'#4ADE80', fontSize:'.7rem', fontWeight:700, flexShrink:0 }}>
                <Check size={11} /> Editing
              </span>
            )}
          </div>
          <p style={{ color:'#64748B', fontSize:'.75rem', marginTop:'.5rem' }}>{displayDate}</p>
        </div>
        <div style={{ height:20, background:'linear-gradient(to bottom,transparent,#F0EFE9)' }} />
      </div>

      {/* ── Main ── */}
      <main className="fade-up-2" style={{ flex:1, width:'100%' }}>
        <div className="att-inner">
          <div className="page-grid">

            {/* Left column */}
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>

              {success && (
                <div style={{ display:'flex', alignItems:'center', gap:'.6rem', background:'#ECFDF5', border:'1.5px solid #6EE7B7', borderRadius:13, padding:'.85rem 1.1rem', animation:'slideDown .3s ease' }}>
                  <Check size={15} color="#059669" /><span style={{ color:'#065F46', fontSize:'.85rem', fontWeight:600 }}>{success}</span>
                </div>
              )}
              {error && (
                <div style={{ display:'flex', alignItems:'center', gap:'.6rem', background:'#FFF1F2', border:'1.5px solid #FECDD3', borderRadius:13, padding:'.85rem 1.1rem' }}>
                  <AlertCircle size={15} color="#E11D48" /><span style={{ color:'#BE123C', fontSize:'.85rem', fontWeight:600 }}>{error}</span>
                </div>
              )}

              {/* Subject */}
              <div className="card" style={{ padding:'1rem 1.1rem', display:'flex', alignItems:'center', gap:'.75rem' }}>
                <BookOpen size={15} color="#C9963A" style={{ flexShrink:0 }} />
                <span style={{ fontSize:'.72rem', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.07em', flexShrink:0 }}>Subject</span>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. Mathematics…" className="subject-input" />
              </div>

              {/* Student cards */}
              <div className="card" style={{ position:'relative', overflow:'hidden', padding:'.5rem' }}>
                {loadingAtt && (
                  <div className="overlay-shimmer">
                    <div style={{ width:28, height:28, borderRadius:'50%', border:'3px solid rgba(201,150,58,.2)', borderTopColor:'#C9963A', animation:'spin .7s linear infinite' }} />
                  </div>
                )}

                <div style={{ padding:'.5rem .5rem .75rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, color:'#0B1D3A', fontSize:'.9rem', margin:0 }}>
                    Students <span style={{ color:'#94A3B8', fontSize:'.75rem', fontWeight:400 }}>({students.length})</span>
                  </p>
                  <div style={{ display:'flex', gap:'.4rem' }}>
                    {([
                      { label:'All ✓', s:'PRESENT', color:'#15803D', bg:'#DCFCE7', border:'#86EFAC' },
                      { label:'All ✗', s:'ABSENT',  color:'#DC2626', bg:'#FEE2E2', border:'#FCA5A5' },
                      { label:'All ⏱', s:'LATE',    color:'#CA8A04', bg:'#FEF9C3', border:'#FDE047' },
                    ] as const).map(({ label, s, color, bg, border }) => (
                      <button key={s} onClick={() => markAll(s)}
                        style={{ padding:'.3rem .65rem', borderRadius:8, border:`1.5px solid ${border}`, background:bg, color, fontSize:'.72rem', fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display:'flex', flexDirection:'column', gap:'.5rem', padding:'0 .25rem .5rem' }}>
                  {students.map((s, idx) => {
                    const st = attendance[s.id] || 'PRESENT';
                    return (
                      <div key={s.id} className={`student-card ${st==='PRESENT'?'is-present':st==='ABSENT'?'is-absent':'is-late'}`}>
                        <div style={{ display:'flex', alignItems:'center', gap:'.6rem', minWidth:0 }}>
                          <span style={{ width:26, height:26, borderRadius:7, background:'#F1F5F9', color:'#94A3B8', fontSize:'.7rem', fontWeight:700, display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{idx+1}</span>
                          <div style={{ minWidth:0 }}>
                            <p style={{ fontWeight:600, color:'#0B1D3A', fontSize:'.88rem', margin:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{s.firstName} {s.lastName}</p>
                            {s.studentId && <p style={{ color:'#94A3B8', fontSize:'.68rem', margin:0 }}>#{s.studentId}</p>}
                          </div>
                        </div>
                        <div style={{ display:'flex', gap:'.35rem', flexShrink:0 }}>
                          <button onClick={() => toggle(s.id, 'PRESENT')} title="Present" className={`att-btn ${st==='PRESENT'?'p-on':'p-off'}`}>
                            <Check size={14} /><span>P</span>
                          </button>
                          <button onClick={() => toggle(s.id, 'ABSENT')} title="Absent" className={`att-btn ${st==='ABSENT'?'a-on':'a-off'}`}>
                            <X size={14} /><span>A</span>
                          </button>
                          <button onClick={() => toggle(s.id, 'LATE')} title="Late" className={`att-btn ${st==='LATE'?'l-on':'l-off'}`}>
                            <Clock size={14} /><span>L</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ padding:'.75rem .5rem .5rem' }}>
                  <button onClick={handleSave} disabled={saving||loadingAtt} className="save-btn">
                    {saving
                      ? <><div style={{ width:17, height:17, borderRadius:'50%', border:'2px solid rgba(11,29,58,.2)', borderTopColor:'#0B1D3A', animation:'spin .6s linear infinite' }} /> Saving…</>
                      : <><Save size={16} /> {alreadyTaken?'Update Attendance':'Save Attendance'}</>}
                  </button>
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div className="card" style={{ padding:0, overflow:'hidden' }}>
                <div style={{ padding:'.85rem 1.1rem', borderBottom:'1px solid #F1F5F9' }}>
                  <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, color:'#0B1D3A', fontSize:'.88rem', margin:0 }}>📊 Summary</p>
                </div>
                <div style={{ padding:'.85rem 1.1rem', display:'flex', flexDirection:'column', gap:'.55rem' }}>
                  {[
                    { label:'Total',   value:students.length, color:'#1A56A0', bg:'#EBF4FF' },
                    { label:'Present', value:presentCount,    color:'#059669', bg:'#DCFCE7' },
                    { label:'Absent',  value:absentCount,     color:'#DC2626', bg:'#FEE2E2' },
                    { label:'Late',    value:lateCount,       color:'#CA8A04', bg:'#FEF9C3' },
                  ].map(({ label, value, color, bg }) => (
                    <div key={label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <p style={{ color:'#64748B', fontSize:'.82rem', margin:0 }}>{label}</p>
                      <span style={{ background:bg, color, fontWeight:700, fontSize:'.82rem', padding:'.15rem .65rem', borderRadius:20 }}>{value}</span>
                    </div>
                  ))}
                  <div style={{ marginTop:'.2rem' }}>
                    <div style={{ height:6, borderRadius:6, background:'#F1F5F9', overflow:'hidden' }}>
                      <div style={{ height:'100%', borderRadius:6, background:'linear-gradient(90deg,#22C55E,#16A34A)', width:`${pct}%`, transition:'width .4s ease' }} />
                    </div>
                    <p style={{ fontSize:'.7rem', color:'#94A3B8', marginTop:'.2rem', textAlign:'right' }}>{pct}% present</p>
                  </div>
                </div>
              </div>

              {showHistory && (
                <div className="card" style={{ padding:0, overflow:'hidden' }}>
                  <div style={{ padding:'.85rem 1.1rem', borderBottom:'1px solid #F1F5F9' }}>
                    <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, color:'#0B1D3A', fontSize:'.88rem', margin:0 }}>📅 Recent Dates</p>
                  </div>
                  {historyLoad ? (
                    <div style={{ padding:'1.5rem', textAlign:'center', color:'#94A3B8', fontSize:'.8rem' }}>Loading…</div>
                  ) : history.length===0 ? (
                    <div style={{ padding:'1.5rem', textAlign:'center', color:'#94A3B8', fontSize:'.8rem' }}>No history yet</div>
                  ) : (
                    <div style={{ maxHeight:280, overflowY:'auto' }}>
                      {history.map((h: any) => (
                        <div key={h.date} className="history-row" onClick={() => { setDate(h.date); setShowHistory(false); }}>
                          <div>
                            <p style={{ fontWeight:600, color:'#0B1D3A', fontSize:'.82rem', margin:0 }}>
                              {parseLocal(h.date).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                            </p>
                            <p style={{ color:'#94A3B8', fontSize:'.7rem', margin:0 }}>{h.subject||'General'}</p>
                          </div>
                          <div style={{ display:'flex', gap:'.3rem', flexShrink:0 }}>
                            <span style={{ background:'#DCFCE7', color:'#15803D', fontSize:'.65rem', fontWeight:700, padding:'.12rem .45rem', borderRadius:20 }}>{h.presentCount}P</span>
                            <span style={{ background:'#FEE2E2', color:'#B91C1C', fontSize:'.65rem', fontWeight:700, padding:'.12rem .45rem', borderRadius:20 }}>{h.absentCount}A</span>
                            {h.lateCount>0 && <span style={{ background:'#FEF9C3', color:'#A16207', fontSize:'.65rem', fontWeight:700, padding:'.12rem .45rem', borderRadius:20 }}>{h.lateCount}L</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      <footer style={{ background:'#0B1D3A', borderTop:'1px solid rgba(201,150,58,.15)', padding:'.85rem 2rem', width:'100%' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'.5rem' }}>
          <p style={{ color:'#475569', fontSize:'.73rem', margin:0 }}>{classData?.name} · {displayDate}</p>
          <p style={{ color:'#475569', fontSize:'.73rem', margin:0 }}>Powered by <span style={{ color:'#C9963A', fontWeight:600 }}>Klas Platform</span></p>
        </div>
      </footer>
    </div>
  );
}

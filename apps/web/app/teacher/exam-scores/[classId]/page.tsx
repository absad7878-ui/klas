'use client';
// Route: /teacher/exam-scores/[classId]
// Place at: apps/web/app/teacher/exam-scores/[classId]/page.tsx

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, ArrowLeft, BookOpen, Check, AlertCircle, RefreshCw, ChevronDown } from 'lucide-react';

interface Student      { id: string; firstName: string; lastName: string; studentId?: string; }
interface Subject      { id: string; name: string; order: number; }
interface ScoreRow     { caScore: string; examScore: string; total: number; grade: string; }
interface AcademicTerm { id: string; name: string; session: string; isCurrent: boolean; }

const gradeColor = (g: string) => {
  if (g === 'A') return { bg: '#DCFCE7', color: '#16A34A' };
  if (g === 'B') return { bg: '#EFF6FF', color: '#1D4ED8' };
  if (g === 'C') return { bg: '#FEF9C3', color: '#CA8A04' };
  if (g === 'D') return { bg: '#FED7AA', color: '#C2410C' };
  if (g === 'F') return { bg: '#FEE2E2', color: '#DC2626' };
  return { bg: '#F1F5F9', color: '#94A3B8' };
};

const calcGrade = (total: number): string => {
  if (total >= 70) return 'A';
  if (total >= 60) return 'B';
  if (total >= 50) return 'C';
  if (total >= 40) return 'D';
  if (total > 0)   return 'F';
  return '';
};

export default function ExamScoresPage() {
  const router  = useRouter();
  const params  = useParams();
  const classId = params.classId as string;

  const [classInfo,     setClassInfo]     = useState<any>(null);
  const [students,      setStudents]      = useState<Student[]>([]);
  const [subjects,      setSubjects]      = useState<Subject[]>([]);
  const [terms,         setTerms]         = useState<AcademicTerm[]>([]);
  const [activeTerm,    setActiveTerm]    = useState<AcademicTerm | null>(null);
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
  const [scores,        setScores]        = useState<Record<string, ScoreRow>>({});
  const [showSubjects,  setShowSubjects]  = useState(false);

  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [loadingScores, setLoadingScores] = useState(false);
  const [error,         setError]         = useState('');
  const [success,       setSuccess]       = useState('');

  const API   = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`;
  const token = () => localStorage.getItem('token') || '';

  useEffect(() => {
    const t = token();
    if (!t) { router.push('/teacher-login'); return; }
    Promise.all([
      fetch(`${API}/terms`,                       { headers: { Authorization: `Bearer ${t}` } }),
      fetch(`${API}/classes/${classId}`,          { headers: { Authorization: `Bearer ${t}` } }),
      fetch(`${API}/classes/${classId}/students`, { headers: { Authorization: `Bearer ${t}` } }),
      fetch(`${API}/exams/subjects`,              { headers: { Authorization: `Bearer ${t}` } }),
    ]).then(async ([tr, cr, sr, subr]) => {
      const termsData: AcademicTerm[] = tr.ok   ? await tr.json()   : [];
      const cls                        = cr.ok   ? await cr.json()   : null;
      const stud                       = sr.ok   ? await sr.json()   : {};
      const subs                       = subr.ok ? await subr.json() : [];
      setTerms(termsData);
      setActiveTerm(termsData.find(t => t.isCurrent) || termsData[0] || null);
      setClassInfo(cls);
      setStudents(stud.students || []);
      setSubjects(subs);
      if (subs.length > 0) setActiveSubject(subs[0]);
      setLoading(false);
    }).catch(() => { setError('Failed to load data'); setLoading(false); });
  }, [classId]);

  useEffect(() => {
    if (!activeSubject || !activeTerm || !students.length) return;
    loadScores();
  }, [activeSubject, activeTerm, students]);

  const loadScores = async () => {
    if (!activeSubject || !activeTerm) return;
    setLoadingScores(true);
    const empty: Record<string, ScoreRow> = {};
    students.forEach(s => { empty[s.id] = { caScore: '', examScore: '', total: 0, grade: '' }; });
    try {
      const res = await fetch(
        `${API}/exams/results?classId=${classId}&term=${encodeURIComponent(activeTerm.name)}&session=${encodeURIComponent(activeTerm.session)}&subjectId=${activeSubject.id}`,
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      if (res.ok) {
        const data: any[] = await res.json();
        data.forEach(r => {
          if (empty[r.studentId]) {
            empty[r.studentId] = { caScore: String(r.caScore), examScore: String(r.examScore), total: r.total, grade: r.grade };
          }
        });
      }
    } catch { /* use empty */ }
    setScores(empty);
    setLoadingScores(false);
  };

  const handleScore = (studentId: string, field: 'caScore' | 'examScore', val: string) => {
    setScores(prev => {
      const existing = prev[studentId] || { caScore: '', examScore: '', total: 0, grade: '' };
      const updated  = { ...existing, [field]: val };
      // CA max = 30, Exam max = 70, Total = 100
      const ca   = Math.min(parseFloat(updated.caScore)   || 0, 30);
      const exam = Math.min(parseFloat(updated.examScore) || 0, 70);
      updated.total = parseFloat((ca + exam).toFixed(1));
      updated.grade = (updated.caScore !== '' || updated.examScore !== '') ? calcGrade(updated.total) : '';
      return { ...prev, [studentId]: updated };
    });
  };

  const handleSave = async () => {
    if (!activeSubject || !activeTerm) return;
    setError(''); setSuccess(''); setSaving(true);
    try {
      const res = await fetch(`${API}/exams/results/bulk`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({
          classId, subjectId: activeSubject.id,
          term: activeTerm.name, session: activeTerm.session,
          scores: students.map(s => ({
            studentId: s.id,
            caScore:   parseFloat(scores[s.id]?.caScore  ?? '0') || 0,
            examScore: parseFloat(scores[s.id]?.examScore ?? '0') || 0,
            teacherComment: '',
          })),
        }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to save'); }
      setSuccess(`${activeSubject.name} scores saved for ${activeTerm.name} — ${activeTerm.session}!`);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const entered      = Object.values(scores).filter(s => s.caScore !== '' || s.examScore !== '').length;
  const classAverage = (() => { const v = Object.values(scores).filter(s => s.total > 0); if (!v.length) return '0'; return (v.reduce((a, s) => a + s.total, 0) / v.length).toFixed(1); })();
  const highest      = Math.max(...Object.values(scores).map(s => s.total), 0);
  const lowest       = (() => { const v = Object.values(scores).filter(s => s.total > 0).map(s => s.total); return v.length ? Math.min(...v) : 0; })();

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0B1D3A' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:48, height:48, borderRadius:'50%', border:'3px solid rgba(201,150,58,.2)', borderTopColor:'#C9963A', animation:'spin .8s linear infinite', margin:'0 auto 1rem' }} />
        <p style={{ color:'#94A3B8', fontFamily:'DM Sans,sans-serif' }}>Loading…</p>
      </div>
    </div>
  );

  if (!loading && terms.length === 0) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F0EFE9', fontFamily:'DM Sans,sans-serif' }}>
      <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:20, padding:'3rem', textAlign:'center', maxWidth:420 }}>
        <BookOpen size={40} color="#E2E8F0" style={{ margin:'0 auto .75rem' }} />
        <p style={{ fontFamily:'Playfair Display,serif', fontWeight:700, color:'#0B1D3A', fontSize:'1.1rem', marginBottom:'.5rem' }}>No Terms Configured</p>
        <p style={{ color:'#94A3B8', fontSize:'.85rem' }}>Ask your school admin to set up academic terms.</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', width:'100%', background:'#F0EFE9', fontFamily:'DM Sans,sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
        .gold-shimmer{background:linear-gradient(90deg,#C9963A 0%,#F0C060 40%,#C9963A 60%,#E8B85A 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 4s linear infinite}
        .hero-dots{background-image:radial-gradient(circle,rgba(201,150,58,.13) 1px,transparent 1px);background-size:28px 28px}
        .fade-up{animation:fadeUp .45s ease both}.fade-up-1{animation:fadeUp .45s .07s ease both}.fade-up-2{animation:fadeUp .45s .14s ease both}
        .card{background:#fff;border:1px solid #E2E8F0;border-radius:18px;box-shadow:0 2px 14px rgba(11,29,58,.06)}
        .subj-btn{width:100%;text-align:left;padding:.65rem .9rem;border-radius:10px;border:1.5px solid #E2E8F0;background:#fff;cursor:pointer;font-family:DM Sans,sans-serif;font-size:.83rem;font-weight:600;color:#0B1D3A;transition:all .15s;display:flex;align-items:center;justify-content:space-between}
        .subj-btn.active{background:#0B1D3A;border-color:#0B1D3A;color:#fff}
        .subj-btn:hover:not(.active){border-color:#C9963A;color:#C9963A}
        .score-input{width:62px;padding:.5rem .4rem;border:1.5px solid #E2E8F0;border-radius:8px;font-family:DM Sans,sans-serif;font-size:.9rem;font-weight:600;color:#0B1D3A;text-align:center;background:#FAFAF8;outline:none;transition:border-color .2s,box-shadow .2s}
        .score-input:focus{border-color:#C9963A;box-shadow:0 0 0 3px rgba(201,150,58,.12);background:#fff}
        .score-input::placeholder{color:#CBD5E1;font-weight:400}
        .save-btn{display:flex;align-items:center;justify-content:center;gap:.5rem;width:100%;padding:.95rem;border:none;border-radius:13px;cursor:pointer;background:linear-gradient(135deg,#C9963A,#E8B85A);color:#0B1D3A;font-family:DM Sans,sans-serif;font-size:.95rem;font-weight:700;box-shadow:0 4px 16px rgba(201,150,58,.3);transition:transform .15s,opacity .2s}
        .save-btn:hover:not(:disabled){transform:translateY(-2px)}.save-btn:disabled{opacity:.6;cursor:not-allowed}
        .term-sel{padding:.55rem .9rem;border:1.5px solid rgba(255,255,255,.2);border-radius:10px;font-family:DM Sans,sans-serif;font-size:.83rem;font-weight:500;color:#fff;background:rgba(255,255,255,.1);cursor:pointer;outline:none;flex:1;min-width:0}
        .term-sel:focus{border-color:#C9963A}.term-sel option{background:#0B1D3A;color:#fff}
        .score-card{background:#fff;border:1.5px solid #E8EDF3;border-radius:14px;padding:.85rem 1rem;display:flex;flex-direction:column;gap:.6rem}
        .score-card-header{display:flex;align-items:center;gap:.65rem}
        .score-card-inputs{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap}
        .score-field{display:flex;flex-direction:column;gap:.2rem;align-items:center}
        .score-field label{font-size:.65rem;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:.06em}
        .page-layout{display:grid;grid-template-columns:200px 1fr;gap:1.25rem;align-items:start}
        @media(max-width:700px){
          .page-layout{grid-template-columns:1fr}
          .subj-sidebar{display:none}
          .score-input{width:54px;font-size:.85rem}
        }
      `}</style>

      {/* Header */}
      <header style={{ background:'#0B1D3A', borderBottom:'2px solid rgba(201,150,58,.5)', position:'sticky', top:0, zIndex:20 }}>
        <div style={{ padding:'.85rem 1rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'.65rem' }}>
            <div style={{ width:32, height:32, borderRadius:9, background:'linear-gradient(135deg,#C9963A,#E8B85A)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <BookOpen size={15} color="#0B1D3A" />
            </div>
            <span style={{ fontFamily:'Playfair Display,serif', color:'#fff', fontWeight:700, fontSize:'.88rem' }}>
              {classInfo?.name || 'Exam Scores'}
            </span>
          </div>
          <button onClick={() => router.back()} style={{ display:'flex', alignItems:'center', gap:'.35rem', background:'none', border:'none', color:'#C9963A', cursor:'pointer', fontSize:'.82rem', fontWeight:600, fontFamily:'DM Sans,sans-serif' }}>
            <ArrowLeft size={14} /> Back
          </button>
        </div>
      </header>

      {/* Hero */}
      <div style={{ background:'#0B1D3A', position:'relative', overflow:'hidden' }} className="fade-up">
        <div className="hero-dots" style={{ position:'absolute', inset:0 }} />
        <div style={{ padding:'1.5rem 1rem .75rem', position:'relative' }}>
          <p style={{ color:'#64748B', fontSize:'.7rem', textTransform:'uppercase', letterSpacing:'.1em', fontWeight:500, marginBottom:'.3rem' }}>Score Entry</p>
          <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:'clamp(1.4rem,3vw,2rem)', fontWeight:800, color:'#fff', margin:'0 0 .85rem' }}>
            <span className="gold-shimmer">Exam</span> Scores
          </h1>
          <div style={{ display:'flex', alignItems:'center', gap:'.6rem', flexWrap:'wrap' }}>
            <label style={{ color:'#64748B', fontSize:'.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', flexShrink:0 }}>Term</label>
            <select className="term-sel" value={activeTerm?.id || ''} onChange={e => { const t = terms.find(t => t.id === e.target.value); if (t) setActiveTerm(t); }}>
              {terms.map(t => <option key={t.id} value={t.id}>{t.name} — {t.session}{t.isCurrent ? ' ★' : ''}</option>)}
            </select>
          </div>
          <p style={{ color:'#64748B', fontSize:'.78rem', marginTop:'.5rem' }}>{students.length} students · CA /30 · Exam /70 · Total /100</p>
        </div>
        <div style={{ height:20, background:'linear-gradient(to bottom,transparent,#F0EFE9)' }} />
      </div>

      <main style={{ padding:'1rem', maxWidth:1100, margin:'0 auto' }}>

        {success && (
          <div style={{ display:'flex', alignItems:'center', gap:'.6rem', background:'#ECFDF5', border:'1.5px solid #6EE7B7', borderRadius:13, padding:'.85rem 1.1rem', marginBottom:'1rem' }}>
            <Check size={16} color="#059669" /><span style={{ color:'#065F46', fontSize:'.85rem', fontWeight:600 }}>{success}</span>
          </div>
        )}
        {error && (
          <div style={{ display:'flex', alignItems:'center', gap:'.6rem', background:'#FFF1F2', border:'1.5px solid #FECDD3', borderRadius:13, padding:'.85rem 1.1rem', marginBottom:'1rem' }}>
            <AlertCircle size={16} color="#E11D48" /><span style={{ color:'#BE123C', fontSize:'.85rem', fontWeight:600 }}>{error}</span>
          </div>
        )}

        {/* Stats bar */}
        <div className="card fade-up-1" style={{ padding:'.85rem 1.1rem', marginBottom:'1rem', display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
          <p style={{ color:'#94A3B8', fontSize:'.78rem', margin:0, flex:1, minWidth:120 }}>
            <strong style={{ color:'#0B1D3A' }}>{activeTerm ? `${activeTerm.name} · ${activeTerm.session}` : '—'}</strong>
          </p>
          <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap' }}>
            {[{ label:'Entered', value:`${entered}/${students.length}` }, { label:'Average', value:classAverage }, { label:'Highest', value:highest||'—' }, { label:'Lowest', value:lowest||'—' }].map(({ label, value }) => (
              <div key={label} style={{ textAlign:'center' }}>
                <p style={{ fontSize:'.62rem', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.06em', margin:0 }}>{label}</p>
                <p style={{ fontSize:'.95rem', fontWeight:800, color:'#0B1D3A', margin:'.1rem 0 0', fontFamily:'Playfair Display,serif' }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {subjects.length === 0 ? (
          <div className="card" style={{ padding:'3rem', textAlign:'center' }}>
            <BookOpen size={40} color="#E2E8F0" style={{ margin:'0 auto .75rem' }} />
            <p style={{ fontFamily:'Playfair Display,serif', fontWeight:700, color:'#0B1D3A', fontSize:'1.1rem', marginBottom:'.4rem' }}>No Subjects Found</p>
            <p style={{ color:'#94A3B8', fontSize:'.85rem' }}>Go to Dashboard → Subjects to add subjects first.</p>
          </div>
        ) : (
          <>
            {/* Mobile subject selector */}
            <div style={{ marginBottom:'.75rem' }}>
              <button onClick={() => setShowSubjects(v => !v)}
                style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', padding:'.8rem 1rem', background:'#fff', border:'1.5px solid #E2E8F0', borderRadius:12, cursor:'pointer', fontFamily:'DM Sans,sans-serif', fontWeight:600, color:'#0B1D3A', fontSize:'.88rem' }}>
                <span>📚 {activeSubject?.name || 'Select Subject'}</span>
                <ChevronDown size={16} color="#94A3B8" style={{ transform: showSubjects ? 'rotate(180deg)' : 'none', transition:'transform .2s' }} />
              </button>
              {showSubjects && (
                <div style={{ background:'#fff', border:'1.5px solid #E2E8F0', borderRadius:12, marginTop:'.4rem', padding:'.5rem', display:'flex', flexDirection:'column', gap:'.35rem' }}>
                  {subjects.map(subj => (
                    <button key={subj.id} className={`subj-btn ${activeSubject?.id === subj.id ? 'active' : ''}`}
                      onClick={() => { setActiveSubject(subj); setShowSubjects(false); }}>
                      {subj.name}{activeSubject?.id === subj.id && <Check size={13} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="page-layout">
              {/* Desktop sidebar */}
              <div className="card fade-up-1 subj-sidebar" style={{ padding:'1rem' }}>
                <p style={{ fontFamily:'Playfair Display,serif', fontWeight:700, color:'#0B1D3A', fontSize:'.85rem', margin:'0 0 .75rem' }}>Subjects</p>
                <div style={{ display:'flex', flexDirection:'column', gap:'.4rem' }}>
                  {subjects.map(subj => (
                    <button key={subj.id} className={`subj-btn ${activeSubject?.id === subj.id ? 'active' : ''}`} onClick={() => setActiveSubject(subj)}>
                      {subj.name}{activeSubject?.id === subj.id && <Check size={13} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Score entries */}
              <div className="card fade-up-2" style={{ overflow:'hidden' }}>
                <div style={{ padding:'.9rem 1.1rem', borderBottom:'1px solid #F1F5F9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div>
                    <p style={{ fontFamily:'Playfair Display,serif', fontWeight:700, color:'#0B1D3A', fontSize:'.95rem', margin:0 }}>{activeSubject?.name || 'Select a subject'}</p>
                    <p style={{ color:'#94A3B8', fontSize:'.72rem', margin:'.1rem 0 0' }}>{activeTerm ? `${activeTerm.name} · ${activeTerm.session}` : '—'}</p>
                  </div>
                  <div style={{ display:'flex', gap:'.6rem', alignItems:'center' }}>
                    {loadingScores && <div style={{ width:16, height:16, borderRadius:'50%', border:'2px solid rgba(201,150,58,.2)', borderTopColor:'#C9963A', animation:'spin .7s linear infinite' }} />}
                    <button onClick={loadScores} disabled={loadingScores} style={{ background:'none', border:'none', cursor:'pointer', color:'#94A3B8', lineHeight:0 }}><RefreshCw size={14} /></button>
                  </div>
                </div>

                {/* Student score cards */}
                <div style={{ padding:'.75rem', display:'flex', flexDirection:'column', gap:'.6rem' }}>
                  {students.map((student, idx) => {
                    const row = scores[student.id] || { caScore:'', examScore:'', total:0, grade:'' };
                    const gc  = gradeColor(row.grade);
                    return (
                      <div key={student.id} className="score-card">
                        <div className="score-card-header">
                          <span style={{ width:26, height:26, borderRadius:7, background:'#F1F5F9', color:'#94A3B8', fontSize:'.7rem', fontWeight:700, display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{idx+1}</span>
                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ fontWeight:600, color:'#0B1D3A', fontSize:'.88rem', margin:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{student.firstName} {student.lastName}</p>
                            {student.studentId && <p style={{ color:'#94A3B8', fontSize:'.68rem', margin:0 }}>#{student.studentId}</p>}
                          </div>
                          {row.grade && <span style={{ background:gc.bg, color:gc.color, fontSize:'.78rem', fontWeight:800, padding:'.25rem .7rem', borderRadius:20, flexShrink:0 }}>{row.grade}</span>}
                        </div>
                        <div className="score-card-inputs">
                          <div className="score-field">
                            <label>CA /30</label>
                            <input type="number" min={0} max={30} placeholder="0" value={row.caScore}
                              onChange={e => handleScore(student.id, 'caScore', e.target.value)}
                              className="score-input" style={{ borderColor: parseFloat(row.caScore) > 30 ? '#DC2626' : undefined }} />
                          </div>
                          <div className="score-field">
                            <label>Exam /70</label>
                            <input type="number" min={0} max={70} placeholder="0" value={row.examScore}
                              onChange={e => handleScore(student.id, 'examScore', e.target.value)}
                              className="score-input" style={{ borderColor: parseFloat(row.examScore) > 70 ? '#DC2626' : undefined }} />
                          </div>
                          <div className="score-field">
                            <label>Total</label>
                            <span style={{ fontSize:'1rem', fontWeight:800, color: row.total > 0 ? '#0B1D3A' : '#CBD5E1', fontFamily:'Playfair Display,serif', minWidth:42, textAlign:'center' }}>
                              {row.total > 0 ? row.total : '—'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ padding:'.75rem 1rem 1rem' }}>
                  <button onClick={handleSave} disabled={saving || !activeSubject || !activeTerm} className="save-btn">
                    {saving
                      ? <><div style={{ width:17, height:17, borderRadius:'50%', border:'2px solid rgba(11,29,58,.2)', borderTopColor:'#0B1D3A', animation:'spin .6s linear infinite' }} /> Saving…</>
                      : <><Save size={16} /> Save {activeSubject?.name} Scores</>}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

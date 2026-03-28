'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, AlertCircle, CheckCircle, BookOpen, ArrowLeft, TrendingUp, Users } from 'lucide-react';

export default function EnterScoresPage() {
  const { classId } = useParams<{ classId: string }>();
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  const [scores, setScores] = useState<Record<string, { score: string; comments: string }>>({});
  const [term, setTerm] = useState('Term 1');
  const [assessmentType, setAssessmentType] = useState('Class Test');
  const [maxScore, setMaxScore] = useState(20);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/classes/${classId}/students`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load students');
        return res.json();
      })
      .then(data => {
        setStudents(data.students || []);
        const initialScores: Record<string, { score: string; comments: string }> = {};
        data.students.forEach((s: any) => { initialScores[s.id] = { score: '', comments: '' }; });
        setScores(initialScores);
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [classId]);

  const handleScoreChange = (studentId: string, field: 'score' | 'comments', value: string) => {
    setScores(prev => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || { score: '', comments: '' }), [field]: value },
    }));
  };

  const handleSave = async () => {
    setError(''); setSuccess(''); setSaving(true);
    const token = localStorage.getItem('token');
    try {
      const records = Object.entries(scores).map(([studentId, s]) => {
        const numericScore = parseFloat(s.score);
        if (isNaN(numericScore) || numericScore < 0 || numericScore > maxScore)
          throw new Error(`Invalid score for a student — must be between 0 and ${maxScore}`);
        return { studentId, classId, term, assessmentType, maxScore, score: numericScore, comments: s.comments.trim() || null };
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ classId, term, assessmentType, maxScore, scores: records }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save scores');
      }

      setSuccess('Scores saved successfully!');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.message || 'Error saving scores');
    } finally {
      setSaving(false);
    }
  };

  // Derived stats
  const entered     = Object.values(scores).filter(s => s.score !== '').length;
  const total       = students.length;
  const avgScore    = (() => {
    const filled = Object.values(scores).filter(s => s.score !== '');
    if (!filled.length) return null;
    return (filled.reduce((a, s) => a + parseFloat(s.score || '0'), 0) / filled.length).toFixed(1);
  })();
  const highScore   = (() => {
    const vals = Object.values(scores).map(s => parseFloat(s.score)).filter(v => !isNaN(v));
    return vals.length ? Math.max(...vals) : null;
  })();

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B1D3A' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap');
          @keyframes spin  { to{transform:rotate(360deg)} }
          @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
        `}</style>
        <div className="text-center">
          <div style={{ width: 52, height: 52, borderRadius: '50%', border: '3px solid rgba(201,150,58,.15)', borderTopColor: '#C9963A', animation: 'spin .8s linear infinite', margin: '0 auto 1.25rem' }} />
          <p style={{ color: '#94A3B8', fontFamily: "'DM Sans',sans-serif", fontSize: '.9rem', animation: 'pulse 1.8s ease infinite' }}>Loading students…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif", background: '#F0EFE9' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        @keyframes fadeUp    { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin      { to{transform:rotate(360deg)} }
        @keyframes shimmer   { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }

        .fade-up   { animation: fadeUp .5s ease both; }
        .fade-up-1 { animation: fadeUp .5s .08s ease both; }
        .fade-up-2 { animation: fadeUp .5s .16s ease both; }
        .alert     { animation: slideDown .3s ease both; }

        .gold-shimmer {
          background: linear-gradient(90deg,#C9963A 0%,#F0C060 40%,#C9963A 60%,#E8B85A 100%);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; animation: shimmer 4s linear infinite;
        }
        .hero-dot-grid {
          background-image: radial-gradient(circle, rgba(201,150,58,.13) 1px, transparent 1px);
          background-size: 28px 28px;
        }

        .back-btn {
          display:inline-flex;align-items:center;gap:.4rem;
          color:#C9963A;font-size:.82rem;font-weight:500;
          background:none;border:none;cursor:pointer;
          padding:.4rem .75rem;border-radius:8px;
          transition:background .2s;font-family:'DM Sans',sans-serif;
        }
        .back-btn:hover { background:rgba(201,150,58,.1); }

        .gold-divider { height:1px; background:linear-gradient(90deg,transparent,rgba(201,150,58,.3),transparent); }

        /* Page grid */
        .page-grid {
          display:grid; grid-template-columns:1fr 280px; gap:2rem; align-items:start;
        }
        @media(max-width:960px){ .page-grid{grid-template-columns:1fr;} }

        .main-card {
          background:#fff; border:1px solid #E2E8F0; border-radius:24px;
          box-shadow:0 4px 28px rgba(11,29,58,.08); overflow:hidden;
        }
        .sidebar-card {
          background:#fff; border:1px solid #E2E8F0; border-radius:20px;
          box-shadow:0 4px 20px rgba(11,29,58,.07); overflow:hidden;
          position:sticky; top:76px;
        }

        /* Config bar selects/inputs */
        .cfg-select, .cfg-input {
          padding:.75rem 1rem; border:1.5px solid #E2E8F0; border-radius:12px;
          font-family:'DM Sans',sans-serif; font-size:.85rem; color:#0B1D3A;
          background:#FAFAF8; outline:none; width:100%; box-sizing:border-box;
          transition:border-color .2s, box-shadow .2s;
          appearance:none; -webkit-appearance:none;
        }
        .cfg-select:focus, .cfg-input:focus {
          border-color:#C9963A; box-shadow:0 0 0 3px rgba(201,150,58,.12); background:#fff;
        }
        .cfg-label {
          font-size:.72rem; font-weight:600; color:#0B1D3A;
          text-transform:uppercase; letter-spacing:.07em; margin-bottom:.4rem;
          display:block;
        }

        /* Table */
        .scores-table { width:100%; border-collapse:collapse; }
        .scores-table thead th {
          padding:.85rem 1.25rem; text-align:left;
          font-size:.7rem; font-weight:600; color:#94A3B8;
          text-transform:uppercase; letter-spacing:.07em;
          background:#FAFAF8; border-bottom:1px solid #F1F5F9;
        }
        .scores-table thead th.center { text-align:center; }
        .scores-table tbody tr { border-bottom:1px solid #F8FAFC; transition:background .15s; }
        .scores-table tbody tr:last-child { border-bottom:none; }
        .scores-table tbody tr:hover { background:#FAFAF8; }
        .scores-table tbody td { padding:.8rem 1.25rem; vertical-align:middle; }
        .scores-table tbody td.center { text-align:center; }

        /* Score input */
        .score-input {
          width:72px; padding:.6rem .5rem; border:1.5px solid #E2E8F0; border-radius:10px;
          font-family:'DM Sans',sans-serif; font-size:.88rem; font-weight:600;
          color:#0B1D3A; background:#FAFAF8; outline:none; text-align:center;
          transition:border-color .2s, box-shadow .2s;
        }
        .score-input:focus {
          border-color:#C9963A; box-shadow:0 0 0 3px rgba(201,150,58,.12); background:#fff;
        }
        .score-input.valid   { border-color:#22C55E; background:#F0FDF4; }
        .score-input.invalid { border-color:#EF4444; background:#FFF1F2; }

        /* Comment input */
        .comment-input {
          width:100%; padding:.6rem .85rem; border:1.5px solid #E2E8F0; border-radius:10px;
          font-family:'DM Sans',sans-serif; font-size:.82rem; color:#0B1D3A;
          background:#FAFAF8; outline:none; box-sizing:border-box;
          transition:border-color .2s, box-shadow .2s;
        }
        .comment-input::placeholder { color:#CBD5E1; }
        .comment-input:focus {
          border-color:#C9963A; box-shadow:0 0 0 3px rgba(201,150,58,.12); background:#fff;
        }

        /* Row number badge */
        .row-num {
          width:26px;height:26px;border-radius:8px;background:#F1F5F9;color:#94A3B8;
          font-size:.7rem;font-weight:600;display:inline-flex;align-items:center;justify-content:center;
          margin-right:.6rem;flex-shrink:0;
        }

        /* Grade pill */
        .grade-pill {
          display:inline-flex;align-items:center;padding:.2rem .6rem;border-radius:20px;
          font-size:.7rem;font-weight:700;letter-spacing:.03em;
        }

        /* Save button */
        .save-btn {
          display:flex;align-items:center;justify-content:center;gap:.6rem;
          padding:1rem 2.5rem;border:none;border-radius:14px;cursor:pointer;
          font-family:'DM Sans',sans-serif;font-size:.95rem;font-weight:700;
          background:linear-gradient(135deg,#0B1D3A 0%,#162D54 100%);
          color:#fff;box-shadow:0 4px 18px rgba(11,29,58,.22);
          transition:transform .15s,box-shadow .2s,background .2s;
        }
        .save-btn:hover:not(:disabled) {
          background:linear-gradient(135deg,#162D54 0%,#1e3a6a 100%);
          transform:translateY(-2px);box-shadow:0 8px 28px rgba(11,29,58,.3);
        }
        .save-btn:disabled { opacity:.65;cursor:not-allowed; }
      `}</style>

      {/* ══════════ HEADER ══════════ */}
      <header className="sticky top-0 z-20 fade-up"
        style={{ background:'#0B1D3A', borderBottom:'2px solid rgba(201,150,58,.5)' }}>
        <div style={{ padding:'.85rem 2rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'.75rem' }}>
            <div style={{ width:34, height:34, borderRadius:10, flexShrink:0, background:'linear-gradient(135deg,#C9963A,#E8B85A)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <BookOpen size={16} color="#0B1D3A" />
            </div>
            <p style={{ fontFamily:"'Playfair Display',serif", color:'#fff', fontWeight:700, fontSize:'.9rem' }}>
              Enter Scores — Class {classId}
            </p>
          </div>
          <button className="back-btn" onClick={() => router.back()}>
            <ArrowLeft size={14} /> Back
          </button>
        </div>
      </header>

      {/* ══════════ HERO ══════════ */}
      <div className="relative overflow-hidden fade-up-1" style={{ background:'#0B1D3A' }}>
        <div className="absolute inset-0 hero-dot-grid" />
        <div className="absolute" style={{ top:-80, right:-40, width:300, height:300, borderRadius:'50%', pointerEvents:'none', background:'radial-gradient(circle,rgba(201,150,58,.13) 0%,transparent 65%)' }} />
        <div className="absolute" style={{ bottom:-60, left:-30, width:200, height:200, borderRadius:'50%', pointerEvents:'none', background:'radial-gradient(circle,rgba(26,86,160,.2) 0%,transparent 65%)' }} />
        <div className="relative" style={{ padding:'2.25rem 2rem 1rem' }}>
          <p style={{ color:'#64748B', fontSize:'.72rem', textTransform:'uppercase', letterSpacing:'.1em', fontWeight:500, marginBottom:'.5rem' }}>
            Class · {classId}
          </p>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(1.6rem,3vw,2.3rem)', fontWeight:800, color:'#fff', lineHeight:1.15 }}>
            <span className="gold-shimmer">Score</span> Entry
          </h1>
          <p style={{ color:'#64748B', fontSize:'.85rem', marginTop:'.5rem' }}>
            Record {assessmentType} results for {total} student{total !== 1 ? 's' : ''} · {term}
          </p>
        </div>
        <div style={{ height:24, background:'linear-gradient(to bottom,transparent,#F0EFE9)' }} />
      </div>

      {/* ══════════ CONTENT ══════════ */}
      <main className="fade-up-2" style={{ flex:1, padding:'2rem 2rem 3rem' }}>

        {/* Alerts */}
        {success && (
          <div className="alert" style={{ marginBottom:'1.25rem', padding:'1rem 1.25rem', borderRadius:16, background:'#ECFDF5', border:'1.5px solid #6EE7B7', display:'flex', alignItems:'center', gap:'.75rem' }}>
            <CheckCircle size={18} color="#059669" style={{ flexShrink:0 }} />
            <div>
              <p style={{ color:'#065F46', fontWeight:600, fontSize:'.88rem' }}>Saved!</p>
              <p style={{ color:'#047857', fontSize:'.83rem' }}>{success}</p>
            </div>
          </div>
        )}
        {error && (
          <div className="alert" style={{ marginBottom:'1.25rem', padding:'1rem 1.25rem', borderRadius:16, background:'#FFF1F2', border:'1.5px solid #FECDD3', display:'flex', alignItems:'center', gap:'.75rem' }}>
            <AlertCircle size={18} color="#E11D48" style={{ flexShrink:0 }} />
            <div>
              <p style={{ color:'#9F1239', fontWeight:600, fontSize:'.88rem' }}>Error</p>
              <p style={{ color:'#BE123C', fontSize:'.83rem' }}>{error}</p>
            </div>
          </div>
        )}

        <div className="page-grid">

          {/* ── LEFT: Config + Table ── */}
          <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>

            {/* Config bar */}
            <div className="main-card" style={{ padding:'1.4rem 1.75rem' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 120px', gap:'1.25rem', alignItems:'end' }}>
                <div>
                  <label className="cfg-label">Term</label>
                  <select value={term} onChange={e => setTerm(e.target.value)} className="cfg-select">
                    <option>Term 1</option>
                    <option>Term 2</option>
                    <option>Term 3</option>
                  </select>
                </div>
                <div>
                  <label className="cfg-label">Assessment Type</label>
                  <select value={assessmentType} onChange={e => { setAssessmentType(e.target.value); setMaxScore(e.target.value.includes('Exam') ? 70 : 20); }} className="cfg-select">
                    <option>Class Test</option>
                    <option>Assignment</option>
                    <option>Exam</option>
                    <option>Project</option>
                    <option>Participation</option>
                  </select>
                </div>
                <div>
                  <label className="cfg-label">Max Score</label>
                  <input type="number" value={maxScore} onChange={e => setMaxScore(Number(e.target.value) || 0)} min="1" className="cfg-input" />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="main-card">
              <table className="scores-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>ID</th>
                    <th className="center">Score / {maxScore}</th>
                    <th className="center">Grade</th>
                    <th>Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, idx) => {
                    const val   = scores[student.id]?.score ?? '';
                    const num   = parseFloat(val);
                    const valid = val !== '' && !isNaN(num) && num >= 0 && num <= maxScore;
                    const pct   = valid ? (num / maxScore) * 100 : null;

                    // Grade pill
                    const grade = pct === null ? null
                      : pct >= 80 ? { label:'A', bg:'#DCFCE7', color:'#15803D' }
                      : pct >= 65 ? { label:'B', bg:'#DBEAFE', color:'#1e40af' }
                      : pct >= 50 ? { label:'C', bg:'#FEF9C3', color:'#A16207' }
                      : pct >= 40 ? { label:'D', bg:'#FFEDD5', color:'#C2410C' }
                      :             { label:'F', bg:'#FEE2E2', color:'#B91C1C' };

                    return (
                      <tr key={student.id}>
                        <td>
                          <div style={{ display:'flex', alignItems:'center' }}>
                            <span className="row-num">{idx + 1}</span>
                            <div>
                              <p style={{ fontWeight:600, color:'#0B1D3A', fontSize:'.88rem', lineHeight:1.2 }}>
                                {student.firstName} {student.lastName}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ color:'#94A3B8', fontSize:'.78rem', fontWeight:500 }}>
                            #{student.studentId ?? '—'}
                          </span>
                        </td>
                        <td className="center">
                          <input
                            type="number"
                            value={val}
                            onChange={e => handleScoreChange(student.id, 'score', e.target.value)}
                            min="0" max={maxScore} step="0.1"
                            className={`score-input ${val === '' ? '' : valid ? 'valid' : 'invalid'}`}
                            placeholder="—"
                          />
                        </td>
                        <td className="center">
                          {grade ? (
                            <span className="grade-pill" style={{ background:grade.bg, color:grade.color }}>
                              {grade.label}
                            </span>
                          ) : (
                            <span style={{ color:'#CBD5E1', fontSize:'.75rem' }}>—</span>
                          )}
                        </td>
                        <td>
                          <input
                            type="text"
                            value={scores[student.id]?.comments || ''}
                            onChange={e => handleScoreChange(student.id, 'comments', e.target.value)}
                            className="comment-input"
                            placeholder="Optional feedback…"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Save button */}
            <div style={{ display:'flex', justifyContent:'flex-end' }}>
              <button onClick={handleSave} disabled={saving} className="save-btn">
                {saving ? (
                  <>
                    <div style={{ width:18, height:18, borderRadius:'50%', border:'2px solid rgba(255,255,255,.25)', borderTopColor:'#fff', animation:'spin .7s linear infinite', flexShrink:0 }} />
                    Saving…
                  </>
                ) : (
                  <><Save size={17} /> Save All Scores</>
                )}
              </button>
            </div>
          </div>

          {/* ── RIGHT: Sidebar ── */}
          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

            {/* Live stats */}
            <div className="sidebar-card">
              <div style={{ padding:'1rem 1.4rem', borderBottom:'1px solid #F1F5F9' }}>
                <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, color:'#0B1D3A', fontSize:'.9rem' }}>📊 Live Stats</p>
              </div>
              <div style={{ padding:'1rem 1.4rem', display:'flex', flexDirection:'column', gap:'.7rem' }}>
                {[
                  { label:'Total Students', value: total,                    color:'#1A56A0', bg:'#EBF4FF' },
                  { label:'Scores Entered',  value: `${entered} / ${total}`, color:'#059669', bg:'#DCFCE7' },
                  { label:'Average Score',   value: avgScore ?? '—',        color:'#B45309', bg:'#FFFBEB' },
                  { label:'Highest Score',   value: highScore ?? '—',       color:'#7C3AED', bg:'#F3E8FF' },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <p style={{ color:'#64748B', fontSize:'.8rem' }}>{label}</p>
                    <span style={{ background:bg, color, fontWeight:700, fontSize:'.82rem', padding:'.2rem .7rem', borderRadius:20 }}>{value}</span>
                  </div>
                ))}
                {/* Progress bar */}
                <div style={{ marginTop:'.25rem' }}>
                  <div style={{ height:6, borderRadius:6, background:'#F1F5F9', overflow:'hidden' }}>
                    <div style={{ height:'100%', borderRadius:6, background:'linear-gradient(90deg,#C9963A,#E8B85A)', width:`${total ? (entered/total)*100 : 0}%`, transition:'width .4s ease' }} />
                  </div>
                  <p style={{ fontSize:'.7rem', color:'#94A3B8', marginTop:'.3rem', textAlign:'right' }}>
                    {total ? Math.round((entered/total)*100) : 0}% entered
                  </p>
                </div>
              </div>
            </div>

            {/* Session info */}
            <div className="sidebar-card">
              <div style={{ padding:'1rem 1.4rem', borderBottom:'1px solid #F1F5F9' }}>
                <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, color:'#0B1D3A', fontSize:'.9rem' }}>📋 Session</p>
              </div>
              <div style={{ padding:'1rem 1.4rem', display:'flex', flexDirection:'column', gap:'.65rem' }}>
                {[
                  { label:'Class',      value: classId },
                  { label:'Term',       value: term },
                  { label:'Type',       value: assessmentType },
                  { label:'Max Score',  value: maxScore },
                  { label:'Date',       value: new Date().toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <p style={{ color:'#94A3B8', fontSize:'.78rem', fontWeight:500 }}>{label}</p>
                    <p style={{ color:'#0B1D3A', fontSize:'.8rem', fontWeight:600 }}>{value as string}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Grade scale */}
            <div className="sidebar-card">
              <div style={{ padding:'1rem 1.4rem', borderBottom:'1px solid #F1F5F9' }}>
                <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, color:'#0B1D3A', fontSize:'.9rem' }}>🏅 Grade Scale</p>
              </div>
              <div style={{ padding:'1rem 1.4rem', display:'flex', flexDirection:'column', gap:'.5rem' }}>
                {[
                  { grade:'A', range:'80–100%', bg:'#DCFCE7', color:'#15803D' },
                  { grade:'B', range:'65–79%',  bg:'#DBEAFE', color:'#1e40af' },
                  { grade:'C', range:'50–64%',  bg:'#FEF9C3', color:'#A16207' },
                  { grade:'D', range:'40–49%',  bg:'#FFEDD5', color:'#C2410C' },
                  { grade:'F', range:'0–39%',   bg:'#FEE2E2', color:'#B91C1C' },
                ].map(({ grade, range, bg, color }) => (
                  <div key={grade} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{ background:bg, color, fontWeight:700, fontSize:'.75rem', padding:'.2rem .65rem', borderRadius:20 }}>{grade}</span>
                    <p style={{ color:'#64748B', fontSize:'.78rem' }}>{range}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* ══════════ FOOTER ══════════ */}
      <footer style={{ background:'#0B1D3A', borderTop:'1px solid rgba(201,150,58,.15)', padding:'1.1rem 2rem' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'.5rem' }}>
          <p style={{ color:'#475569', fontSize:'.75rem' }}>Class · <span style={{ color:'#94A3B8' }}>{classId}</span></p>
          <p style={{ color:'#475569', fontSize:'.75rem' }}>Powered by <span style={{ color:'#C9963A', fontWeight:600 }}>Klas School Management Platform</span></p>
        </div>
      </footer>

    </div>
  );
}

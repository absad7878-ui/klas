'use client';
// Route: /parent/results

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search, AlertCircle, ArrowRight, School, Award,
  BookOpen, TrendingUp, FileText, Printer, CheckCircle, X
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Result  { id: string; subject: { name: string; order: number }; caScore: number; examScore: number; total: number; grade: string; remark: string; }
interface Card    { className: string; term: string; session: string; totalMarks: number; averageScore: number; numberOfSubjects: number; position: number; totalStudents: number; grade: string; remark: string; classTeacherRemark: string; principalRemark: string; }
interface Student { firstName: string; lastName: string; studentId?: string; }
interface TermOption { term: string; session: string; }

const gradeColor = (g: string) => {
  if (g === 'A') return { bg: '#DCFCE7', color: '#16A34A' };
  if (g === 'B') return { bg: '#EFF6FF', color: '#1D4ED8' };
  if (g === 'C') return { bg: '#FEF9C3', color: '#CA8A04' };
  if (g === 'D') return { bg: '#FED7AA', color: '#C2410C' };
  return              { bg: '#FEE2E2', color: '#DC2626' };
};

const ordinal = (n: number): string => {
  const s = ['th','st','nd','rd'];
  const v = n % 10 < 4 && (n % 100 < 11 || n % 100 > 13) ? n % 10 : 0;
  return n + (s[v] ?? 'th');
};

function ParentResultsPage() {
  const searchParams     = useSearchParams();
  const router           = useRouter();
  const urlStudentId     = searchParams.get('studentId') || '';

  const [studentIdInput, setStudentIdInput] = useState(urlStudentId);
  const [terms,    setTerms]    = useState<TermOption[]>([]);
  const [selected, setSelected] = useState<TermOption | null>(null);
  const [card,     setCard]     = useState<Card | null>(null);
  const [results,  setResults]  = useState<Result[]>([]);
  const [student,  setStudent]  = useState<Student | null>(null);
  const [step,     setStep]     = useState<'search' | 'term' | 'card'>('search');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  // Auto-search if studentId came from URL (parent clicked from dashboard)
  useEffect(() => {
    if (urlStudentId) {
      fetchTerms(urlStudentId);
    }
  }, [urlStudentId]);

  const fetchTerms = async (sid: string) => {
    setError(''); setLoading(true); setTerms([]); setCard(null); setStudent(null);
    try {
      const res  = await fetch(`${API}/exams/parent/terms?studentId=${encodeURIComponent(sid.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Student not found');
      if (data.length === 0) throw new Error('No published report cards found for this student yet.');
      setTerms(data);
      setSelected(data[0] ?? null);
      setStep('term');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentIdInput.trim()) return;
    await fetchTerms(studentIdInput);
  };

  const handleViewCard = async () => {
    if (!selected) return;
    setError(''); setLoading(true); setCard(null); setResults([]);
    try {
      const sid    = studentIdInput.trim() || urlStudentId;
      const params = `studentId=${encodeURIComponent(sid)}&term=${encodeURIComponent(selected.term)}&session=${encodeURIComponent(selected.session)}`;
      const res    = await fetch(`${API}/exams/parent/report-card?${params}`);
      const data   = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load report card');
      setCard(data.card); setResults(data.results); setStudent(data.student);
      setStep('card');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const reset = () => {
    // If parent came from dashboard go back, otherwise reset to search
    if (urlStudentId) {
      router.back();
    } else {
      setStep('search'); setStudentIdInput(''); setTerms([]);
      setSelected(null); setCard(null); setResults([]); setStudent(null); setError('');
    }
  };

  // Show spinner while auto-loading from URL
  if (loading && step === 'search') return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F0EFE9' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width:44, height:44, borderRadius:'50%', border:'3px solid rgba(201,150,58,.2)', borderTopColor:'#C9963A', animation:'spin .8s linear infinite' }} />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'DM Sans',sans-serif", background: '#F0EFE9' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        .fade-up   { animation:fadeUp .5s ease both; }
        .fade-up-1 { animation:fadeUp .5s .08s ease both; }
        .gold-shimmer { background:linear-gradient(90deg,#C9963A 0%,#F0C060 40%,#C9963A 60%,#E8B85A 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 4s linear infinite; }
        .hero-dot-grid { background-image:radial-gradient(circle,rgba(201,150,58,.13) 1px,transparent 1px);background-size:28px 28px; }
        .gold-divider { height:1px;background:linear-gradient(90deg,transparent,rgba(201,150,58,.35),transparent); }
        .field-input { width:100%;padding:.9rem 1rem .9rem 2.9rem;border:1.5px solid #E2E8F0;border-radius:12px;font-family:'DM Sans',sans-serif;font-size:.92rem;color:#0B1D3A;background:#FAFAF8;outline:none;transition:border-color .2s,box-shadow .2s;box-sizing:border-box; }
        .field-input:focus { border-color:#C9963A;box-shadow:0 0 0 3px rgba(201,150,58,.12);background:#fff; }
        .field-input::placeholder { color:#94A3B8; }
        .gold-btn { display:inline-flex;align-items:center;justify-content:center;gap:.5rem;padding:.9rem 1.6rem;border:none;border-radius:12px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:.9rem;font-weight:700;background:linear-gradient(135deg,#C9963A,#E8B85A);color:#0B1D3A;box-shadow:0 4px 16px rgba(201,150,58,.3);transition:transform .15s,box-shadow .2s,opacity .2s; }
        .gold-btn:hover:not(:disabled) { transform:translateY(-1px);box-shadow:0 7px 22px rgba(201,150,58,.4); }
        .gold-btn:disabled { opacity:.6;cursor:not-allowed; }
        .card-box { background:#fff;border:1.5px solid #E8EDF3;border-radius:20px;overflow:hidden;box-shadow:0 2px 18px rgba(11,29,58,.07); }
        .card-header { padding:1.1rem 1.5rem;background:#FAFAF8;border-bottom:1px solid #E8EDF3;display:flex;align-items:center;gap:.75rem; }
        .card-body { padding:1.5rem; }
        .subject-row { display:grid;grid-template-columns:1fr 70px 70px 80px 60px;gap:.5rem;align-items:center;padding:.75rem 1rem;border-radius:10px;font-size:.85rem; }
        .subject-row:nth-child(even) { background:#F8FAFC; }
        .grade-badge { display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;font-weight:800;font-size:.8rem; }
        @media(max-width:540px) {
          .subject-row { grid-template-columns:1fr 50px 50px 60px 44px;gap:.25rem;padding:.65rem .5rem;font-size:.78rem; }
          .grade-badge { width:26px;height:26px;font-size:.7rem; }
          main { padding:1.25rem .75rem 3rem !important; }
        }
        @media print { .no-print{display:none!important} body{background:#fff!important} .card-box{box-shadow:none!important;border:1px solid #ddd!important} }
      `}</style>

      {/* Header */}
      <header className="no-print fade-up sticky top-0 z-20" style={{ background: '#0B1D3A', borderBottom: '2px solid rgba(201,150,58,.5)' }}>
        <div style={{ padding: '.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#C9963A,#E8B85A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Award size={16} color="#0B1D3A" />
            </div>
            <p style={{ fontFamily: "'Playfair Display',serif", color: '#fff', fontWeight: 700, fontSize: '.9rem' }}>Report Card</p>
          </div>
          <div style={{ display: 'flex', gap: '.75rem' }}>
            {step === 'card' && (
              <button onClick={() => window.print()} className="no-print"
                style={{ display: 'flex', alignItems: 'center', gap: '.4rem', background: 'rgba(201,150,58,.15)', border: '1px solid rgba(201,150,58,.3)', color: '#C9963A', padding: '.45rem .9rem', borderRadius: 10, fontSize: '.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
                <Printer size={13} /> Print
              </button>
            )}
            <button onClick={reset}
              style={{ display: 'flex', alignItems: 'center', gap: '.4rem', background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.13)', color: '#94A3B8', padding: '.45rem .9rem', borderRadius: 10, fontSize: '.8rem', fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
              ← Back
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden fade-up" style={{ background: '#0B1D3A' }}>
        <div className="absolute inset-0 hero-dot-grid" />
        <div className="absolute" style={{ top: -60, right: -40, width: 280, height: 280, borderRadius: '50%', pointerEvents: 'none', background: 'radial-gradient(circle,rgba(201,150,58,.12) 0%,transparent 65%)' }} />
        <div className="relative" style={{ padding: '2.5rem 2rem 1rem', textAlign: 'center' }}>
          <p style={{ color: '#64748B', fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 500, marginBottom: '.5rem' }}>Parent Portal</p>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.7rem,3.5vw,2.4rem)', fontWeight: 800, color: '#fff', lineHeight: 1.15 }}>
            {step === 'card' && student
              ? <>{student.firstName} {student.lastName}'s <span className="gold-shimmer">Report Card</span></>
              : <>View <span className="gold-shimmer">Report Card</span></>}
          </h1>
          <p style={{ color: '#64748B', fontSize: '.85rem', marginTop: '.5rem' }}>
            {step === 'search' ? "Enter your child's Student ID to view their report card"
              : step === 'term'   ? 'Select a term to view'
              : `${card?.term} · ${card?.session} · ${card?.className}`}
          </p>
        </div>
        <div style={{ height: 24, background: 'linear-gradient(to bottom,transparent,#F0EFE9)' }} />
      </div>

      <main className="fade-up-1" style={{ flex: 1, maxWidth: 720, width: '100%', margin: '0 auto', padding: '2rem 1.25rem 4rem' }}>

        {/* Error banner (shown at top if auto-load fails) */}
        {error && step === 'search' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: 11, padding: '.8rem 1rem', marginBottom: '1.25rem' }}>
            <AlertCircle size={15} color="#E11D48" style={{ flexShrink: 0 }} />
            <p style={{ color: '#BE123C', fontSize: '.83rem' }}>{error}</p>
          </div>
        )}

        {/* STEP 1: Search — only shown if no studentId in URL */}
        {step === 'search' && !urlStudentId && (
          <div className="card-box">
            <div className="card-header">
              <div style={{ width: 38, height: 38, borderRadius: 10, background: '#FEF3C7', border: '1px solid rgba(201,150,58,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Search size={17} color="#C9963A" />
              </div>
              <div>
                <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '.95rem' }}>Enter Student ID</p>
                <p style={{ color: '#94A3B8', fontSize: '.73rem' }}>Enter your child's Student ID to view their report card</p>
              </div>
            </div>
            <div className="card-body">
              <form onSubmit={handleSearch}>
                <div style={{ position: 'relative', marginBottom: '1rem' }}>
                  <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input type="text" value={studentIdInput}
                    onChange={e => setStudentIdInput(e.target.value.toUpperCase())}
                    placeholder="e.g. STD-2025-001" className="field-input" required />
                </div>
                {error && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: 11, padding: '.8rem 1rem', marginBottom: '1rem' }}>
                    <AlertCircle size={15} color="#E11D48" style={{ flexShrink: 0 }} />
                    <p style={{ color: '#BE123C', fontSize: '.83rem' }}>{error}</p>
                  </div>
                )}
                <button type="submit" disabled={loading} className="gold-btn" style={{ width: '100%' }}>
                  {loading
                    ? <><div style={{ width: 17, height: 17, borderRadius: '50%', border: '2px solid rgba(11,29,58,.2)', borderTopColor: '#0B1D3A', animation: 'spin .7s linear infinite' }} /> Searching…</>
                    : <><Search size={15} /> Find Report Card</>}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* STEP 2: Pick term */}
        {step === 'term' && (
          <div className="card-box">
            <div className="card-header">
              <div style={{ width: 38, height: 38, borderRadius: 10, background: '#ECFEFF', border: '1px solid rgba(14,116,144,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileText size={17} color="#0E7490" />
              </div>
              <div>
                <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '.95rem' }}>Select Term</p>
                <p style={{ color: '#94A3B8', fontSize: '.73rem' }}>{terms.length} published report card{terms.length !== 1 ? 's' : ''} found</p>
              </div>
              {!urlStudentId && (
                <button onClick={reset} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={16} /></button>
              )}
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: 11, padding: '.8rem 1rem' }}>
                  <AlertCircle size={15} color="#E11D48" style={{ flexShrink: 0 }} /><p style={{ color: '#BE123C', fontSize: '.83rem' }}>{error}</p>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
                {terms.map((t, i) => {
                  const isActive = selected?.term === t.term && selected?.session === t.session;
                  return (
                    <button key={i} onClick={() => setSelected(t)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderRadius: 13, border: `1.5px solid ${isActive ? '#C9963A' : '#E2E8F0'}`, background: isActive ? '#FFFBEB' : '#fff', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", transition: 'all .15s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 9, background: '#EBF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <BookOpen size={16} color="#1A56A0" />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <p style={{ fontWeight: 700, color: '#0B1D3A', fontSize: '.9rem' }}>{t.term}</p>
                          <p style={{ color: '#94A3B8', fontSize: '.73rem' }}>{t.session}</p>
                        </div>
                      </div>
                      {isActive && <CheckCircle size={18} color="#C9963A" />}
                    </button>
                  );
                })}
              </div>
              <button onClick={handleViewCard} disabled={!selected || loading} className="gold-btn" style={{ marginTop: '.25rem' }}>
                {loading
                  ? <><div style={{ width: 17, height: 17, borderRadius: '50%', border: '2px solid rgba(11,29,58,.2)', borderTopColor: '#0B1D3A', animation: 'spin .7s linear infinite' }} /> Loading…</>
                  : <><ArrowRight size={15} /> View Report Card</>}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Report Card */}
        {step === 'card' && card && student && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            <div className="card-box" style={{ background: 'linear-gradient(135deg,#0B1D3A,#162D54)', border: '1px solid rgba(201,150,58,.3)' }}>
              <div style={{ padding: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(201,150,58,.15)', border: '1px solid rgba(201,150,58,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <School size={24} color="#C9963A" />
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, color: '#fff', fontSize: '1.15rem' }}>{student.firstName} {student.lastName}</p>
                    <p style={{ color: '#94A3B8', fontSize: '.78rem', marginTop: '.15rem' }}>{card.className} · {card.term} · {card.session}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Average',  value: `${card.averageScore?.toFixed(1)}%` },
                    { label: 'Position', value: ordinal(card.position) },
                    { label: 'Grade',    value: card.grade },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ textAlign: 'center', background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12, padding: '.5rem .75rem', minWidth: 70 }}>
                      <p style={{ color: '#C9963A', fontWeight: 800, fontSize: '1.05rem', fontFamily: "'Playfair Display',serif" }}>{value}</p>
                      <p style={{ color: '#64748B', fontSize: '.67rem', marginTop: '.1rem', textTransform: 'uppercase', letterSpacing: '.07em' }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card-box">
              <div className="card-header">
                <div style={{ width: 36, height: 36, borderRadius: 9, background: '#EBF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <TrendingUp size={16} color="#1A56A0" />
                </div>
                <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '.95rem' }}>Subject Results</p>
                <span style={{ marginLeft: 'auto', fontSize: '.72rem', color: '#94A3B8', fontWeight: 500 }}>{results.length} subjects</span>
              </div>
              <div style={{ padding: '0 .5rem .5rem' }}>
                <div className="subject-row" style={{ color: '#94A3B8', fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em' }}>
                  <span>Subject</span><span style={{ textAlign: 'center' }}>CA /30</span><span style={{ textAlign: 'center' }}>Exam /70</span><span style={{ textAlign: 'center' }}>Total /100</span><span style={{ textAlign: 'center' }}>Grade</span>
                </div>
                <div className="gold-divider" style={{ margin: '0 .5rem .5rem' }} />
                {results.map((r) => {
                  const gc = gradeColor(r.grade);
                  return (
                    <div key={r.id} className="subject-row">
                      <span style={{ fontWeight: 600, color: '#0B1D3A', fontSize: '.88rem' }}>{r.subject.name}</span>
                      <span style={{ textAlign: 'center', color: '#475569' }}>{r.caScore}</span>
                      <span style={{ textAlign: 'center', color: '#475569' }}>{r.examScore}</span>
                      <span style={{ textAlign: 'center', fontWeight: 700, color: '#0B1D3A' }}>{r.total}</span>
                      <span style={{ textAlign: 'center' }}>
                        <span className="grade-badge" style={{ background: gc.bg, color: gc.color }}>{r.grade}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
              <div style={{ margin: '.5rem 1rem 1rem', padding: '1rem', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '.5rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <div><p style={{ fontSize: '.68rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.07em' }}>Total Marks</p><p style={{ fontWeight: 800, color: '#0B1D3A', fontSize: '1rem' }}>{card.totalMarks}</p></div>
                  <div><p style={{ fontSize: '.68rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.07em' }}>Average</p><p style={{ fontWeight: 800, color: '#0B1D3A', fontSize: '1rem' }}>{card.averageScore?.toFixed(1)}%</p></div>
                  <div><p style={{ fontSize: '.68rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.07em' }}>Position</p><p style={{ fontWeight: 800, color: '#0B1D3A', fontSize: '1rem' }}>{ordinal(card.position)} / {card.totalStudents}</p></div>
                </div>
                <span style={{ ...gradeColor(card.grade), padding: '.4rem 1rem', borderRadius: 10, fontWeight: 800, fontSize: '.9rem' }}>{card.grade} — {card.remark}</span>
              </div>
            </div>

            {(card.classTeacherRemark || card.principalRemark) && (
              <div className="card-box">
                <div className="card-header">
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Award size={16} color="#7C3AED" />
                  </div>
                  <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '.95rem' }}>Remarks</p>
                </div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {card.classTeacherRemark && (
                    <div style={{ padding: '1rem 1.15rem', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0', borderLeft: '4px solid #1A56A0' }}>
                      <p style={{ fontSize: '.68rem', fontWeight: 700, color: '#1A56A0', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '.4rem' }}>Class Teacher</p>
                      <p style={{ color: '#334155', fontSize: '.88rem', lineHeight: 1.6 }}>{card.classTeacherRemark}</p>
                    </div>
                  )}
                  {card.principalRemark && (
                    <div style={{ padding: '1rem 1.15rem', background: '#FFFBEB', borderRadius: 12, border: '1px solid #FDE68A', borderLeft: '4px solid #C9963A' }}>
                      <p style={{ fontSize: '.68rem', fontWeight: 700, color: '#B45309', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '.4rem' }}>Principal</p>
                      <p style={{ color: '#334155', fontSize: '.88rem', lineHeight: 1.6 }}>{card.principalRemark}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="no-print" style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
              <button onClick={() => setStep('term')} style={{ flex: 1, minWidth: 140, padding: '.85rem', border: '1.5px solid #E2E8F0', borderRadius: 12, background: '#fff', color: '#475569', fontFamily: "'DM Sans',sans-serif", fontSize: '.88rem', fontWeight: 600, cursor: 'pointer' }}>
                ← Other Terms
              </button>
              <button onClick={reset} style={{ flex: 1, minWidth: 140, padding: '.85rem', border: '1.5px solid #E2E8F0', borderRadius: 12, background: '#fff', color: '#475569', fontFamily: "'DM Sans',sans-serif", fontSize: '.88rem', fontWeight: 600, cursor: 'pointer' }}>
                ← Back
              </button>
              <button onClick={() => window.print()} className="gold-btn" style={{ flex: 1, minWidth: 140 }}>
                <Printer size={15} /> Print
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="no-print" style={{ background: '#0B1D3A', borderTop: '1px solid rgba(201,150,58,.15)', padding: '1rem 2rem', textAlign: 'center' }}>
        <p style={{ color: '#475569', fontSize: '.75rem' }}>Powered by <span style={{ color: '#C9963A', fontWeight: 600 }}>Klas School Management Platform</span></p>
      </footer>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F0EFE9' }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ width:44, height:44, borderRadius:'50%', border:'3px solid rgba(201,150,58,.2)', borderTopColor:'#C9963A', animation:'spin .8s linear infinite' }} />
      </div>
    }>
      <ParentResultsPage />
    </Suspense>
  );
}

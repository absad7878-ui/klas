'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Printer, CheckCircle, Eye, EyeOff, Users, Calendar, AlertCircle } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface AcademicTerm { id: string; name: string; session: string; isCurrent: boolean; }
interface Subject  { id: string; name: string; order: number; }
interface Result   { id: string; subject: Subject; caScore: number; examScore: number; total: number; grade: string; remark: string; }
interface Card     { id: string; classId: string; className: string; term: string; session: string; totalMarks: number; averageScore: number; numberOfSubjects: number; position: number; totalStudents: number; grade: string; remark: string; classTeacherRemark: string; principalRemark: string; isPublished: boolean; }
interface Student  { id: string; firstName: string; lastName: string; studentId?: string; dateOfBirth?: string; }

const gradeColor = (g: string) => {
  if (g === 'A') return '#16A34A';
  if (g === 'B') return '#1D4ED8';
  if (g === 'C') return '#CA8A04';
  if (g === 'D') return '#C2410C';
  return '#DC2626';
};

const ordinal = (n: number): string => {
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0] ?? 'th');
};

function ReportCardPage() {
  const router       = useRouter();
  const params       = useParams();
  const studentId    = params.studentId as string;
  const searchParams = useSearchParams();
  const printRef     = useRef<HTMLDivElement>(null);
  const token        = () => localStorage.getItem('token') || '';

  const [school, setSchool] = useState<{ name: string; logoUrl?: string; address?: string } | null>(null);
  const [terms,          setTerms]          = useState<AcademicTerm[]>([]);
  const [selectedTermId, setSelectedTermId] = useState<string>('');
  const [student,        setStudent]        = useState<Student | null>(null);
  const [card,           setCard]           = useState<Card | null>(null);
  const [results,        setResults]        = useState<Result[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [termsLoading,   setTermsLoading]   = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [generating,     setGenerating]     = useState(false);
  const [publishing,     setPublishing]     = useState(false);
  const [error,          setError]          = useState('');
  const [success,        setSuccess]        = useState('');
  const [teacherRemark,   setTeacherRemark]   = useState('');
  const [principalRemark, setPrincipalRemark] = useState('');

  const selectedTerm = terms.find(t => t.id === selectedTermId) || null;

  useEffect(() => {
    const fetchTerms = async () => {
      setTermsLoading(true);
      try {
        const res = await fetch(`${API}/terms`, { headers: { Authorization: `Bearer ${token()}` } });
        if (res.ok) {
          const data: AcademicTerm[] = await res.json();
          setTerms(data);
          const urlTermId = searchParams.get('termId');
          const current   = data.find(t => t.isCurrent);
          const pick      = data.find(t => t.id === urlTermId) || current || data[0];
          if (pick) setSelectedTermId(pick.id);
        }
      } catch { /**/ }
      setTermsLoading(false);
    };
    fetchTerms();
  }, []);

  useEffect(() => {
    if (!selectedTermId || !selectedTerm) return;
    loadCard();
  }, [selectedTermId, studentId]);

  const loadCard = async () => {
    if (!selectedTerm) return;
    setLoading(true); setError('');
    try {
      const res = await fetch(
        `${API}/exams/report-cards/${studentId}?term=${encodeURIComponent(selectedTerm.name)}&session=${encodeURIComponent(selectedTerm.session)}`,
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to load'); }
      const data = await res.json();
      setStudent(data.student);
      setCard(data.card);
      setResults(data.results || []);
      setSchool(data.school || null);
      if (data.card) { setTeacherRemark(data.card.classTeacherRemark || ''); setPrincipalRemark(data.card.principalRemark || ''); }
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const generateCard = async () => {
    if (!selectedTerm) return;
    setGenerating(true); setError('');
    try {
      const resultsRes = await fetch(`${API}/exams/results/student/${studentId}?term=${encodeURIComponent(selectedTerm.name)}&session=${encodeURIComponent(selectedTerm.session)}`, { headers: { Authorization: `Bearer ${token()}` } });
      const resultsData = await resultsRes.json();
      const classId = resultsData[0]?.classId;
      if (!classId) throw new Error('No results found for this term — enter scores first');
      const res = await fetch(`${API}/exams/report-cards/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify({ classId, term: selectedTerm.name, session: selectedTerm.session }) });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      setSuccess('Report card generated!'); setTimeout(() => setSuccess(''), 3000);
      await loadCard();
    } catch (err: any) { setError(err.message); }
    finally { setGenerating(false); }
  };

  const saveRemarks = async () => {
    if (!selectedTerm) return;
    setSaving(true);
    try {
      await fetch(`${API}/exams/report-cards/${studentId}/remarks`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify({ term: selectedTerm.name, session: selectedTerm.session, classTeacherRemark: teacherRemark, principalRemark }) });
      setSuccess('Remarks saved'); setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Failed to save remarks'); }
    finally { setSaving(false); }
  };

  const togglePublish = async () => {
    if (!card || !selectedTerm) return;
    setPublishing(true);
    try {
      await fetch(`${API}/exams/report-cards/publish`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify({ classId: card.classId, term: selectedTerm.name, session: selectedTerm.session, publish: !card.isPublished }) });
      setCard(prev => prev ? { ...prev, isPublished: !prev.isPublished } : prev);
      setSuccess(card.isPublished ? 'Report card hidden from parents' : 'Report card published to parents!');
      setTimeout(() => setSuccess(''), 3500);
    } catch { setError('Failed to toggle publish status'); }
    finally { setPublishing(false); }
  };

  if (termsLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B1D3A' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid rgba(201,150,58,.2)', borderTopColor: '#C9963A', animation: 'spin .8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: '#94A3B8', fontFamily: "'DM Sans',sans-serif" }}>Loading…</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', width: '100%', overflowX: 'hidden', background: '#F0EFE9', fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .fade-up { animation:fadeUp .4s ease both; }
        .card { background:#fff;border:1px solid #E2E8F0;border-radius:18px;box-shadow:0 2px 14px rgba(11,29,58,.06); }
        textarea.remark-input { width:100%;padding:.75rem 1rem;box-sizing:border-box;resize:vertical;min-height:70px;border:1.5px solid #E2E8F0;border-radius:11px;font-family:'DM Sans',sans-serif;font-size:.85rem;color:#0B1D3A;background:#FAFBFF;outline:none;transition:border-color .2s; }
        textarea.remark-input:focus { border-color:#C9963A;box-shadow:0 0 0 3px rgba(201,150,58,.12); }
        .term-select { padding:.6rem 1rem;border:1.5px solid #E2E8F0;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:.83rem;color:#0B1D3A;background:#fff;outline:none;cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right .75rem center;padding-right:2rem;transition:border-color .2s;min-width:160px;max-width:100%; }
        .term-select:focus { border-color:#C9963A; }
        @media print {
          body * { visibility:hidden !important; }
          #report-card-print, #report-card-print * { visibility:visible !important; }
          #report-card-print { position:fixed;inset:0;padding:16px; }
          .no-print { display:none !important; }
        }
        #report-card-print { background:#fff;border-radius:16px;overflow:hidden;border:2px solid #E2E8F0;box-shadow:0 4px 28px rgba(11,29,58,.08); }
        .rc-header { background:linear-gradient(135deg,#0B1D3A 0%,#1A3A6A 100%);padding:1.25rem 1.5rem;display:flex;align-items:center;gap:1rem;flex-wrap:wrap; }
        .rc-tbl { width:100%;border-collapse:collapse; }
        .rc-tbl thead th { padding:.6rem .75rem;font-size:.66rem;font-weight:700;color:#0B1D3A;text-transform:uppercase;letter-spacing:.07em;background:#F0EFE9;border-bottom:2px solid #C9963A; }
        .rc-tbl tbody tr { border-bottom:1px solid #F1F5F9; }
        .rc-tbl tbody tr:last-child { border-bottom:none; }
        .rc-tbl tbody tr:nth-child(even) { background:#FAFAF8; }
        .rc-tbl tbody td { padding:.55rem .75rem;font-size:.84rem;color:#0B1D3A; }
        .rc-tbl tfoot td { padding:.65rem .75rem;font-weight:700;font-size:.86rem;background:#0B1D3A;color:#fff; }
        .grade-badge { display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:8px;font-weight:800;font-size:.86rem; }

        /* Mobile */
        @media (max-width: 640px) {
          .rc-student-grid { grid-template-columns:1fr 1fr !important; }
          .rc-summary-grid  { grid-template-columns:1fr 1fr !important; }
          .rc-remarks-grid  { grid-template-columns:1fr !important; }
          .remarks-btns     { flex-direction:column !important; }
          .rc-tbl thead th, .rc-tbl tbody td, .rc-tbl tfoot td { padding:.5rem .5rem; font-size:.78rem; }
        }
      `}</style>

      {/* Header */}
      <header className="no-print" style={{ background: '#0B1D3A', borderBottom: '2px solid rgba(201,150,58,.5)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ padding: '.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#C9963A', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.35rem', fontSize: '.82rem', fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>
            <ArrowLeft size={14} /> Back
          </button>
          <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '.4rem', padding: '.55rem 1rem', borderRadius: 10, border: '1.5px solid rgba(201,150,58,.4)', background: 'rgba(201,150,58,.1)', color: '#C9963A', fontFamily: "'DM Sans',sans-serif", fontSize: '.8rem', fontWeight: 700, cursor: 'pointer' }}>
            <Printer size={13} /> Print
          </button>
        </div>
      </header>

      <main style={{ padding: '1.25rem', maxWidth: 860, margin: '0 auto' }}>

        {/* Term selector */}
        <div className="card no-print fade-up" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '.85rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            <Calendar size={14} color="#C9963A" />
            <span style={{ fontSize: '.68rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.06em' }}>Term</span>
          </div>
          {terms.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', background: '#FFFBEB', border: '1.5px solid rgba(201,150,58,.3)', borderRadius: 10, padding: '.45rem .85rem' }}>
              <AlertCircle size={13} color="#C9963A" />
              <span style={{ fontSize: '.8rem', color: '#92400E' }}>No terms — go to <strong>Settings → Academic Terms</strong></span>
            </div>
          ) : (
            <select className="term-select" value={selectedTermId} onChange={e => setSelectedTermId(e.target.value)}>
              {terms.map(t => (
                <option key={t.id} value={t.id}>{t.name} — {t.session}{t.isCurrent ? ' ✓' : ''}</option>
              ))}
            </select>
          )}
          {selectedTerm && !card && !loading && (
            <button onClick={generateCard} disabled={generating}
              style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '.4rem', padding: '.6rem 1.1rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#C9963A,#E8B85A)', color: '#0B1D3A', fontFamily: "'DM Sans',sans-serif", fontSize: '.82rem', fontWeight: 700, cursor: 'pointer', opacity: generating ? .7 : 1, whiteSpace: 'nowrap' }}>
              {generating ? 'Generating…' : '⚡ Generate'}
            </button>
          )}
        </div>

        {/* Alerts */}
        {success && (
          <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '.6rem', background: '#ECFDF5', border: '1.5px solid #6EE7B7', borderRadius: 12, padding: '.75rem 1rem', marginBottom: '1rem' }}>
            <CheckCircle size={14} color="#059669" />
            <span style={{ color: '#065F46', fontSize: '.85rem', fontWeight: 600 }}>{success}</span>
          </div>
        )}
        {error && (
          <div className="no-print" style={{ background: '#FFF1F2', border: '1.5px solid #FECDD3', borderRadius: 12, padding: '.8rem 1rem', marginBottom: '1rem', color: '#BE123C', fontSize: '.84rem' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(201,150,58,.2)', borderTopColor: '#C9963A', animation: 'spin .8s linear infinite' }} />
          </div>
        ) : !card ? (
          <div className="card" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
            <Users size={40} color="#E2E8F0" style={{ margin: '0 auto .75rem' }} />
            <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '1rem', marginBottom: '.4rem' }}>No Report Card Yet</p>
            <p style={{ color: '#94A3B8', fontSize: '.84rem' }}>
              Make sure exam scores are entered for <strong>{selectedTerm?.name} {selectedTerm?.session}</strong>, then click Generate.
            </p>
          </div>
        ) : (
          <>
            {/* Report Card */}
            <div id="report-card-print" ref={printRef}>

              <div className="rc-header">
  {school?.logoUrl
    ? <img src={school.logoUrl} alt="logo" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'contain', background: '#fff', padding: 4, border: '2px solid rgba(201,150,58,.4)', flexShrink: 0 }} />
    : <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg,#C9963A,#E8B85A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>📚</div>}
  <div style={{ flex: 1, minWidth: 0 }}>
    <p style={{ color: '#C9963A', fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', margin: '0 0 .2rem' }}>Student Report Card</p>
    <p style={{ color: '#fff', fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: '1.15rem', margin: '0 0 .1rem' }}>
      {school?.name || 'Academic Performance Report'}
    </p>
    <p style={{ color: '#64748B', fontSize: '.76rem', margin: 0 }}>{card.term} · Session {card.session}{school?.address ? ` · ${school.address}` : ''}</p>
  </div>
                <div>
                  <div style={{ background: card.isPublished ? 'rgba(34,197,94,.15)' : 'rgba(148,163,184,.15)', borderRadius: 8, padding: '.3rem .65rem' }}>
                    <span style={{ fontSize: '.68rem', fontWeight: 700, color: card.isPublished ? '#4ADE80' : '#64748B' }}>
                      {card.isPublished ? '● PUBLISHED' : '○ DRAFT'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Student info */}
              <div className="rc-student-grid" style={{ background: '#FFFBEB', borderBottom: '1px solid #FDE68A', padding: '1rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '.85rem' }}>
                {[
                  { label: 'Student Name', value: `${student?.firstName} ${student?.lastName}` },
                  { label: 'Class',        value: card.className },
                  { label: 'Term',         value: `${card.term} · ${card.session}` },
                  { label: 'Admission No', value: student?.studentId || '—' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p style={{ fontSize: '.63rem', fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: '.07em', margin: '0 0 .15rem' }}>{label}</p>
                    <p style={{ fontSize: '.87rem', fontWeight: 700, color: '#0B1D3A', margin: 0 }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Scores table */}
              <div style={{ padding: '1.25rem 1.5rem', overflowX: 'auto' }}>
                <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '.88rem', margin: '0 0 .75rem', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '2px solid #C9963A', paddingBottom: '.35rem' }}>
                  Subject Performance
                </p>
                <table className="rc-tbl">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left' }}>Subject</th>
                      <th>CA (30)</th>
                      <th>Exam (70)</th>
                      <th>Total</th>
                      <th>Grade</th>
                      <th>Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map(r => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 600 }}>{r.subject.name}</td>
                        <td style={{ textAlign: 'center' }}>{r.caScore}</td>
                        <td style={{ textAlign: 'center' }}>{r.examScore}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>{r.total}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="grade-badge" style={{ background: gradeColor(r.grade) + '1A', color: gradeColor(r.grade) }}>{r.grade}</span>
                        </td>
                        <td style={{ color: gradeColor(r.grade), fontSize: '.78rem', fontWeight: 600 }}>{r.remark}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3}>Total / Average</td>
                      <td style={{ textAlign: 'center', fontSize: '1rem' }}>{card.totalMarks} / {card.averageScore}%</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ background: gradeColor(card.grade) + '33', color: '#fff', padding: '.2rem .5rem', borderRadius: 6, fontSize: '.8rem', fontWeight: 800 }}>{card.grade}</span>
                      </td>
                      <td>{card.remark}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Summary */}
              <div className="rc-summary-grid" style={{ background: '#F8FAFC', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '1rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '.85rem' }}>
                {[
                  { label: 'Total Marks',    value: card.totalMarks },
                  { label: 'Average Score',  value: `${card.averageScore}%` },
                  { label: 'Class Position', value: ordinal(card.position) },
                  { label: 'Out of',         value: `${card.totalStudents} students` },
                ].map(({ label, value }) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '.63rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.07em', margin: '0 0 .2rem' }}>{label}</p>
                    <p style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0B1D3A', fontFamily: "'Playfair Display',serif", margin: 0 }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Remarks */}
              <div className="rc-remarks-grid" style={{ padding: '1.1rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.1rem' }}>
                {[
                  { label: "Class Teacher's Remark", value: card.classTeacherRemark },
                  { label: "Principal's Remark",     value: card.principalRemark },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p style={{ fontSize: '.68rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.07em', margin: '0 0 .3rem' }}>{label}</p>
                    <div style={{ padding: '.6rem .85rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, minHeight: 46 }}>
                      <p style={{ fontSize: '.84rem', margin: 0, fontStyle: value ? 'normal' : 'italic', color: value ? '#0B1D3A' : '#CBD5E1' }}>{value || 'No remark added'}</p>
                    </div>
                    <p style={{ fontSize: '.7rem', color: '#94A3B8', margin: '.4rem 0 0', borderTop: '1px solid #E2E8F0', paddingTop: '.35rem' }}>
                      {label.replace("'s Remark", "'s Signature")}
                    </p>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={{ background: '#0B1D3A', padding: '.7rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '.5rem' }}>
                <p style={{ color: '#475569', fontSize: '.7rem', margin: 0 }}>Generated by Klas School Management Platform</p>
                <p style={{ color: '#C9963A', fontSize: '.7rem', fontWeight: 600, margin: 0 }}>{new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

            {/* Admin controls */}
            <div className="card no-print" style={{ marginTop: '1.25rem', padding: '1.25rem' }}>
              <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', margin: '0 0 1rem', fontSize: '.95rem' }}>Add Remarks</p>
              <div className="rc-remarks-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '.68rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.3rem' }}>Class Teacher's Remark</label>
                  <textarea className="remark-input" value={teacherRemark} onChange={e => setTeacherRemark(e.target.value)} placeholder="e.g. A hardworking student…" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '.68rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.3rem' }}>Principal's Remark</label>
                  <textarea className="remark-input" value={principalRemark} onChange={e => setPrincipalRemark(e.target.value)} placeholder="e.g. Keep up the excellent performance…" />
                </div>
              </div>
              <div className="remarks-btns" style={{ display: 'flex', gap: '.75rem', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                <button onClick={saveRemarks} disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: '.4rem', padding: '.7rem 1.3rem', borderRadius: 11, border: 'none', background: 'linear-gradient(135deg,#0B1D3A,#162D54)', color: '#fff', fontFamily: "'DM Sans',sans-serif", fontSize: '.85rem', fontWeight: 700, cursor: 'pointer', opacity: saving ? .7 : 1, whiteSpace: 'nowrap' }}>
                  {saving ? 'Saving…' : '💾 Save Remarks'}
                </button>
                <button onClick={togglePublish} disabled={publishing}
                  style={{ display: 'flex', alignItems: 'center', gap: '.4rem', padding: '.7rem 1.3rem', borderRadius: 11, border: 'none', background: card.isPublished ? '#FEE2E2' : 'linear-gradient(135deg,#22C55E,#16A34A)', color: card.isPublished ? '#DC2626' : '#fff', fontFamily: "'DM Sans',sans-serif", fontSize: '.85rem', fontWeight: 700, cursor: 'pointer', opacity: publishing ? .7 : 1, whiteSpace: 'nowrap' }}>
                  {card.isPublished ? <><EyeOff size={14} /> Hide from Parents</> : <><Eye size={14} /> Publish to Parents</>}
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B1D3A' }}><div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid rgba(201,150,58,.2)', borderTopColor: '#C9963A', animation: 'spin .8s linear infinite' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>}>
      <ReportCardPage />
    </Suspense>
  );
}

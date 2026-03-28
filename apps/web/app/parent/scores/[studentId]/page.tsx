'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, BookOpen, FileText, DollarSign, School, AlertCircle } from 'lucide-react';

type PerformanceData = {
  attendance:  { date: string; status: string; subject: string | null }[];
  scores:      { term: string; assessmentType: string; score: number; maxScore: number; comments: string | null }[];
  assignments: { title: string; description: string | null; dueDate: string | null; createdAt: string }[];
  fees:        { term: string; amountDue: number; amountPaid: number; status: string; lastPaymentDate: string | null }[];
};

export default function ParentStudentScores() {
  const { studentId } = useParams<{ studentId: string }>();
  const [data,    setData]    = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!studentId) { setError('Please provide a valid Student ID in the URL'); setLoading(false); return; }
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/public/student/${studentId}/performance`)
      .then(res => {
        if (!res.ok) throw new Error(res.status === 404 ? 'Student not found or invalid ID' : 'Server error');
        return res.json();
      })
      .then((result: PerformanceData) => { setData(result); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [studentId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B1D3A' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid rgba(201,150,58,.2)', borderTopColor: '#C9963A', animation: 'spin .8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: '#94A3B8', fontFamily: "'DM Sans',sans-serif", animation: 'pulse 1.8s ease infinite' }}>Loading student data…</p>
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#F0EFE9', fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '2.5rem', maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(11,29,58,.1)' }}>
        <AlertCircle size={40} color="#E11D48" style={{ margin: '0 auto 1rem' }} />
        <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '1.1rem', marginBottom: '.5rem' }}>Not Found</p>
        <p style={{ color: '#94A3B8', fontSize: '.85rem', marginBottom: '1.5rem' }}>{error || 'No data available'}</p>
        <Link href="/parent/view" style={{ background: 'linear-gradient(135deg,#C9963A,#E8B85A)', color: '#0B1D3A', fontWeight: 700, fontSize: '.88rem', padding: '.75rem 1.5rem', borderRadius: 11, textDecoration: 'none', display: 'inline-block' }}>
          ← Back to Portal
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full" style={{ fontFamily: "'DM Sans',sans-serif", background: '#F0EFE9' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        .fade-up   { animation:fadeUp .5s ease both; }
        .fade-up-1 { animation:fadeUp .5s .08s ease both; }
        .gold-shimmer { background:linear-gradient(90deg,#C9963A 0%,#F0C060 40%,#C9963A 60%,#E8B85A 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 4s linear infinite; }
        .hero-dot-grid { background-image:radial-gradient(circle,rgba(201,150,58,.13) 1px,transparent 1px);background-size:28px 28px; }
        .section-card { background:#fff;border:1px solid #E2E8F0;border-radius:20px;overflow:hidden;box-shadow:0 2px 14px rgba(11,29,58,.06);margin-bottom:1.25rem; }
        .card-header { padding:1rem 1.25rem;background:#FAFAF8;border-bottom:1px solid #E8EDF3;display:flex;align-items:center;gap:.75rem; }
        .card-body { padding:1.25rem; }
        .att-chip { display:inline-block;padding:.2rem .65rem;border-radius:999px;font-size:.72rem;font-weight:700; }
        .score-row { display:grid;grid-template-columns:1fr 1fr 80px 80px;gap:.5rem;align-items:center;padding:.7rem .85rem;border-radius:10px;font-size:.82rem; }
        .score-row:nth-child(even) { background:#F8FAFC; }
        .fee-card { border-radius:14px;padding:1rem 1.1rem;border:1.5px solid; }
        @media(max-width:600px) {
          .score-row { grid-template-columns:1fr 1fr;gap:.35rem; }
          .score-row .hide-mobile { display:none; }
        }
      `}</style>

      {/* Header */}
      <header className="fade-up sticky top-0 z-20" style={{ background:'#0B1D3A', borderBottom:'2px solid rgba(201,150,58,.5)' }}>
        <div style={{ padding:'.85rem 1.25rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'.75rem' }}>
            <div style={{ width:32, height:32, borderRadius:9, background:'linear-gradient(135deg,#C9963A,#E8B85A)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <School size={15} color="#0B1D3A" />
            </div>
            <p style={{ fontFamily:"'Playfair Display',serif", color:'#fff', fontWeight:700, fontSize:'.88rem' }}>Klas Platform</p>
          </div>
          <Link href="/parent/view" style={{ display:'flex', alignItems:'center', gap:'.4rem', background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.13)', color:'#94A3B8', padding:'.45rem .85rem', borderRadius:9, fontSize:'.78rem', fontWeight:500, textDecoration:'none' }}>
            <ArrowLeft size={13} /> Portal
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden fade-up" style={{ background:'#0B1D3A' }}>
        <div className="hero-dot-grid" style={{ position:'absolute', inset:0 }} />
        <div style={{ position:'relative', padding:'2.5rem 1.25rem 1rem', textAlign:'center' }}>
          <p style={{ color:'#64748B', fontSize:'.72rem', textTransform:'uppercase', letterSpacing:'.1em', fontWeight:500, marginBottom:'.4rem' }}>Student Report</p>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(1.6rem,4vw,2.4rem)', fontWeight:800, color:'#fff', lineHeight:1.15 }}>
            Performance <span className="gold-shimmer">Report</span>
          </h1>
          <p style={{ color:'#64748B', fontSize:'.82rem', marginTop:'.4rem' }}>ID: {studentId}</p>
          {/* Quick jump pills */}
          <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'.5rem', marginTop:'1.25rem' }}>
            {[
              { id:'attendance', label:'Attendance', color:'#059669' },
              { id:'scores',     label:'Scores',     color:'#1A56A0' },
              { id:'assignments',label:'Assignments', color:'#B45309' },
              { id:'fees',       label:'Fees',        color:'#7C3AED' },
            ].map(({ id, label, color }) => (
              <button key={id} onClick={() => document.getElementById(id)?.scrollIntoView({ behavior:'smooth' })}
                style={{ background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.15)', color:'#fff', padding:'.35rem .85rem', borderRadius:999, fontSize:'.75rem', fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ height:20, background:'linear-gradient(to bottom,transparent,#F0EFE9)' }} />
      </div>

      <main className="fade-up-1" style={{ maxWidth:800, width:'100%', margin:'0 auto', padding:'1.5rem 1rem 4rem' }}>

        {/* Attendance */}
        <div id="attendance" className="section-card">
          <div className="card-header">
            <div style={{ width:36, height:36, borderRadius:10, background:'#E6FFEE', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Calendar size={17} color="#059669" />
            </div>
            <div>
              <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, color:'#0B1D3A', fontSize:'.92rem' }}>Attendance History</p>
              <p style={{ color:'#94A3B8', fontSize:'.7rem' }}>{data.attendance.length} records</p>
            </div>
          </div>
          <div className="card-body">
            {data.attendance.length === 0 ? (
              <p style={{ color:'#94A3B8', fontSize:'.85rem', textAlign:'center', padding:'1.5rem 0' }}>No attendance records yet</p>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'.75rem' }}>
                {data.attendance.map((r, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'.75rem', padding:'.85rem', borderRadius:12, border:'1px solid #F1F5F9', background:'#FAFAF8' }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background: r.status === 'PRESENT' ? '#22C55E' : '#EF4444', flexShrink:0, marginTop:5 }} />
                    <div>
                      <p style={{ fontWeight:600, color:'#0B1D3A', fontSize:'.83rem' }}>{new Date(r.date).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}</p>
                      <span className="att-chip" style={{ background: r.status === 'PRESENT' ? '#DCFCE7' : '#FEE2E2', color: r.status === 'PRESENT' ? '#16A34A' : '#DC2626', marginTop:3 }}>{r.status}</span>
                      <p style={{ color:'#94A3B8', fontSize:'.72rem', marginTop:3 }}>{r.subject || 'General'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Scores */}
        <div id="scores" className="section-card">
          <div className="card-header">
            <div style={{ width:36, height:36, borderRadius:10, background:'#EBF4FF', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <BookOpen size={17} color="#1A56A0" />
            </div>
            <div>
              <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, color:'#0B1D3A', fontSize:'.92rem' }}>Academic Scores</p>
              <p style={{ color:'#94A3B8', fontSize:'.7rem' }}>{data.scores.length} entries</p>
            </div>
          </div>
          <div style={{ padding:'0 .5rem .75rem' }}>
            {data.scores.length === 0 ? (
              <p style={{ color:'#94A3B8', fontSize:'.85rem', textAlign:'center', padding:'1.5rem 0' }}>No scores recorded yet</p>
            ) : (
              <>
                <div className="score-row" style={{ color:'#94A3B8', fontSize:'.68rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em' }}>
                  <span>Term / Type</span><span>Score</span>
                  <span className="hide-mobile" style={{ textAlign:'center' }}>Max</span>
                  <span className="hide-mobile">Comments</span>
                </div>
                {data.scores.map((s, i) => {
                  const pct = Math.round((s.score / s.maxScore) * 100);
                  const barColor = pct >= 70 ? '#059669' : pct >= 50 ? '#C9963A' : '#EF4444';
                  return (
                    <div key={i} className="score-row">
                      <div>
                        <p style={{ fontWeight:600, color:'#0B1D3A', fontSize:'.82rem' }}>{s.term}</p>
                        <p style={{ color:'#94A3B8', fontSize:'.72rem' }}>{s.assessmentType}</p>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:'.4rem' }}>
                        <span style={{ fontWeight:700, color:'#0B1D3A', fontSize:'.85rem', flexShrink:0 }}>{s.score}/{s.maxScore}</span>
                        <div style={{ flex:1, height:5, background:'#E2E8F0', borderRadius:999, overflow:'hidden', minWidth:30 }}>
                          <div style={{ width:`${pct}%`, height:'100%', background:barColor, borderRadius:999 }} />
                        </div>
                        <span style={{ fontSize:'.7rem', fontWeight:700, color:barColor, flexShrink:0 }}>{pct}%</span>
                      </div>
                      <span className="hide-mobile" style={{ textAlign:'center', color:'#475569', fontSize:'.82rem' }}>{s.maxScore}</span>
                      <span className="hide-mobile" style={{ color:'#94A3B8', fontSize:'.78rem' }}>{s.comments || '—'}</span>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* Assignments */}
        <div id="assignments" className="section-card">
          <div className="card-header">
            <div style={{ width:36, height:36, borderRadius:10, background:'#FFFBEB', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <FileText size={17} color="#B45309" />
            </div>
            <div>
              <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, color:'#0B1D3A', fontSize:'.92rem' }}>Assignments</p>
              <p style={{ color:'#94A3B8', fontSize:'.7rem' }}>{data.assignments.length} items</p>
            </div>
          </div>
          <div className="card-body">
            {data.assignments.length === 0 ? (
              <p style={{ color:'#94A3B8', fontSize:'.85rem', textAlign:'center', padding:'1.5rem 0' }}>No assignments posted yet</p>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
                {data.assignments.map((a, i) => (
                  <div key={i} style={{ padding:'1rem', borderRadius:12, border:'1px solid #F1F5F9', background:'#FAFAF8' }}>
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'.75rem', flexWrap:'wrap' }}>
                      <p style={{ fontWeight:700, color:'#0B1D3A', fontSize:'.88rem' }}>{a.title}</p>
                      {a.dueDate && (
                        <span style={{ background:'#FEF3C7', color:'#B45309', fontSize:'.7rem', fontWeight:700, padding:'.2rem .6rem', borderRadius:20, whiteSpace:'nowrap', flexShrink:0 }}>
                          Due {new Date(a.dueDate).toLocaleDateString('en-GB', { day:'numeric', month:'short' })}
                        </span>
                      )}
                    </div>
                    {a.description && <p style={{ color:'#475569', fontSize:'.83rem', marginTop:'.4rem', lineHeight:1.6 }}>{a.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Fees */}
        <div id="fees" className="section-card">
          <div className="card-header">
            <div style={{ width:36, height:36, borderRadius:10, background:'#F3E8FF', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <DollarSign size={17} color="#7C3AED" />
            </div>
            <div>
              <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, color:'#0B1D3A', fontSize:'.92rem' }}>School Fees</p>
              <p style={{ color:'#94A3B8', fontSize:'.7rem' }}>{data.fees.length} terms</p>
            </div>
          </div>
          <div className="card-body">
            {data.fees.length === 0 ? (
              <p style={{ color:'#94A3B8', fontSize:'.85rem', textAlign:'center', padding:'1.5rem 0' }}>No fee records found</p>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:'1rem' }}>
                {data.fees.map((f, i) => {
                  const paid    = f.status === 'PAID'    || f.status === 'Paid';
                  const partial = f.status === 'PARTIAL' || f.status === 'Partial';
                  const balance = f.amountDue - f.amountPaid;
                  return (
                    <div key={i} className="fee-card" style={{ background: paid ? '#F0FDF4' : partial ? '#FFFBEB' : '#FFF1F2', borderColor: paid ? '#86EFAC' : partial ? '#FDE68A' : '#FECDD3' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'.75rem' }}>
                        <p style={{ fontWeight:700, color:'#0B1D3A', fontSize:'.88rem' }}>{f.term}</p>
                        <span style={{ background: paid ? '#DCFCE7' : partial ? '#FEF9C3' : '#FEE2E2', color: paid ? '#16A34A' : partial ? '#CA8A04' : '#DC2626', fontSize:'.68rem', fontWeight:700, padding:'.2rem .6rem', borderRadius:20 }}>{f.status}</span>
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', gap:'.3rem', fontSize:'.82rem' }}>
                        <div style={{ display:'flex', justifyContent:'space-between' }}>
                          <span style={{ color:'#64748B' }}>Amount Due</span>
                          <span style={{ fontWeight:600, color:'#0B1D3A' }}>₦{f.amountDue.toLocaleString()}</span>
                        </div>
                        <div style={{ display:'flex', justifyContent:'space-between' }}>
                          <span style={{ color:'#64748B' }}>Amount Paid</span>
                          <span style={{ fontWeight:600, color:'#16A34A' }}>₦{f.amountPaid.toLocaleString()}</span>
                        </div>
                        {!paid && (
                          <div style={{ display:'flex', justifyContent:'space-between', paddingTop:'.3rem', borderTop:`1px solid ${partial ? '#FDE68A' : '#FECDD3'}`, marginTop:'.2rem' }}>
                            <span style={{ fontWeight:600, color:'#64748B' }}>Balance</span>
                            <span style={{ fontWeight:700, color: partial ? '#CA8A04' : '#DC2626' }}>₦{balance.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </main>

      <footer style={{ background:'#0B1D3A', borderTop:'1px solid rgba(201,150,58,.15)', padding:'1rem 1.25rem', textAlign:'center' }}>
        <p style={{ color:'#475569', fontSize:'.75rem' }}>Powered by <span style={{ color:'#C9963A', fontWeight:600 }}>Klas School Management Platform</span></p>
      </footer>
    </div>
  );
}

'use client';
// apps/web/app/parent/student/[id]/page.tsx
// Shows full details for one child - attendance calendar, fees, scores, report card

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, Calendar, BookOpen, BarChart2, FileText,
  Award, Building2, CreditCard, Copy, CheckCircle,
  AlertCircle, X, ChevronLeft, ChevronRight, School
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type AttRecord = { date: string; status: string; subject: string | null };
type StudentData = {
  student: { firstName: string; lastName: string; studentId?: string; className?: string };
  attendance:  AttRecord[];
  assignments: { title: string; description: string | null; dueDate: string | null }[];
  scores:      { term: string; assessmentType: string; score: number; maxScore: number; comments: string | null }[];
  fees:        { term: string; amountDue: number; amountPaid: number; status: string; lastPaymentDate: string | null }[];
  school: { id: string | null; subdomain: string | null; bankName: string | null; accountNumber: string | null; accountName: string | null; name?: string } | null;
};

function AttendanceCalendar({ records }: { records: AttRecord[] }) {
  const today = new Date();
  const statusMap = useMemo(() => {
    const map: Record<string, string> = {};
    records.forEach(r => { map[new Date(r.date).toISOString().split('T')[0]!] = r.status; });
    return map;
  }, [records]);

  const months = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => { const d = new Date(r.date); set.add(`${d.getFullYear()}-${d.getMonth()}`); });
    return Array.from(set).sort();
  }, [records]);

  const [monthIdx, setMonthIdx] = useState(() => months.length - 1);
  const [year, month] = useMemo(() => {
    const p = months[monthIdx]?.split('-').map(Number);
    return p ? [p[0]!, p[1]!] : [today.getFullYear(), today.getMonth()];
  }, [monthIdx, months]);

  const monthName   = new Date(year, month, 1).toLocaleDateString('en-NG', { month: 'long', year: 'numeric' });
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const stats = useMemo(() => {
    let present = 0, absent = 0, late = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const s = statusMap[key];
      if (s === 'PRESENT') present++;
      else if (s === 'ABSENT') absent++;
      else if (s === 'LATE') late++;
    }
    return { present, absent, late };
  }, [year, month, daysInMonth, statusMap]);

  const total = stats.present + stats.absent + stats.late;
  const pct   = total > 0 ? Math.round((stats.present / total) * 100) : null;
  const DAYS  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
        <button onClick={() => setMonthIdx(i => Math.max(0, i-1))} disabled={monthIdx===0}
          style={{ width:34, height:34, borderRadius:9, border:'1.5px solid #E2E8F0', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:monthIdx===0?'not-allowed':'pointer', opacity:monthIdx===0?.4:1 }}>
          <ChevronLeft size={15} color="#64748B" />
        </button>
        <div style={{ textAlign:'center' }}>
          <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, color:'#0B1D3A', fontSize:'.95rem', margin:0 }}>{monthName}</p>
          {pct !== null && <p style={{ color:pct>=75?'#059669':pct>=50?'#B45309':'#DC2626', fontSize:'.72rem', fontWeight:700, margin:'.1rem 0 0' }}>{pct}% attendance</p>}
        </div>
        <button onClick={() => setMonthIdx(i => Math.min(months.length-1, i+1))} disabled={monthIdx===months.length-1}
          style={{ width:34, height:34, borderRadius:9, border:'1.5px solid #E2E8F0', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:monthIdx===months.length-1?'not-allowed':'pointer', opacity:monthIdx===months.length-1?.4:1 }}>
          <ChevronRight size={15} color="#64748B" />
        </button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3, marginBottom:3 }}>
        {DAYS.map(d => <div key={d} style={{ textAlign:'center', fontSize:'.6rem', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', padding:'.25rem 0' }}>{d}</div>)}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3 }}>
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const key = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          const status = statusMap[key];
          const isToday = year===today.getFullYear() && month===today.getMonth() && day===today.getDate();
          const dow = new Date(year, month, day).getDay();
          const weekend = dow===0||dow===6;
          let bg = weekend?'#F8FAFC':'#F1F5F9', color = weekend?'#CBD5E1':'#94A3B8', border = 'transparent', dot: string|null = null;
          if (status==='PRESENT') { bg='#DCFCE7'; color='#15803D'; border='#86EFAC'; dot='#22C55E'; }
          else if (status==='ABSENT') { bg='#FEE2E2'; color='#DC2626'; border='#FCA5A5'; dot='#EF4444'; }
          else if (status==='LATE') { bg='#FEF9C3'; color='#CA8A04'; border='#FDE047'; dot='#EAB308'; }
          return (
            <div key={day} style={{ aspectRatio:'1', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', borderRadius:7, background:bg, border:`1.5px solid ${isToday?'#C9963A':border}`, padding:2 }}>
              <span style={{ fontSize:'clamp(.6rem,.85vw,.76rem)', fontWeight:status?700:500, color, lineHeight:1 }}>{day}</span>
              {dot && <div style={{ width:4, height:4, borderRadius:'50%', background:dot, marginTop:2 }} />}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop:'1rem', display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:'.6rem' }}>
        <div style={{ display:'flex', gap:'.65rem', flexWrap:'wrap' }}>
          {[{color:'#22C55E',bg:'#DCFCE7',label:`Present (${stats.present})`},{color:'#EF4444',bg:'#FEE2E2',label:`Absent (${stats.absent})`},{color:'#EAB308',bg:'#FEF9C3',label:`Late (${stats.late})`}].map(({color,bg,label}) => (
            <div key={label} style={{ display:'flex', alignItems:'center', gap:'.28rem' }}>
              <div style={{ width:10, height:10, borderRadius:3, background:bg, border:`1.5px solid ${color}` }} />
              <span style={{ fontSize:'.7rem', color:'#64748B', fontWeight:500 }}>{label}</span>
            </div>
          ))}
        </div>
        {pct !== null && <span style={{ fontSize:'.7rem', fontWeight:700, padding:'.18rem .7rem', borderRadius:999, background:pct>=75?'#DCFCE7':pct>=50?'#FFFBEB':'#FEE2E2', color:pct>=75?'#15803D':pct>=50?'#92400E':'#B91C1C', border:`1px solid ${pct>=75?'#86EFAC':pct>=50?'#FDE68A':'#FCA5A5'}` }}>{pct}% this month</span>}
      </div>
      {months.length > 1 && (
        <div style={{ display:'flex', justifyContent:'center', gap:'.35rem', marginTop:'.85rem' }}>
          {months.map((_,i) => <button key={i} onClick={() => setMonthIdx(i)} style={{ width:i===monthIdx?18:7, height:7, borderRadius:999, border:'none', cursor:'pointer', background:i===monthIdx?'#C9963A':'#E2E8F0', transition:'all .2s', padding:0 }} />)}
        </div>
      )}
    </div>
  );
}

export default function ParentStudentPage() {
  const router = useRouter();
  const { id } = useParams();
  const [data,    setData]    = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [payModal, setPayModal] = useState<{ fee: StudentData['fees'][0] } | null>(null);
  const [copied,   setCopied]  = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('parentToken');
    if (!token) { router.push('/parent/login'); return; }

    fetch(`${API}/public/student/${id}/performance`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => { if (!res.ok) throw new Error('Failed to load'); return res.json(); })
      .then(d => setData(d))
      .catch(() => setError('Failed to load student data'))
      .finally(() => setLoading(false));
  }, [id]);

  const copyAcct = () => {
    const num = data?.school?.accountNumber;
    if (!num) return;
    navigator.clipboard.writeText(num).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); });
  };

  const bank           = data?.school;
  const hasBankDetails = !!(bank?.bankName && bank?.accountNumber && bank?.accountName);

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F0EFE9' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width:40, height:40, borderRadius:'50%', border:'3px solid rgba(201,150,58,.2)', borderTopColor:'#C9963A', animation:'spin .8s linear infinite' }} />
    </div>
  );

  if (error || !data) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F0EFE9', fontFamily:"'DM Sans',sans-serif", padding:'1.5rem' }}>
      <div style={{ background:'#fff', borderRadius:20, padding:'2rem', maxWidth:400, textAlign:'center', boxShadow:'0 4px 28px rgba(11,29,58,.1)' }}>
        <AlertCircle size={36} color="#E11D48" style={{ margin:'0 auto 1rem' }} />
        <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, color:'#0B1D3A', fontSize:'1rem', marginBottom:'.5rem' }}>Could not load data</p>
        <button onClick={() => router.push('/parent/dashboard')} style={{ background:'#0B1D3A', color:'#fff', border:'none', borderRadius:10, padding:'.7rem 1.5rem', fontFamily:"'DM Sans',sans-serif", fontWeight:600, cursor:'pointer' }}>← Back to Dashboard</button>
      </div>
    </div>
  );

  const { student, attendance, assignments, scores, fees } = data;

  return (
    <div style={{ minHeight:'100vh', background:'#F0EFE9', fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing:border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .card { background:#fff; border:1px solid #E2E8F0; border-radius:18px; overflow:hidden; box-shadow:0 2px 14px rgba(11,29,58,.05); margin-bottom:1.25rem; }
        .card-header { padding:1rem 1.4rem; border-bottom:1px solid #E2E8F0; background:#FAFBFF; display:flex; align-items:center; gap:.7rem; }
        .card-icon { width:34px; height:34px; border-radius:9px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .card-title { font-family:'Playfair Display',serif; font-size:1rem; font-weight:700; color:#0B1D3A; }
        .card-body { padding:1.4rem; }
        .scores-table { width:100%; border-collapse:collapse; min-width:400px; }
        .scores-table th { padding:.6rem .9rem; font-size:.7rem; font-weight:600; color:#94A3B8; text-transform:uppercase; letter-spacing:.07em; border-bottom:1px solid #E2E8F0; background:#FAFBFF; text-align:left; }
        .scores-table td { padding:.75rem .9rem; font-size:.87rem; color:#334155; border-bottom:1px solid #F1F5F9; }
        .scores-table tr:last-child td { border-bottom:none; }
        .fees-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:1rem; }
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.55); display:flex; align-items:center; justify-content:center; z-index:50; padding:1rem; backdrop-filter:blur(4px); }
        .modal-box { background:#fff; border-radius:22px; width:100%; max-width:400px; box-shadow:0 28px 70px rgba(0,0,0,.22); overflow:hidden; animation:slideDown .3s ease both; }
        .bank-row { display:flex; align-items:center; justify-content:space-between; padding:.8rem .9rem; border-radius:12px; background:#F8FAFC; border:1px solid #E2E8F0; margin-bottom:.55rem; }
        .copy-btn { display:inline-flex; align-items:center; gap:.3rem; padding:.32rem .65rem; border-radius:7px; border:1.5px solid #E2E8F0; background:#fff; font-family:'DM Sans',sans-serif; font-size:.7rem; font-weight:600; color:#64748B; cursor:pointer; transition:all .15s; flex-shrink:0; }
        .copy-btn:hover { border-color:#C9963A; color:#C9963A; }
        .copy-btn.copied { background:#DCFCE7; border-color:#86EFAC; color:#15803D; }
        @media print { .no-print{display:none!important} }
      `}</style>

      {/* Header */}
      <header style={{ background:'#0B1D3A', borderBottom:'2px solid rgba(201,150,58,.4)', position:'sticky', top:0, zIndex:20 }}>
        <div style={{ maxWidth:860, margin:'0 auto', padding:'.85rem 1.25rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <button onClick={() => router.push('/parent/dashboard')}
            style={{ display:'flex', alignItems:'center', gap:'.4rem', background:'none', border:'none', color:'#C9963A', cursor:'pointer', fontSize:'.82rem', fontWeight:600, fontFamily:"'DM Sans',sans-serif" }}>
            <ArrowLeft size={14} /> Back
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:'.6rem' }}>
            <div style={{ width:30, height:30, borderRadius:8, background:'linear-gradient(135deg,#C9963A,#E8B85A)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <School size={14} color="#0B1D3A" />
            </div>
            <span style={{ fontFamily:"'Playfair Display',serif", color:'#fff', fontWeight:700, fontSize:'.92rem' }}>
              {student.firstName} {student.lastName}
            </span>
          </div>
          <button onClick={() => window.print()}
            style={{ display:'flex', alignItems:'center', gap:'.35rem', background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.12)', color:'#94A3B8', padding:'.4rem .8rem', borderRadius:9, fontSize:'.78rem', fontWeight:500, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
            🖨️ Print
          </button>
        </div>
      </header>

      {/* Student info strip */}
      <div style={{ background:'#0B1D3A', borderBottom:'1px solid rgba(201,150,58,.2)' }}>
        <div style={{ maxWidth:860, margin:'0 auto', padding:'1.25rem 1.25rem .9rem', display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
          <div style={{ width:52, height:52, borderRadius:13, background:'linear-gradient(135deg,#C9963A,#E8B85A)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:800, color:'#0B1D3A', fontSize:'1.2rem' }}>
              {student.firstName[0]}{student.lastName[0]}
            </span>
          </div>
          <div>
            <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:800, color:'#fff', fontSize:'1.15rem', margin:0 }}>
              {student.firstName} {student.lastName}
            </p>
            <p style={{ color:'#C9963A', fontSize:'.78rem', margin:'.1rem 0 0' }}>
              {student.className && `${student.className} · `}
              {student.studentId && `ID: ${student.studentId}`}
              {data.school?.name && ` · ${data.school.name}`}
            </p>
          </div>
        </div>
        <div style={{ height:16, background:'linear-gradient(to bottom,transparent,#F0EFE9)' }} />
      </div>

      <main style={{ maxWidth:860, margin:'0 auto', padding:'1.25rem 1.25rem 3rem' }}>

        {/* Report Card Banner */}
        <div className="no-print" style={{ background:'linear-gradient(135deg,#0B1D3A,#162D54)', borderRadius:18, padding:'1.1rem 1.4rem', border:'1px solid rgba(201,150,58,.3)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem', flexWrap:'wrap', marginBottom:'1.25rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'.85rem' }}>
            <div style={{ width:40, height:40, borderRadius:11, background:'rgba(201,150,58,.15)', border:'1px solid rgba(201,150,58,.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Award size={18} color="#C9963A" />
            </div>
            <div>
              <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, color:'#fff', fontSize:'.9rem', margin:0 }}>Term Report Card</p>
              <p style={{ color:'#94A3B8', fontSize:'.74rem', margin:0 }}>Full grades, position & teacher remarks</p>
            </div>
          </div>
          <a href={`/parent/results?studentId=${id}`} style={{ display:'inline-flex', alignItems:'center', gap:'.4rem', background:'linear-gradient(135deg,#C9963A,#E8B85A)', color:'#0B1D3A', fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:'.82rem', padding:'.6rem 1.1rem', borderRadius:10, textDecoration:'none', whiteSpace:'nowrap' }}>
            <FileText size={13} /> Open Report Card
          </a>
        </div>

        {/* Attendance */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon" style={{ background:'#E6FFEE' }}><Calendar size={15} color="#059669" /></div>
            <span className="card-title">Attendance Calendar</span>
            <span style={{ marginLeft:'auto', color:'#94A3B8', fontSize:'.73rem', fontWeight:500 }}>{attendance.length} records</span>
          </div>
          <div className="card-body">
            {attendance.length === 0
              ? <p style={{ color:'#94A3B8', fontSize:'.85rem', textAlign:'center', padding:'1.5rem 0' }}>No attendance records yet</p>
              : <AttendanceCalendar records={attendance} />}
          </div>
        </div>

        {/* Fees */}
        <div className="card" id="fees">
          <div className="card-header">
            <div className="card-icon" style={{ background:'#F3E8FF' }}>
              <span style={{ fontWeight:800, fontSize:'1rem', color:'#7C3AED', lineHeight:1 }}>₦</span>
            </div>
            <span className="card-title">School Fees</span>
            <span style={{ marginLeft:'auto', color:'#94A3B8', fontSize:'.73rem', fontWeight:500 }}>{fees.length} terms</span>
          </div>
          <div className="card-body">
            {fees.length === 0 ? (
              <p style={{ color:'#94A3B8', fontSize:'.85rem', textAlign:'center', padding:'1.5rem 0' }}>No fee records found</p>
            ) : (
              <div className="fees-grid">
                {fees.map((f, idx) => {
                  const paid    = f.status === 'PAID' || f.status === 'Paid';
                  const partial = f.status === 'PARTIAL' || f.status === 'Partial';
                  const balance = f.amountDue - f.amountPaid;
                  return (
                    <div key={idx} style={{ padding:'1.1rem', borderRadius:14, border:`1px solid ${paid?'#6EE7B7':partial?'#FDE68A':'#FCA5A5'}`, background:paid?'#ECFDF5':partial?'#FFFBEB':'#FFF1F2' }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'.85rem', flexWrap:'wrap', gap:'.5rem' }}>
                        <p style={{ fontWeight:700, color:'#0B1D3A', fontSize:'.88rem', margin:0 }}>{f.term}</p>
                        <span style={{ fontSize:'.72rem', fontWeight:700, padding:'.18rem .55rem', borderRadius:999, background:paid?'#DCFCE7':partial?'#FEF3C7':'#FEE2E2', color:paid?'#15803D':partial?'#92400E':'#B91C1C' }}>{f.status}</span>
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', gap:'.35rem', fontSize:'.83rem', marginBottom:'.85rem' }}>
                        <div style={{ display:'flex', justifyContent:'space-between' }}><span style={{ color:'#64748B' }}>Amount Due</span><span style={{ fontWeight:700 }}>₦{f.amountDue.toLocaleString()}</span></div>
                        <div style={{ display:'flex', justifyContent:'space-between' }}><span style={{ color:'#64748B' }}>Amount Paid</span><span style={{ fontWeight:700, color:'#059669' }}>₦{f.amountPaid.toLocaleString()}</span></div>
                        {!paid && <div style={{ display:'flex', justifyContent:'space-between', paddingTop:'.35rem', borderTop:`1px solid ${partial?'#FDE68A':'#FCA5A5'}` }}><span style={{ fontWeight:600, color:'#64748B' }}>Balance</span><span style={{ fontWeight:800, color:partial?'#B45309':'#B91C1C' }}>₦{balance.toLocaleString()}</span></div>}
                      </div>
                      {f.lastPaymentDate && <p style={{ color:'#94A3B8', fontSize:'.72rem', marginBottom:'.75rem' }}>Last paid: {new Date(f.lastPaymentDate).toDateString()}</p>}
                      {!paid && hasBankDetails && (
                        <button onClick={() => setPayModal({ fee: f })} style={{ display:'inline-flex', alignItems:'center', gap:'.4rem', padding:'.52rem 1rem', borderRadius:9, border:'none', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", fontSize:'.78rem', fontWeight:700, background:'linear-gradient(135deg,#0B1D3A,#1A3A6A)', color:'#fff', width:'100%', justifyContent:'center' }}>
                          <Building2 size={12} /> View Payment Details
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Scores */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon" style={{ background:'#EBF4FF' }}><BarChart2 size={15} color="#1A56A0" /></div>
            <span className="card-title">Academic Scores</span>
            <span style={{ marginLeft:'auto', color:'#94A3B8', fontSize:'.73rem', fontWeight:500 }}>{scores.length} entries</span>
          </div>
          <div style={{ overflowX:'auto' }}>
            {scores.length === 0 ? (
              <p style={{ color:'#94A3B8', fontSize:'.85rem', textAlign:'center', padding:'2rem' }}>No scores recorded yet</p>
            ) : (
              <table className="scores-table">
                <thead><tr><th>Term</th><th>Type</th><th>Score</th><th>%</th></tr></thead>
                <tbody>
                  {scores.map((s, idx) => {
                    const pct = Math.round((s.score / s.maxScore) * 100);
                    const color = pct>=70?'#059669':pct>=50?'#C9963A':'#EF4444';
                    return (
                      <tr key={idx}>
                        <td style={{ fontWeight:600 }}>{s.term}</td>
                        <td style={{ color:'#64748B' }}>{s.assessmentType}</td>
                        <td style={{ fontWeight:700 }}>{s.score}/{s.maxScore}</td>
                        <td><span style={{ fontSize:'.78rem', fontWeight:700, color, background:`${color}18`, padding:'.15rem .5rem', borderRadius:6 }}>{pct}%</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Assignments */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon" style={{ background:'#FFFBEB' }}><BookOpen size={15} color="#B45309" /></div>
            <span className="card-title">Assignments</span>
            <span style={{ marginLeft:'auto', color:'#94A3B8', fontSize:'.73rem', fontWeight:500 }}>{assignments.length} items</span>
          </div>
          <div className="card-body">
            {assignments.length === 0 ? (
              <p style={{ color:'#94A3B8', fontSize:'.85rem', textAlign:'center', padding:'1.5rem 0' }}>No assignments posted yet</p>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
                {assignments.map((a, idx) => (
                  <div key={idx} style={{ padding:'1rem', borderRadius:12, border:'1px solid #FDE68A', background:'#FFFBEB' }}>
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'.75rem', flexWrap:'wrap' }}>
                      <p style={{ fontWeight:700, color:'#0B1D3A', fontSize:'.88rem', margin:0 }}>{a.title}</p>
                      {a.dueDate && <span style={{ fontSize:'.72rem', color:'#92400E', background:'#FEF3C7', border:'1px solid #FDE68A', padding:'.15rem .55rem', borderRadius:999, whiteSpace:'nowrap' }}>Due {new Date(a.dueDate).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</span>}
                    </div>
                    {a.description && <p style={{ color:'#64748B', fontSize:'.82rem', marginTop:'.5rem', lineHeight:1.6 }}>{a.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </main>

      {/* Payment Modal */}
      {payModal && hasBankDetails && (
        <div className="modal-overlay" onClick={e => { if (e.target===e.currentTarget) setPayModal(null); }}>
          <div className="modal-box">
            <div style={{ background:'#0B1D3A', padding:'1.4rem 1.5rem', position:'relative' }}>
              <button onClick={() => setPayModal(null)} style={{ position:'absolute', top:'.9rem', right:'.9rem', background:'rgba(255,255,255,.1)', border:'none', borderRadius:7, width:26, height:26, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                <X size={13} color="#fff" />
              </button>
              <div style={{ display:'flex', alignItems:'center', gap:'.6rem', marginBottom:'.7rem' }}>
                <div style={{ width:38, height:38, borderRadius:10, background:'rgba(201,150,58,.2)', display:'flex', alignItems:'center', justifyContent:'center' }}><Building2 size={17} color="#C9963A" /></div>
                <div>
                  <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, color:'#fff', fontSize:'1rem', margin:0 }}>Payment Details</p>
                  <p style={{ color:'#94A3B8', fontSize:'.73rem', margin:0 }}>Transfer to the account below</p>
                </div>
              </div>
              <div style={{ background:'rgba(255,255,255,.08)', borderRadius:11, padding:'.55rem .9rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ color:'#94A3B8', fontSize:'.76rem' }}>{payModal.fee.term} — Balance</span>
                <span style={{ color:'#C9963A', fontWeight:800, fontSize:'1rem' }}>₦{(payModal.fee.amountDue - payModal.fee.amountPaid).toLocaleString()}</span>
              </div>
            </div>
            <div style={{ padding:'1.4rem 1.5rem' }}>
              <p style={{ fontSize:'.7rem', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:'.8rem' }}>Bank Information</p>
              {[
                { icon:<Building2 size={13} color="#1A56A0" />, bg:'#EBF4FF', label:'Bank Name',      value:bank!.bankName, copy:false },
                { icon:<CreditCard size={13} color="#7C3AED" />, bg:'#F3E8FF', label:'Account Number', value:bank!.accountNumber, copy:true },
                { icon:<School size={13} color="#059669" />, bg:'#DCFCE7', label:'Account Name',  value:bank!.accountName, copy:false },
              ].map(({ icon, bg, label, value, copy }) => (
                <div key={label} className="bank-row">
                  <div style={{ display:'flex', alignItems:'center', gap:'.55rem' }}>
                    <div style={{ width:30, height:30, borderRadius:8, background:bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{icon}</div>
                    <div>
                      <p style={{ fontSize:'.65rem', color:'#94A3B8', fontWeight:600, textTransform:'uppercase', letterSpacing:'.05em', margin:0 }}>{label}</p>
                      <p style={{ fontWeight:700, color:'#0B1D3A', fontSize:'.88rem', margin:0, fontFamily:label==='Account Number'?'monospace':undefined }}>{value}</p>
                    </div>
                  </div>
                  {copy && (
                    <button onClick={copyAcct} className={`copy-btn ${copied?'copied':''}`}>
                      {copied ? <><CheckCircle size={10} />Copied!</> : <><Copy size={10} />Copy</>}
                    </button>
                  )}
                </div>
              ))}
              <div style={{ marginTop:'1rem', background:'#FFFBEB', border:'1px solid #FDE68A', borderRadius:11, padding:'.7rem .9rem', display:'flex', gap:'.45rem' }}>
                <span style={{ flexShrink:0 }}>💡</span>
                <p style={{ color:'#B45309', fontSize:'.76rem', lineHeight:1.55, margin:0 }}>After transferring, inform the school admin with your child's name and Student ID to confirm payment.</p>
              </div>
              <button onClick={() => setPayModal(null)} style={{ width:'100%', marginTop:'1rem', padding:'.82rem', border:'none', borderRadius:11, background:'#F1F5F9', color:'#475569', fontFamily:"'DM Sans',sans-serif", fontSize:'.88rem', fontWeight:600, cursor:'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

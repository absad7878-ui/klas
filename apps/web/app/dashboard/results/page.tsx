'use client';
// Route: /dashboard/results

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen, Users, ChevronRight, Search,
  FileText, CheckCircle, Clock, ArrowLeft, TrendingUp,
  AlertCircle, Calendar, Zap, Eye, Download, Loader
} from 'lucide-react';

interface AcademicTerm { id: string; name: string; session: string; isCurrent: boolean; }
type ClassItem  = { id: string; name: string; studentCount?: number };
type StudentRow = { studentId: string; studentName: string; subjectCount: number; hasCard: boolean; isPublished: boolean; averageScore: number | null; position: number | null; grade: string | null; classId?: string; };

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const ordinal = (n: number) => {
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return n + (s[(v-20)%10] || s[v] || s[0]);
};

const gradeColor = (g: string) => {
  if (g === 'A') return { bg:'#DCFCE7', color:'#16A34A' };
  if (g === 'B') return { bg:'#EFF6FF', color:'#1D4ED8' };
  if (g === 'C') return { bg:'#FEF9C3', color:'#CA8A04' };
  if (g === 'D') return { bg:'#FED7AA', color:'#C2410C' };
  return              { bg:'#FEE2E2', color:'#DC2626' };
};

export default function ResultsPage() {
  const router = useRouter();
  const token  = () => localStorage.getItem('token') || '';

  const [terms,          setTerms]          = useState<AcademicTerm[]>([]);
  const [selectedTermId, setSelectedTermId] = useState<string>('');
  const [classes,   setClasses]   = useState<ClassItem[]>([]);
  const [clsLoad,   setClsLoad]   = useState(true);
  const [query,     setQuery]     = useState('');
  const [selClass,  setSelClass]  = useState<ClassItem | null>(null);
  const [students,  setStudents]  = useState<StudentRow[]>([]);
  const [stuLoad,   setStuLoad]   = useState(false);
  const [stuErr,    setStuErr]    = useState('');
  const [stuQuery,  setStuQuery]  = useState('');

  // Bulk action states
  const [generating,  setGenerating]  = useState(false);
  const [publishing,  setPublishing]  = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [bulkMsg,     setBulkMsg]     = useState('');
  const [bulkErr,     setBulkErr]     = useState('');

  const selectedTerm = terms.find(t => t.id === selectedTermId) || null;

  useEffect(() => {
    const t = token();
    if (!t) { router.push('/login'); return; }
    Promise.all([
      fetch(`${API}/terms`,   { headers: { Authorization: `Bearer ${t}` } }),
      fetch(`${API}/classes`, { headers: { Authorization: `Bearer ${t}` } }),
    ])
      .then(async ([tr, cr]) => {
        const termArr  = tr.ok ? await tr.json() : [];
        const classArr = cr.ok ? await cr.json() : [];
        setTerms(termArr);
        setClasses(classArr);
        const current = termArr.find((t: AcademicTerm) => t.isCurrent);
        if (current) setSelectedTermId(current.id);
        else if (termArr.length > 0) setSelectedTermId(termArr[0].id);
      })
      .finally(() => setClsLoad(false));
  }, [router]);

  const loadStudents = useCallback(() => {
    if (!selClass || !selectedTerm) return;
    setStuLoad(true); setStuErr(''); setStudents([]);
    const headers = { Authorization: `Bearer ${token()}` };
    const params  = `classId=${selClass.id}&term=${encodeURIComponent(selectedTerm.name)}&session=${encodeURIComponent(selectedTerm.session)}`;
    Promise.all([
      fetch(`${API}/exams/results?${params}`,      { headers }).then(r => r.ok ? r.json() : []),
      fetch(`${API}/exams/report-cards?${params}`, { headers }).then(r => r.ok ? r.json() : []),
    ])
      .then(([results, cards]) => {
        const map = new Map<string, StudentRow>();
        for (const r of results) {
          const sid  = r.studentId;
          const name = r.student ? `${r.student.firstName} ${r.student.lastName}` : sid;
          if (!map.has(sid)) map.set(sid, { studentId: sid, studentName: name, subjectCount: 0, hasCard: false, isPublished: false, averageScore: null, position: null, grade: null, classId: r.classId });
          map.get(sid)!.subjectCount++;
        }
        for (const c of cards) {
          const sid  = c.studentId;
          const name = c.student ? `${c.student.firstName} ${c.student.lastName}` : sid;
          if (!map.has(sid)) {
            map.set(sid, { studentId: sid, studentName: name, subjectCount: 0, hasCard: true, isPublished: c.isPublished, averageScore: c.averageScore, position: c.position, grade: c.grade, classId: c.classId });
          } else {
            const row = map.get(sid)!;
            row.hasCard = true; row.isPublished = c.isPublished; row.averageScore = c.averageScore; row.position = c.position; row.grade = c.grade;
            if (c.classId) row.classId = c.classId;
          }
        }
        const arr = Array.from(map.values()).sort((a, b) => {
          if (a.position !== null && b.position !== null) return a.position - b.position;
          return a.studentName.localeCompare(b.studentName);
        });
        setStudents(arr);
      })
      .catch(() => setStuErr('Failed to load students. Check the term selected.'))
      .finally(() => setStuLoad(false));
  }, [selClass, selectedTermId]);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  // ── Bulk: Generate all report cards for the class ──────────────────────────
  const handleGenerateAll = async () => {
    if (!selClass || !selectedTerm) return;
    const classId = students.find(s => s.classId)?.classId || selClass.id;
    setGenerating(true); setBulkErr(''); setBulkMsg('');
    try {
      const res = await fetch(`${API}/exams/report-cards/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ classId, term: selectedTerm.name, session: selectedTerm.session }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate');
      setBulkMsg(`✅ ${data.message}`);
      await loadStudents();
    } catch (err: any) { setBulkErr(err.message); }
    finally { setGenerating(false); setTimeout(() => setBulkMsg(''), 4000); }
  };

  // ── Bulk: Publish all report cards for the class ───────────────────────────
  const handlePublishAll = async () => {
    if (!selClass || !selectedTerm) return;
    const classId = students.find(s => s.classId)?.classId || selClass.id;
    setPublishing(true); setBulkErr(''); setBulkMsg('');
    try {
      const res = await fetch(`${API}/exams/report-cards/publish`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ classId, term: selectedTerm.name, session: selectedTerm.session, publish: true }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to publish'); }
      setBulkMsg(`✅ All report cards published to parents!`);
      setStudents(prev => prev.map(s => ({ ...s, isPublished: true })));
    } catch (err: any) { setBulkErr(err.message); }
    finally { setPublishing(false); setTimeout(() => setBulkMsg(''), 4000); }
  };

  // ── Bulk: Download all as PDF (client-side using print) ────────────────────
  const handleDownloadPDF = async () => {
    if (!selClass || !selectedTerm || students.length === 0) return;
    setDownloading(true); setBulkErr(''); setBulkMsg('Fetching report cards…');

    try {
      const headers = { Authorization: `Bearer ${token()}` };
      const params  = `classId=${selClass.id}&term=${encodeURIComponent(selectedTerm.name)}&session=${encodeURIComponent(selectedTerm.session)}`;

      // Fetch all cards + results for each student
      const [cardsRes, allResultsRes] = await Promise.all([
        fetch(`${API}/exams/report-cards?${params}`, { headers }).then(r => r.json()),
        fetch(`${API}/exams/results?${params}`,      { headers }).then(r => r.json()),
      ]);

      const cards: any[]   = cardsRes || [];
      const allRes: any[]  = allResultsRes || [];

      if (cards.length === 0) throw new Error('No report cards found. Generate them first.');

      // Group results by studentId
      const resultsByStudent: Record<string, any[]> = {};
      for (const r of allRes) {
        if (!resultsByStudent[r.studentId]) resultsByStudent[r.studentId] = [];
        resultsByStudent[r.studentId]!.push(r);
      }

      // Sort by position
      cards.sort((a, b) => (a.position || 999) - (b.position || 999));

      setBulkMsg('Building PDF…');

      const gradeC = (g: string) => {
        if (g === 'A') return '#16A34A';
        if (g === 'B') return '#1D4ED8';
        if (g === 'C') return '#CA8A04';
        if (g === 'D') return '#C2410C';
        return '#DC2626';
      };

      const ord = (n: number) => {
        const s = ['th','st','nd','rd'];
        const v = n % 100;
        return n + (s[(v-20)%10] || s[v] || s[0]);
      };

      const cardHTML = cards.map((card: any) => {
        const student = card.student || {};
        const results = (resultsByStudent[card.studentId] || [])
          .sort((a: any, b: any) => (a.subject?.order ?? 0) - (b.subject?.order ?? 0));

        const rows = results.map((r: any) => `
          <tr>
            <td style="font-weight:600;padding:.45rem .6rem;">${r.subject?.name || ''}</td>
            <td style="text-align:center;padding:.45rem .6rem;">${r.caScore}</td>
            <td style="text-align:center;padding:.45rem .6rem;">${r.examScore}</td>
            <td style="text-align:center;font-weight:700;padding:.45rem .6rem;">${r.total}</td>
            <td style="text-align:center;padding:.45rem .6rem;"><span style="background:${gradeC(r.grade)}18;color:${gradeC(r.grade)};font-weight:800;padding:.18rem .45rem;border-radius:5px;">${r.grade}</span></td>
            <td style="color:${gradeC(r.grade)};font-size:.75rem;font-weight:600;padding:.45rem .6rem;">${r.remark}</td>
          </tr>
        `).join('');

        return `
          <div style="page-break-after:always;font-family:'DM Sans',Arial,sans-serif;max-width:720px;margin:0 auto;border:2px solid #E2E8F0;border-radius:12px;overflow:hidden;">
            <!-- Header -->
            <div style="background:linear-gradient(135deg,#0B1D3A,#1A3A6A);padding:1.1rem 1.4rem;display:flex;align-items:center;justify-content:space-between;">
              <div>
                <div style="color:#C9963A;font-size:.62rem;font-weight:700;text-transform:uppercase;letter-spacing:.09em;margin-bottom:.2rem;">Student Report Card</div>
                <div style="color:#fff;font-size:1.05rem;font-weight:800;">Academic Performance Report</div>
                <div style="color:#64748B;font-size:.72rem;">${card.term} · Session ${card.session}</div>
              </div>
              <div style="background:${card.isPublished?'rgba(34,197,94,.15)':'rgba(148,163,184,.15)'};border-radius:7px;padding:.28rem .6rem;">
                <span style="font-size:.65rem;font-weight:700;color:${card.isPublished?'#4ADE80':'#64748B'};">${card.isPublished?'● PUBLISHED':'○ DRAFT'}</span>
              </div>
            </div>

            <!-- Student info -->
            <div style="background:#FFFBEB;border-bottom:1px solid #FDE68A;padding:.85rem 1.4rem;display:grid;grid-template-columns:repeat(4,1fr);gap:.75rem;">
              ${[
                ['Student Name', `${student.firstName || ''} ${student.lastName || ''}`],
                ['Class',         card.className],
                ['Term',         `${card.term} · ${card.session}`],
                ['Admission No',  student.studentId || '—'],
              ].map(([l,v]) => `
                <div>
                  <div style="font-size:.6rem;font-weight:700;color:#92400E;text-transform:uppercase;letter-spacing:.06em;margin-bottom:.12rem;">${l}</div>
                  <div style="font-size:.84rem;font-weight:700;color:#0B1D3A;">${v}</div>
                </div>
              `).join('')}
            </div>

            <!-- Scores table -->
            <div style="padding:1rem 1.4rem;">
              <div style="font-weight:700;color:#0B1D3A;font-size:.82rem;text-transform:uppercase;letter-spacing:.05em;border-bottom:2px solid #C9963A;padding-bottom:.3rem;margin-bottom:.65rem;">Subject Performance</div>
              <table style="width:100%;border-collapse:collapse;font-size:.82rem;">
                <thead>
                  <tr style="background:#F0EFE9;">
                    <th style="text-align:left;padding:.45rem .6rem;font-size:.63rem;color:#0B1D3A;text-transform:uppercase;letter-spacing:.06em;border-bottom:2px solid #C9963A;">Subject</th>
                    <th style="padding:.45rem .6rem;font-size:.63rem;color:#0B1D3A;text-transform:uppercase;letter-spacing:.06em;border-bottom:2px solid #C9963A;">CA (30)</th>
                    <th style="padding:.45rem .6rem;font-size:.63rem;color:#0B1D3A;text-transform:uppercase;letter-spacing:.06em;border-bottom:2px solid #C9963A;">Exam (70)</th>
                    <th style="padding:.45rem .6rem;font-size:.63rem;color:#0B1D3A;text-transform:uppercase;letter-spacing:.06em;border-bottom:2px solid #C9963A;">Total</th>
                    <th style="padding:.45rem .6rem;font-size:.63rem;color:#0B1D3A;text-transform:uppercase;letter-spacing:.06em;border-bottom:2px solid #C9963A;">Grade</th>
                    <th style="padding:.45rem .6rem;font-size:.63rem;color:#0B1D3A;text-transform:uppercase;letter-spacing:.06em;border-bottom:2px solid #C9963A;">Remark</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
                <tfoot>
                  <tr style="background:#0B1D3A;color:#fff;">
                    <td colspan="3" style="padding:.55rem .6rem;font-weight:700;">Total / Average</td>
                    <td style="text-align:center;padding:.55rem .6rem;font-weight:800;">${card.totalMarks} / ${card.averageScore}%</td>
                    <td style="text-align:center;padding:.55rem .6rem;"><span style="background:${gradeC(card.grade)}33;color:#fff;padding:.18rem .45rem;border-radius:5px;font-weight:800;">${card.grade}</span></td>
                    <td style="padding:.55rem .6rem;">${card.remark}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <!-- Summary -->
            <div style="background:#F8FAFC;border-top:1px solid #E2E8F0;border-bottom:1px solid #E2E8F0;padding:.85rem 1.4rem;display:grid;grid-template-columns:repeat(4,1fr);gap:.75rem;text-align:center;">
              ${[
                ['Total Marks',    card.totalMarks],
                ['Average Score',  `${card.averageScore}%`],
                ['Class Position', ord(card.position)],
                ['Out of',         `${card.totalStudents} students`],
              ].map(([l,v]) => `
                <div>
                  <div style="font-size:.6rem;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:.18rem;">${l}</div>
                  <div style="font-size:.98rem;font-weight:800;color:#0B1D3A;">${v}</div>
                </div>
              `).join('')}
            </div>

            <!-- Remarks -->
            <div style="padding:.9rem 1.4rem;display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
              ${[
                ["Class Teacher's Remark", card.classTeacherRemark],
                ["Principal's Remark",     card.principalRemark],
              ].map(([l,v]) => `
                <div>
                  <div style="font-size:.62rem;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:.25rem;">${l}</div>
                  <div style="padding:.5rem .75rem;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;min-height:40px;font-size:.8rem;color:${v?'#0B1D3A':'#CBD5E1'};font-style:${v?'normal':'italic'};">${v || 'No remark added'}</div>
                  <div style="font-size:.64rem;color:#94A3B8;margin-top:.3rem;border-top:1px solid #E2E8F0;padding-top:.28rem;">${String(l).replace("'s Remark","'s Signature")}</div>
                </div>
              `).join('')}
            </div>

            <!-- Footer -->
            <div style="background:#0B1D3A;padding:.55rem 1.4rem;display:flex;justify-content:space-between;">
              <span style="color:#475569;font-size:.66rem;">Generated by Klas School Management Platform</span>
              <span style="color:#C9963A;font-size:.66rem;font-weight:600;">${new Date().toLocaleDateString('en-NG',{day:'numeric',month:'long',year:'numeric'})}</span>
            </div>
          </div>
        `;
      }).join('<div style="height:20px;"></div>');

      const fullHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>${selClass.name} — Report Cards — ${selectedTerm.name} ${selectedTerm.session}</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap" rel="stylesheet"/>
  <style>
    * { box-sizing:border-box; margin:0; padding:0; }
    body { background:#F0EFE9; padding:24px; font-family:'DM Sans',Arial,sans-serif; }
    @media print {
      body { background:#fff; padding:0; }
      div[style*="page-break-after"] { page-break-after: always; }
    }
  </style>
</head>
<body>
  <div style="text-align:center;margin-bottom:28px;padding:1.5rem;background:linear-gradient(135deg,#0B1D3A,#1A3A6A);border-radius:14px;color:#fff;">
    <div style="color:#C9963A;font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;margin-bottom:.35rem;">Class Report Cards</div>
    <div style="font-size:1.5rem;font-weight:800;">${selClass.name}</div>
    <div style="color:#94A3B8;font-size:.85rem;margin-top:.25rem;">${selectedTerm.name} · ${selectedTerm.session} · ${cards.length} students</div>
  </div>
  ${cardHTML}
</body>
</html>`;

      // Open in new window and trigger print
      const win = window.open('', '_blank');
      if (!win) throw new Error('Popup blocked. Please allow popups for this site.');
      win.document.write(fullHTML);
      win.document.close();
      win.focus();
      setTimeout(() => { win.print(); }, 800);
      setBulkMsg(`✅ PDF ready — ${cards.length} report cards`);
    } catch (err: any) { setBulkErr(err.message); }
    finally { setDownloading(false); setTimeout(() => setBulkMsg(''), 5000); }
  };

  const filteredClasses  = classes.filter(c => c.name?.toLowerCase().includes(query.toLowerCase()));
  const filteredStudents = students.filter(s => s.studentName.toLowerCase().includes(stuQuery.toLowerCase()));
  const publishedCount   = students.filter(s => s.isPublished).length;
  const generatedCount   = students.filter(s => s.hasCard).length;
  const allGenerated     = students.length > 0 && generatedCount === students.length;
  const allPublished     = students.length > 0 && publishedCount === students.length;

  const ACCENTS = [
    { iconColor:'#1A56A0', iconBg:'#EBF4FF', accent:'#1A56A0' },
    { iconColor:'#059669', iconBg:'#E6FFEE', accent:'#059669' },
    { iconColor:'#7C3AED', iconBg:'#F3E8FF', accent:'#7C3AED' },
    { iconColor:'#B45309', iconBg:'#FFFBEB', accent:'#B45309' },
    { iconColor:'#0E7490', iconBg:'#ECFEFF', accent:'#0E7490' },
    { iconColor:'#9D174D', iconBg:'#FCE7F3', accent:'#9D174D' },
  ];

  if (clsLoad) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background:'#0B1D3A' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}`}</style>
      <div className="text-center">
        <div style={{ width:52, height:52, borderRadius:'50%', border:'3px solid rgba(201,150,58,.15)', borderTopColor:'#C9963A', animation:'spin .8s linear infinite', margin:'0 auto 1.25rem' }} />
        <p style={{ color:'#94A3B8', fontFamily:"'DM Sans',sans-serif", fontSize:'.9rem', animation:'pulse 1.8s ease infinite' }}>Loading…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily:"'DM Sans',sans-serif", background:'#F0EFE9' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        .fade-up   { animation:fadeUp .5s ease both; }
        .fade-up-1 { animation:fadeUp .5s .08s ease both; }
        .fade-up-2 { animation:fadeUp .5s .16s ease both; }
        ${Array.from({length:12},(_,i)=>`.card-${i}{animation:fadeUp .5s ${.2+i*.06}s ease both;}`).join('')}
        .gold-shimmer { background:linear-gradient(90deg,#C9963A 0%,#F0C060 40%,#C9963A 60%,#E8B85A 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 4s linear infinite; }
        .hero-dot-grid { background-image:radial-gradient(circle,rgba(201,150,58,.13) 1px,transparent 1px);background-size:28px 28px; }
        .gold-divider  { height:1px;background:linear-gradient(90deg,transparent,rgba(201,150,58,.3),transparent); }
        .search-wrap   { position:relative; }
        .search-icon   { position:absolute;left:1rem;top:50%;transform:translateY(-50%);color:#94A3B8;pointer-events:none; }
        .search-input  { width:100%;padding:.75rem 1rem .75rem 2.75rem;border:1.5px solid #E2E8F0;border-radius:12px;font-family:'DM Sans',sans-serif;font-size:.85rem;color:#0B1D3A;background:#fff;outline:none;box-sizing:border-box;transition:border-color .2s,box-shadow .2s; }
        .search-input::placeholder { color:#CBD5E1; }
        .search-input:focus { border-color:#C9963A;box-shadow:0 0 0 3px rgba(201,150,58,.12); }
        .class-card { background:#fff;border:1px solid #E2E8F0;border-radius:20px;padding:1.5rem;display:flex;flex-direction:column;cursor:pointer;box-shadow:0 2px 12px rgba(11,29,58,.06);position:relative;overflow:hidden;transition:box-shadow .22s,transform .22s,border-color .22s; }
        .class-card::before { content:'';position:absolute;top:0;left:0;right:0;height:4px;background:var(--accent);transform:scaleX(0);transform-origin:left;transition:transform .25s ease; }
        .class-card:hover { box-shadow:0 12px 32px rgba(11,29,58,.12);transform:translateY(-3px); }
        .class-card:hover::before { transform:scaleX(1); }
        .stu-row { background:#fff;border:1.5px solid #E8EDF3;border-radius:14px;padding:1rem 1.25rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;text-decoration:none;transition:box-shadow .2s,transform .18s,border-color .2s; }
        .stu-row:hover { box-shadow:0 6px 20px rgba(11,29,58,.08);transform:translateY(-2px);border-color:rgba(201,150,58,.35); }
        .term-select { padding:.45rem 1rem;border-radius:10px;border:1.5px solid rgba(255,255,255,.2);font-family:'DM Sans',sans-serif;font-size:.82rem;font-weight:500;color:#fff;background:rgba(255,255,255,.1);cursor:pointer;outline:none;transition:border-color .2s;appearance:none;min-width:200px; }
        .term-select:focus { border-color:#C9963A; }
        .term-select option { background:#0B1D3A;color:#fff; }
        .stat-pill { display:inline-flex;align-items:center;gap:.4rem;padding:.35rem .85rem;border-radius:20px;font-size:.72rem;font-weight:700; }
        .bulk-btn { display:inline-flex;align-items:center;gap:.45rem;padding:.65rem 1.15rem;border-radius:11px;border:none;font-family:'DM Sans',sans-serif;font-size:.82rem;font-weight:700;cursor:pointer;transition:all .2s;white-space:nowrap; }
        .bulk-btn:disabled { opacity:.6;cursor:not-allowed; }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-20 fade-up" style={{ background:'#0B1D3A', borderBottom:'2px solid rgba(201,150,58,.5)' }}>
        <div style={{ padding:'.85rem 2rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'.75rem' }}>
            {selClass && (
              <button onClick={() => { setSelClass(null); setStudents([]); setBulkMsg(''); setBulkErr(''); }}
                style={{ width:32, height:32, borderRadius:9, border:'1px solid rgba(255,255,255,.15)', background:'rgba(255,255,255,.07)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                <ArrowLeft size={15} color="#fff" />
              </button>
            )}
            <div style={{ width:34, height:34, borderRadius:10, flexShrink:0, background:'linear-gradient(135deg,#C9963A,#E8B85A)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <TrendingUp size={16} color="#0B1D3A" />
            </div>
            <p style={{ fontFamily:"'Playfair Display',serif", color:'#fff', fontWeight:700, fontSize:'.9rem' }}>
              {selClass ? `${selClass.name} — Report Cards` : 'Results & Report Cards'}
            </p>
          </div>
          <button onClick={() => router.push('/dashboard')}
            style={{ display:'flex', alignItems:'center', gap:'.4rem', background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.13)', color:'#94A3B8', padding:'.45rem .9rem', borderRadius:10, fontSize:'.8rem', fontWeight:500, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
            <ArrowLeft size={13} /> Dashboard
          </button>
        </div>
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden fade-up-1" style={{ background:'#0B1D3A' }}>
        <div className="absolute inset-0 hero-dot-grid" />
        <div className="relative" style={{ padding:'2.5rem 2rem 1rem' }}>
          <p style={{ color:'#64748B', fontSize:'.72rem', textTransform:'uppercase', letterSpacing:'.1em', fontWeight:500, marginBottom:'.5rem' }}>
            Admin · {selClass ? selClass.name : 'All Classes'}
          </p>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(1.7rem,3.5vw,2.4rem)', fontWeight:800, color:'#fff', lineHeight:1.15 }}>
            {selClass ? <span className="gold-shimmer">Report Cards</span> : <>Results &amp; <span className="gold-shimmer">Report Cards</span></>}
          </h1>

          <div style={{ display:'flex', alignItems:'center', gap:'.75rem', marginTop:'1.25rem', flexWrap:'wrap' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'.5rem' }}>
              <Calendar size={14} color="#C9963A" />
              <span style={{ color:'#64748B', fontSize:'.75rem', fontWeight:600 }}>Term:</span>
            </div>
            {terms.length === 0 ? (
              <div style={{ display:'flex', alignItems:'center', gap:'.5rem', background:'rgba(201,150,58,.1)', border:'1px solid rgba(201,150,58,.3)', borderRadius:8, padding:'.4rem .85rem' }}>
                <AlertCircle size={13} color="#C9963A" />
                <span style={{ color:'#C9963A', fontSize:'.78rem' }}>No terms — go to Settings → Academic Terms</span>
              </div>
            ) : (
              <select className="term-select" value={selectedTermId} onChange={e => setSelectedTermId(e.target.value)}>
                {terms.map(t => (
                  <option key={t.id} value={t.id}>{t.name} — {t.session}{t.isCurrent ? ' ✓' : ''}</option>
                ))}
              </select>
            )}

            {selClass && students.length > 0 && !stuLoad && (
              <div style={{ display:'flex', gap:'.5rem', flexWrap:'wrap' }}>
                <span className="stat-pill" style={{ background:'#DCFCE7', color:'#15803D' }}>
                  <CheckCircle size={11} /> {publishedCount} published
                </span>
                <span className="stat-pill" style={{ background:'rgba(255,255,255,.1)', color:'#94A3B8' }}>
                  <FileText size={11} /> {generatedCount} generated
                </span>
                <span className="stat-pill" style={{ background:'rgba(255,255,255,.1)', color:'#94A3B8' }}>
                  <Users size={11} /> {students.length} students
                </span>
              </div>
            )}
          </div>
        </div>
        <div style={{ height:24, background:'linear-gradient(to bottom,transparent,#F0EFE9)' }} />
      </div>

      <main className="fade-up-2" style={{ flex:1, padding:'2rem 2rem 3rem' }}>

        {/* STEP 1: Pick class */}
        {!selClass && (
          <>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
              <div>
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontWeight:800, fontSize:'1.1rem', color:'#0B1D3A' }}>Select a Class</h2>
                <p style={{ color:'#94A3B8', fontSize:'.78rem', marginTop:'.2rem' }}>{filteredClasses.length} of {classes.length} shown</p>
              </div>
              <div className="search-wrap" style={{ width:240 }}>
                <Search size={14} className="search-icon" />
                <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search classes…" className="search-input" />
              </div>
            </div>
            <div className="gold-divider" style={{ marginBottom:'1.75rem' }} />
            {classes.length === 0 ? (
              <div style={{ background:'#fff', border:'2px dashed #E2E8F0', borderRadius:20, padding:'3.5rem 2rem', textAlign:'center' }}>
                <BookOpen size={32} color="#CBD5E1" style={{ margin:'0 auto 1rem' }} />
                <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, color:'#0B1D3A', fontSize:'1.1rem' }}>No classes yet</p>
                <p style={{ color:'#94A3B8', fontSize:'.83rem', marginTop:'.4rem' }}>Add classes from the Classes module first.</p>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:'1.25rem' }}>
                {filteredClasses.map((cls, i) => {
                  const { iconColor, iconBg, accent } = ACCENTS[i % ACCENTS.length] ?? ACCENTS[0]!;
                  return (
                    <div key={cls.id} onClick={() => setSelClass(cls)}
                      className={`class-card card-${Math.min(i,11)}`}
                      style={{ '--accent':accent } as React.CSSProperties}>
                      <div style={{ width:48, height:48, borderRadius:13, background:iconBg, border:`1px solid ${iconColor}20`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'1rem' }}>
                        <BookOpen size={22} color={iconColor} />
                      </div>
                      <h3 style={{ fontFamily:"'Playfair Display',serif", fontWeight:800, color:'#0B1D3A', fontSize:'1rem', marginBottom:'.35rem' }}>{cls.name}</h3>
                      <div style={{ display:'flex', alignItems:'center', gap:'.35rem', marginBottom:'1rem' }}>
                        <Users size={12} color="#94A3B8" />
                        <p style={{ color:'#94A3B8', fontSize:'.78rem' }}>{cls.studentCount || 0} students</p>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:'.3rem', marginTop:'auto', color:accent, fontSize:'.78rem', fontWeight:700 }}>
                        View report cards <ChevronRight size={13} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* STEP 2: Students */}
        {selClass && (
          <>
            {/* ── BULK ACTION BAR ── */}
            <div style={{ background:'#fff', border:'1.5px solid #E2E8F0', borderRadius:16, padding:'1rem 1.25rem', marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:'.75rem', flexWrap:'wrap', boxShadow:'0 2px 12px rgba(11,29,58,.05)' }}>
              <div style={{ flex:1, minWidth:200 }}>
                <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, color:'#0B1D3A', fontSize:'.9rem', margin:0 }}>Bulk Actions</p>
                <p style={{ color:'#94A3B8', fontSize:'.72rem', margin:'.1rem 0 0' }}>
                  {selectedTerm?.name} {selectedTerm?.session} · {students.length} students
                </p>
              </div>

              {/* Generate All */}
              <button onClick={handleGenerateAll} disabled={generating || students.length === 0}
                className="bulk-btn"
                style={{ background:'linear-gradient(135deg,#0B1D3A,#1A3A6A)', color:'#fff' }}>
                {generating ? <><Loader size={13} style={{ animation:'spin .7s linear infinite' }} /> Generating…</> : <><Zap size={13} /> Generate All</>}
              </button>

              {/* Publish All */}
              <button onClick={handlePublishAll} disabled={publishing || !allGenerated || allPublished}
                className="bulk-btn"
                style={{ background: allPublished ? '#F1F5F9' : 'linear-gradient(135deg,#22C55E,#16A34A)', color: allPublished ? '#94A3B8' : '#fff' }}
                title={!allGenerated ? 'Generate report cards first' : allPublished ? 'All already published' : 'Publish all to parents'}>
                {publishing ? <><Loader size={13} style={{ animation:'spin .7s linear infinite' }} /> Publishing…</> : allPublished ? <><CheckCircle size={13} /> All Published</> : <><Eye size={13} /> Publish All to Parents</>}
              </button>

              {/* Download PDF */}
              <button onClick={handleDownloadPDF} disabled={downloading || generatedCount === 0}
                className="bulk-btn"
                style={{ background:'linear-gradient(135deg,#C9963A,#E8B85A)', color:'#0B1D3A' }}
                title={generatedCount === 0 ? 'Generate report cards first' : 'Download all as PDF'}>
                {downloading ? <><Loader size={13} style={{ animation:'spin .7s linear infinite' }} /> Building…</> : <><Download size={13} /> Download All PDF</>}
              </button>
            </div>

            {/* Bulk feedback */}
            {bulkMsg && (
              <div style={{ display:'flex', alignItems:'center', gap:'.6rem', background:'#ECFDF5', border:'1.5px solid #6EE7B7', borderRadius:12, padding:'.7rem 1rem', marginBottom:'1rem', fontSize:'.84rem', color:'#065F46', fontWeight:500 }}>
                <CheckCircle size={14} color="#059669" /> {bulkMsg}
              </div>
            )}
            {bulkErr && (
              <div style={{ display:'flex', alignItems:'center', gap:'.6rem', background:'#FFF1F2', border:'1.5px solid #FECDD3', borderRadius:12, padding:'.7rem 1rem', marginBottom:'1rem', fontSize:'.84rem', color:'#BE123C' }}>
                <AlertCircle size={14} /> {bulkErr}
              </div>
            )}

            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
              <div>
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontWeight:800, fontSize:'1.1rem', color:'#0B1D3A' }}>
                  {selClass.name} — {selectedTerm ? `${selectedTerm.name} ${selectedTerm.session}` : ''}
                </h2>
                <p style={{ color:'#94A3B8', fontSize:'.78rem', marginTop:'.2rem' }}>Click a student to open their report card</p>
              </div>
              <div className="search-wrap" style={{ width:240 }}>
                <Search size={14} className="search-icon" />
                <input type="text" value={stuQuery} onChange={e => setStuQuery(e.target.value)} placeholder="Search students…" className="search-input" />
              </div>
            </div>
            <div className="gold-divider" style={{ marginBottom:'1.75rem' }} />

            {stuLoad && (
              <div style={{ display:'flex', justifyContent:'center', padding:'4rem 0' }}>
                <div style={{ width:40, height:40, borderRadius:'50%', border:'3px solid rgba(201,150,58,.15)', borderTopColor:'#C9963A', animation:'spin .8s linear infinite' }} />
              </div>
            )}
            {stuErr && (
              <div style={{ background:'#FFF1F2', border:'1px solid #FECDD3', borderRadius:14, padding:'1rem 1.25rem', color:'#BE123C', fontSize:'.85rem', display:'flex', alignItems:'center', gap:'.65rem' }}>
                <AlertCircle size={16} style={{ flexShrink:0 }} /> {stuErr}
              </div>
            )}
            {!stuLoad && !stuErr && students.length === 0 && (
              <div style={{ background:'#fff', border:'2px dashed #E2E8F0', borderRadius:20, padding:'3.5rem 2rem', textAlign:'center' }}>
                <FileText size={32} color="#CBD5E1" style={{ margin:'0 auto 1rem' }} />
                <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, color:'#0B1D3A', fontSize:'1.05rem' }}>No scores found</p>
                <p style={{ color:'#94A3B8', fontSize:'.83rem', marginTop:'.4rem' }}>
                  No exam scores entered for <strong>{selectedTerm?.name} {selectedTerm?.session}</strong> yet.
                </p>
              </div>
            )}
            {!stuLoad && filteredStudents.length > 0 && (
              <div style={{ display:'flex', flexDirection:'column', gap:'.65rem' }}>
                {filteredStudents.map((s, i) => (
                  <Link key={s.studentId} href={`/dashboard/report-card/${s.studentId}?termId=${selectedTermId}`}
                    className={`stu-row card-${Math.min(i,11)}`}>
                    <div style={{ display:'flex', alignItems:'center', gap:'.9rem' }}>
                      <div style={{ width:42, height:42, borderRadius:11, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                        background: s.isPublished ? '#DCFCE7' : s.hasCard ? '#FEF3C7' : '#F1F5F9' }}>
                        {s.isPublished ? <CheckCircle size={19} color="#16A34A" /> : s.hasCard ? <FileText size={19} color="#D97706" /> : <Clock size={19} color="#94A3B8" />}
                      </div>
                      <div>
                        <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, color:'#0B1D3A', fontSize:'.95rem' }}>{s.studentName}</p>
                        <p style={{ color:'#94A3B8', fontSize:'.72rem', marginTop:'.12rem' }}>
                          {s.isPublished ? '✅ Published to parent' : s.hasCard ? '📄 Generated — not yet published' : `📝 ${s.subjectCount} subject${s.subjectCount!==1?'s':''} scored`}
                        </p>
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'1.25rem' }}>
                      {s.averageScore !== null && (
                        <div style={{ textAlign:'right' }}>
                          <p style={{ fontWeight:800, color:'#0B1D3A', fontSize:'.95rem' }}>{s.averageScore.toFixed(1)}%</p>
                          <p style={{ color:'#94A3B8', fontSize:'.7rem', marginTop:'.1rem' }}>{s.grade || '—'} · #{s.position || '—'}</p>
                        </div>
                      )}
                      <div style={{ display:'flex', alignItems:'center', gap:'.25rem', color:'#1A56A0', fontSize:'.78rem', fontWeight:700, whiteSpace:'nowrap' }}>
                        Open <ChevronRight size={14} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <footer style={{ background:'#0B1D3A', borderTop:'1px solid rgba(201,150,58,.15)', padding:'1.1rem 2rem' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'.5rem' }}>
          <p style={{ color:'#475569', fontSize:'.75rem' }}>{selClass ? `${selClass.name} · ${selectedTerm?.name} ${selectedTerm?.session}` : `${classes.length} classes`}</p>
          <p style={{ color:'#475569', fontSize:'.75rem' }}>Powered by <span style={{ color:'#C9963A', fontWeight:600 }}>Klas School Management Platform</span></p>
        </div>
      </footer>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  MapPin, Phone, Mail, Globe, Users, GraduationCap,
  ArrowLeft, Building2, School, BookOpen,
  FileText, UsersRound, ChevronRight, Award, Calendar,
  Hash, Settings
} from 'lucide-react';
import Link from 'next/link';

export default function SchoolProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const [school, setSchool]   = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/schools/${id}`)
      .then(res => { if (!res.ok) throw new Error('School not found'); return res.json(); })
      .then(setSchool)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B1D3A' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', border: '3px solid rgba(201,150,58,.15)', borderTopColor: '#C9963A', animation: 'spin .8s linear infinite', margin: '0 auto 1.25rem' }} />
        <p style={{ color: '#94A3B8', fontFamily: "'DM Sans',sans-serif", fontSize: '.9rem', animation: 'pulse 1.8s ease infinite' }}>Loading school profile…</p>
      </div>
    </div>
  );

  if (error || !school) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: '#F0EFE9', fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: '2.5rem 2rem', maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: '0 4px 28px rgba(11,29,58,.1)', border: '1px solid #FECDD3' }}>
        <div style={{ fontSize: 32, marginBottom: '1rem' }}>⚠️</div>
        <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '1.2rem', marginBottom: '.5rem' }}>School Not Found</p>
        <p style={{ color: '#94A3B8', fontSize: '.85rem', marginBottom: '1.75rem' }}>{error || 'This school could not be found.'}</p>
        <button onClick={() => router.back()} style={{ background: '#0B1D3A', color: '#fff', border: 'none', borderRadius: 12, padding: '.8rem 2rem', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, cursor: 'pointer', fontSize: '.9rem' }}>← Back to Search</button>
      </div>
    </div>
  );

  const stats = [
    { label: 'Students', value: (school.studentCount || 0).toLocaleString(), icon: Users,         color: '#1A56A0', bg: '#EBF4FF' },
    { label: 'Teachers', value: (school.teacherCount || 0).toLocaleString(), icon: GraduationCap, color: '#059669', bg: '#E6FFEE' },
    { label: 'Classes',  value: (school.classCount   || 0).toLocaleString(), icon: BookOpen,      color: '#B45309', bg: '#FFFBEB' },
  ];

  const resolvedPhone   = school.phoneNumber   || school.phone      || null;
  const resolvedEmail   = school.officialEmail || school.email      || null;
  const resolvedAddress = school.address       || school.location   || null;
  const resolvedWebsite = school.website       || school.websiteUrl || null;

  const contactItems = [
    { icon: MapPin, label: 'Address',  value: resolvedAddress, color: '#1A56A0', bg: '#EBF4FF', href: null },
    { icon: Phone,  label: 'Phone',    value: resolvedPhone,   color: '#059669', bg: '#E6FFEE', href: resolvedPhone   ? `tel:${resolvedPhone}`    : null },
    { icon: Mail,   label: 'Email',    value: resolvedEmail,   color: '#7C3AED', bg: '#F3E8FF', href: resolvedEmail   ? `mailto:${resolvedEmail}` : null },
    { icon: Globe,  label: 'Website',  value: resolvedWebsite, color: '#0E7490', bg: '#ECFEFF', href: resolvedWebsite ? (resolvedWebsite.startsWith('http') ? resolvedWebsite : `https://${resolvedWebsite}`) : null },
  ] as any[];

  const academicItems = [
    school.gradingSystem?.type      && { label: 'Grading System',  value: school.gradingSystem.type === 'letter' ? 'Letter (A–F)' : school.gradingSystem.type === 'gpa' ? 'GPA Scale' : 'Percentage' },
    school.academicStructure?.termsPerYear && { label: 'Terms per Year', value: school.academicStructure.termsPerYear },
    school.academicStructure?.usesSemesters !== undefined && { label: 'Structure', value: school.academicStructure.usesSemesters ? 'Semester-based' : 'Term-based' },
  ].filter(Boolean) as any[];

  return (
    <div style={{ minHeight: '100vh', width: '100%', overflowX: 'hidden', fontFamily: "'DM Sans',sans-serif", background: '#F0EFE9', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        .fade-up   { animation: fadeUp .55s ease both; }
        .fade-up-1 { animation: fadeUp .55s .1s ease both; }
        .fade-up-2 { animation: fadeUp .55s .2s ease both; }
        .fade-up-3 { animation: fadeUp .55s .3s ease both; }
        .gold-shimmer { background:linear-gradient(90deg,#C9963A 0%,#F0C060 40%,#C9963A 60%,#E8B85A 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 4s linear infinite; }
        .dot-grid { background-image:radial-gradient(circle,rgba(201,150,58,.13) 1px,transparent 1px);background-size:28px 28px; }
        .back-btn { display:flex;align-items:center;gap:.4rem;color:#C9963A;background:none;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:600;font-size:.85rem;padding:.4rem .7rem;border-radius:8px;transition:background .2s; }
        .back-btn:hover { background:rgba(201,150,58,.1); }
        .content-card { background:#fff;border:1px solid #E2E8F0;border-radius:20px;box-shadow:0 4px 22px rgba(11,29,58,.07);overflow:hidden;margin-bottom:1.25rem; }
        .card-header { padding:1rem 1.4rem;border-bottom:1px solid #F1F5F9;display:flex;align-items:center;gap:.8rem; }
        .card-body { padding:1.4rem; }
        .contact-item { display:flex;align-items:flex-start;gap:.85rem;padding:.9rem 1rem;border-radius:13px;border:1.5px solid #F1F5F9;background:#FAFAF8;transition:border-color .2s,background .2s; }
        .contact-item:hover { border-color:rgba(201,150,58,.3);background:#fff; }
        .portal-btn { display:flex;align-items:center;justify-content:center;gap:.5rem;width:100%;padding:.9rem 1.25rem;border:none;border-radius:13px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:.88rem;font-weight:700;background:linear-gradient(135deg,#C9963A,#E8B85A);color:#0B1D3A;text-decoration:none;box-shadow:0 4px 18px rgba(201,150,58,.3);transition:transform .2s,box-shadow .2s; }
        .portal-btn:hover { transform:translateY(-2px);box-shadow:0 8px 28px rgba(201,150,58,.45); }
        .outline-btn { display:flex;align-items:center;justify-content:center;gap:.5rem;width:100%;padding:.82rem 1.25rem;border-radius:13px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:.85rem;font-weight:600;text-decoration:none;transition:background .2s,color .2s,border-color .2s; }
        .btn-teacher { background:#EBF4FF;color:#1A56A0;border:1.5px solid rgba(26,86,160,.2); }
        .btn-teacher:hover { background:#1A56A0;color:#fff;border-color:#1A56A0; }
        .btn-admin { background:#0B1D3A;color:#fff;border:1.5px solid #0B1D3A; }
        .btn-admin:hover { background:#162D54;border-color:#162D54; }

        /* Layout */
        .page-inner  { max-width:1100px;margin:0 auto;width:100%;padding:1.75rem 1.25rem 3rem; }
        .page-grid   { display:grid;grid-template-columns:1fr 300px;gap:1.5rem;align-items:start; }
        .stats-strip { display:grid;grid-template-columns:repeat(3,1fr); }
        .contact-grid { display:grid;grid-template-columns:1fr 1fr;gap:.85rem; }

        @media(max-width:900px)  { .page-grid { grid-template-columns:1fr; } }
        @media(max-width:580px)  {
          .stats-strip  { grid-template-columns:1fr 1fr; }
          .stats-strip .stat-cell:last-child { grid-column:1/-1; border-top:1px solid #F1F5F9;border-right:none; }
          .contact-grid { grid-template-columns:1fr; }
          .hero-cover   { height:200px !important; }
          .hero-overlay { padding:1.25rem 1rem 1rem !important; }
          .hero-logo    { width:56px !important;height:56px !important;border-radius:12px !important; }
          .hero-h1      { font-size:1.4rem !important; }
        }
      `}</style>

      {/* Header */}
      <header className="fade-up" style={{ background: '#0B1D3A', borderBottom: '2px solid rgba(201,150,58,.5)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ padding: '.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => router.back()} className="back-btn"><ArrowLeft size={15} /> Back</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <Link href="/teacher-login" style={{ color: '#94A3B8', fontSize: '.82rem', fontWeight: 500, textDecoration: 'none' }}>Teacher Login</Link>
            <Link href="/school-login" style={{ color: '#94A3B8', fontSize: '.82rem', fontWeight: 500, textDecoration: 'none' }}>Admin Login</Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="fade-up-1 hero-cover" style={{ position: 'relative', overflow: 'hidden', height: 260, width: '100%' }}>
        {school.coverImageUrl
          ? <img src={school.coverImageUrl} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
          : <div className="dot-grid" style={{ position: 'absolute', inset: 0, background: '#0B1D3A' }} />}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,rgba(11,29,58,.4),rgba(11,29,58,.88))' }} />
        <div style={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,150,58,.15) 0%,transparent 65%)', pointerEvents: 'none' }} />

        <div className="hero-overlay" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.75rem 1.25rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
            {school.logoUrl
              ? <img src={school.logoUrl} alt={school.name} className="hero-logo" style={{ width: 68, height: 68, borderRadius: 14, objectFit: 'contain', border: '3px solid rgba(201,150,58,.5)', background: '#fff', padding: 4, flexShrink: 0 }} />
              : <div className="hero-logo" style={{ width: 68, height: 68, borderRadius: 14, background: 'linear-gradient(135deg,#C9963A,#E8B85A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '3px solid rgba(201,150,58,.4)' }}><School size={28} color="#0B1D3A" /></div>}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem', background: 'rgba(201,150,58,.15)', border: '1px solid rgba(201,150,58,.3)', color: '#F0C060', fontSize: '.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', padding: '.2rem .65rem', borderRadius: 999, marginBottom: '.4rem' }}>
                <Award size={9} /> Registered Institution
              </div>
              <h1 className="hero-h1" style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.5rem,4vw,2.4rem)', fontWeight: 800, color: '#fff', lineHeight: 1.15, margin: '0 0 .25rem' }}>{school.name}</h1>
              {school.subdomain && <p style={{ color: '#C9963A', fontSize: '.78rem', margin: 0 }}>🌐 {school.subdomain}.klas.ng</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="fade-up-2" style={{ background: '#fff', borderBottom: '1px solid #F1F5F9', boxShadow: '0 2px 12px rgba(11,29,58,.06)' }}>
        <div className="stats-strip">
          {stats.map(({ label, value, icon: Icon, color, bg }, i) => (
            <div key={label} className="stat-cell" style={{ padding: '1.1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '.85rem', borderRight: i < stats.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={19} color={color} />
              </div>
              <div>
                <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0B1D3A', lineHeight: 1.1, margin: 0 }}>{value}</p>
                <p style={{ fontSize: '.68rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', margin: 0 }}>{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <main className="fade-up-3" style={{ flex: 1 }}>
        <div className="page-inner">
          <div className="page-grid">

            {/* Left column */}
            <div>
              {/* About */}
              {school.description && (
                <div className="content-card">
                  <div className="card-header">
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: '#EBF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FileText size={16} color="#1A56A0" /></div>
                    <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '.92rem', margin: 0 }}>About the School</p>
                  </div>
                  <div className="card-body">
                    <p style={{ color: '#475569', fontSize: '.88rem', lineHeight: 1.75, whiteSpace: 'pre-line', margin: 0 }}>{school.description}</p>
                  </div>
                </div>
              )}

              {/* Contact */}
              <div className="content-card">
                <div className="card-header">
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: '#E6FFEE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Building2 size={16} color="#059669" /></div>
                  <div>
                    <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '.92rem', margin: 0 }}>Contact Information</p>
                    <p style={{ color: '#94A3B8', fontSize: '.7rem', margin: 0 }}>How to reach {school.name}</p>
                  </div>
                </div>
                <div className="card-body">
                  <div className="contact-grid">
                    {contactItems.map(({ icon: Icon, label, value, color, bg, href }: any) => (
                      <div key={label} className="contact-item">
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: value ? bg : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon size={15} color={value ? color : '#CBD5E1'} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '.65rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.07em', margin: '0 0 .25rem' }}>{label}</p>
                          {value ? (
                            href
                              ? <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" style={{ color, fontSize: '.83rem', fontWeight: 600, textDecoration: 'none', wordBreak: 'break-word' }}>{value}</a>
                              : <p style={{ color: '#0B1D3A', fontSize: '.83rem', fontWeight: 500, wordBreak: 'break-word', margin: 0 }}>{value}</p>
                          ) : (
                            <p style={{ color: '#CBD5E1', fontSize: '.8rem', fontStyle: 'italic', margin: 0 }}>Not provided</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Academic settings */}
              {academicItems.length > 0 && (
                <div className="content-card">
                  <div className="card-header">
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Settings size={16} color="#7C3AED" /></div>
                    <div>
                      <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '.92rem', margin: 0 }}>Academic Settings</p>
                      <p style={{ color: '#94A3B8', fontSize: '.7rem', margin: 0 }}>Grading system and term structure</p>
                    </div>
                  </div>
                  <div className="card-body">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
                      {academicItems.map(({ label, value }: any) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.75rem 1rem', borderRadius: 11, background: '#FAFAF8', border: '1px solid #F1F5F9' }}>
                          <p style={{ color: '#64748B', fontSize: '.82rem', margin: 0 }}>{label}</p>
                          <span style={{ background: '#F3E8FF', color: '#7C3AED', fontSize: '.73rem', fontWeight: 700, padding: '.2rem .65rem', borderRadius: 20 }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Registration */}
              <div className="content-card">
                <div className="card-header">
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Calendar size={16} color="#B45309" /></div>
                  <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '.92rem', margin: 0 }}>Registration Details</p>
                </div>
                <div className="card-body">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                    {[
                      { label: 'School ID',  value: `#${school.id?.slice(0,8)}…`,                                           icon: Hash },
                      { label: 'Registered', value: new Date(school.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), icon: Calendar },
                      school.subdomain && { label: 'Subdomain', value: `${school.subdomain}.klas.ng`, icon: Globe },
                    ].filter(Boolean).map(({ label, value, icon: Icon }: any) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.65rem .9rem', borderRadius: 11, background: '#FAFAF8', border: '1px solid #F1F5F9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.45rem' }}>
                          <Icon size={13} color="#94A3B8" />
                          <p style={{ color: '#64748B', fontSize: '.8rem', margin: 0 }}>{label}</p>
                        </div>
                        <p style={{ color: '#0B1D3A', fontSize: '.8rem', fontWeight: 600, margin: 0 }}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div>
              {/* Parent portal */}
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 20, boxShadow: '0 4px 20px rgba(11,29,58,.07)', overflow: 'hidden', marginBottom: '1.1rem' }}>
                <div className="dot-grid" style={{ background: '#0B1D3A', padding: '1.4rem', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: -40, right: -40, width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,150,58,.18) 0%,transparent 65%)', pointerEvents: 'none' }} />
                  <div style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.55rem', marginBottom: '.65rem' }}>
                      <UsersRound size={17} color="#C9963A" />
                      <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#fff', fontSize: '.95rem', margin: 0 }}>Parents Portal</p>
                    </div>
                    <p style={{ color: '#64748B', fontSize: '.8rem', lineHeight: 1.6, marginBottom: '1.1rem', margin: '0 0 1rem' }}>Check your child's attendance, scores and fees — no login required.</p>
                    <Link href="/parent/view" className="portal-btn">Access Parent Portal <ChevronRight size={14} /></Link>
                  </div>
                </div>
                <div style={{ padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
                  <Link href="/teacher-login" className="outline-btn btn-teacher"><GraduationCap size={15} />Teacher Login</Link>
                  <Link href="/school-login"  className="outline-btn btn-admin"><Building2 size={15} />School Admin Login</Link>
                </div>
              </div>

              {/* Overview */}
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 20, boxShadow: '0 4px 20px rgba(11,29,58,.07)', overflow: 'hidden', marginBottom: '1.1rem' }}>
                <div style={{ padding: '.9rem 1.25rem', borderBottom: '1px solid #F1F5F9' }}>
                  <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '.88rem', margin: 0 }}>📊 School Overview</p>
                </div>
                <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '.55rem' }}>
                  {stats.map(({ label, value, color, bg, icon: Icon }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.45rem' }}>
                        <div style={{ width: 26, height: 26, borderRadius: 7, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={12} color={color} /></div>
                        <p style={{ color: '#64748B', fontSize: '.8rem', margin: 0 }}>{label}</p>
                      </div>
                      <span style={{ background: bg, color, fontWeight: 700, fontSize: '.8rem', padding: '.13rem .55rem', borderRadius: 20 }}>{value}</span>
                    </div>
                  ))}
                  {school.studentCount > 0 && school.teacherCount > 0 && (
                    <div style={{ marginTop: '.2rem', paddingTop: '.65rem', borderTop: '1px solid #F1F5F9' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <p style={{ fontSize: '.72rem', color: '#94A3B8', margin: 0 }}>Student–Teacher ratio</p>
                        <p style={{ fontSize: '.72rem', color: '#0B1D3A', fontWeight: 700, margin: 0 }}>{Math.round(school.studentCount / school.teacherCount)}:1</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick contact */}
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 20, boxShadow: '0 4px 20px rgba(11,29,58,.07)', overflow: 'hidden' }}>
                <div style={{ padding: '.9rem 1.25rem', borderBottom: '1px solid #F1F5F9' }}>
                  <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '.88rem', margin: 0 }}>📞 Quick Contact</p>
                </div>
                <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '.55rem' }}>
                  {[
                    { value: resolvedPhone,   href: resolvedPhone   ? `tel:${resolvedPhone}`    : null, icon: Phone,  color: '#059669', bg: '#E6FFEE', hoverBg: '#D1FAE5', label: 'Phone not provided' },
                    { value: resolvedEmail,   href: resolvedEmail   ? `mailto:${resolvedEmail}` : null, icon: Mail,   color: '#7C3AED', bg: '#F3E8FF', hoverBg: '#EDE9FE', label: 'Email not provided' },
                    { value: resolvedWebsite, href: resolvedWebsite ? (resolvedWebsite.startsWith('http') ? resolvedWebsite : `https://${resolvedWebsite}`) : null, icon: Globe, color: '#0E7490', bg: '#ECFEFF', hoverBg: '#CFFAFE', label: 'Website not provided' },
                  ].map(({ value, href, icon: Icon, color, bg, label }) => (
                    value && href ? (
                      <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: '.55rem', padding: '.65rem .9rem', borderRadius: 11, background: bg, border: `1px solid ${color}20`, textDecoration: 'none' }}>
                        <Icon size={14} color={color} />
                        <p style={{ color, fontSize: '.8rem', fontWeight: 600, wordBreak: 'break-all', margin: 0 }}>{value}</p>
                      </a>
                    ) : !value ? (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '.55rem', padding: '.65rem .9rem', borderRadius: 11, background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                        <Icon size={14} color="#CBD5E1" />
                        <p style={{ color: '#CBD5E1', fontSize: '.8rem', fontStyle: 'italic', margin: 0 }}>{label}</p>
                      </div>
                    ) : null
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <footer style={{ background: '#0B1D3A', borderTop: '1px solid rgba(201,150,58,.15)', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.5rem' }}>
          <p style={{ color: '#475569', fontSize: '.73rem', margin: 0 }}>{school.name}</p>
          <p style={{ color: '#475569', fontSize: '.73rem', margin: 0 }}>Powered by <span style={{ color: '#C9963A', fontWeight: 600 }}>Klas School Management Platform</span></p>
        </div>
      </footer>
    </div>
  );
}

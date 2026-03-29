'use client';
// apps/web/app/parent/dashboard/page.tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  School, LogOut, Users, ChevronRight,
  BookOpen, Calendar, FileText, GraduationCap
} from 'lucide-react';
import EnableNotifications from '@/components/EnableNotifications';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Child {
  id: string; firstName: string; lastName: string;
  studentId?: string; className?: string;
  school: { id: string; name: string; subdomain: string; logoUrl?: string };
}

export default function ParentDashboardPage() {
  const router = useRouter();
  const [parent,      setParent]      = useState<{ name: string; email: string } | null>(null);
  const [children,    setChildren]    = useState<Child[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [parentToken, setParentToken] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('parentToken');
    if (!token) { router.push('/parent/login'); return; }
    setParentToken(token);

    fetch(`${API}/parent/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (res.status === 401) { localStorage.removeItem('parentToken'); router.push('/parent/login'); return null; }
        if (!res.ok) throw new Error('Failed to load');
        return res.json();
      })
      .then(data => {
        if (!data) return;
        setParent(data.parent);
        setChildren(data.children || []);
      })
      .catch(() => setError('Failed to load your account. Please try logging in again.'))
      .finally(() => setLoading(false));
  }, []);

  const logout = () => { localStorage.removeItem('parentToken'); router.push('/parent/login'); };

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#060D1F' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width:44, height:44, borderRadius:'50%', border:'3px solid rgba(201,150,58,.2)', borderTopColor:'#C9963A', animation:'spin .8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#F0EFE9', fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700&family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .gold { background:linear-gradient(90deg,#C9963A,#F5D070,#C9963A); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation:shimmer 5s linear infinite; }
        .fade-up { animation:fadeUp .5s ease both; }
        .child-card { background:#fff; border:1.5px solid #E8EDF3; border-radius:20px; overflow:hidden; box-shadow:0 2px 14px rgba(11,29,58,.06); transition:transform .22s,box-shadow .22s,border-color .2s; text-decoration:none; display:block; }
        .child-card:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(11,29,58,.1); border-color:rgba(201,150,58,.3); }
        .action-btn { display:flex; align-items:center; gap:.55rem; padding:.75rem 1rem; border-radius:12px; border:1.5px solid #E2E8F0; background:#FAFBFF; text-decoration:none; transition:all .2s; color:#0B1D3A; font-size:.82rem; font-weight:600; }
        .action-btn:hover { border-color:#C9963A; background:#FFFBEB; color:#C9963A; }
        .dot-grid { background-image:radial-gradient(circle,rgba(201,150,58,.13) 1px,transparent 1px); background-size:28px 28px; }
      `}</style>

      {/* Header */}
      <header style={{ background:'#0B1D3A', borderBottom:'2px solid rgba(201,150,58,.4)', position:'sticky', top:0, zIndex:20 }} className="fade-up">
        <div style={{ maxWidth:860, margin:'0 auto', padding:'.85rem 1.25rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'.6rem' }}>
            <div style={{ width:32, height:32, borderRadius:9, background:'linear-gradient(135deg,#C9963A,#E8B85A)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <School size={15} color="#0B1D3A" />
            </div>
            <span style={{ fontFamily:"'Cormorant Garamond',serif", color:'#fff', fontWeight:700, fontSize:'1rem' }}>Parent Portal</span>
          </div>

          {/* Right side: bell + logout */}
          <div style={{ display:'flex', alignItems:'center', gap:'.6rem' }}>
            <EnableNotifications role="parent" parentToken={parentToken} compact={true} />
            <button onClick={logout}
              style={{ display:'flex', alignItems:'center', gap:'.4rem', background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.12)', color:'#94A3B8', padding:'.45rem .85rem', borderRadius:9, fontSize:'.8rem', fontWeight:500, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
              <LogOut size={13} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="dot-grid" style={{ background:'#0B1D3A', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-80, right:-60, width:280, height:280, borderRadius:'50%', background:'radial-gradient(circle,rgba(201,150,58,.15) 0%,transparent 65%)', pointerEvents:'none' }} />
        <div style={{ maxWidth:860, margin:'0 auto', padding:'2.5rem 1.25rem 1rem', position:'relative' }}>
          <p style={{ color:'#64748B', fontSize:'.7rem', textTransform:'uppercase', letterSpacing:'.1em', fontWeight:500, marginBottom:'.35rem' }}>Welcome back</p>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(1.6rem,4vw,2.4rem)', fontWeight:800, color:'#fff', margin:'0 0 .25rem' }}>
            {parent?.name ? <span className="gold">{parent.name}</span> : <>Your <span className="gold">Dashboard</span></>}
          </h1>
          <p style={{ color:'#64748B', fontSize:'.8rem' }}>{parent?.email}</p>
        </div>
        <div style={{ height:24, background:'linear-gradient(to bottom,transparent,#F0EFE9)' }} />
      </div>

      <main style={{ maxWidth:860, margin:'0 auto', padding:'1.5rem 1.25rem 3rem' }}>
        {error && (
          <div style={{ background:'#FFF1F2', border:'1px solid #FECDD3', borderRadius:13, padding:'.9rem 1rem', color:'#B91C1C', fontSize:'.85rem', marginBottom:'1.25rem' }}>
            {error}
          </div>
        )}

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem' }}>
          <div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontWeight:800, fontSize:'1.1rem', color:'#0B1D3A', margin:0 }}>
              Your Children
            </h2>
            <p style={{ color:'#94A3B8', fontSize:'.75rem', marginTop:'.2rem' }}>
              {children.length} registered student{children.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Users size={20} color="#94A3B8" />
        </div>

        {children.length === 0 ? (
          <div style={{ background:'#fff', border:'2px dashed #E2E8F0', borderRadius:20, padding:'3rem 2rem', textAlign:'center' }}>
            <GraduationCap size={40} color="#E2E8F0" style={{ margin:'0 auto 1rem' }} />
            <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, color:'#0B1D3A', fontSize:'1rem', marginBottom:'.4rem' }}>No students found</p>
            <p style={{ color:'#94A3B8', fontSize:'.84rem' }}>Your email may not match the one registered at school. Contact your school admin.</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'1.1rem' }}>
            {children.map((child, i) => (
              <div key={child.id} className="child-card" style={{ animationDelay:`${i * 0.08}s` }}>

                {/* Child header */}
                <div style={{ background:'#0B1D3A', padding:'1.1rem 1.25rem', display:'flex', alignItems:'center', gap:'1rem' }}>
                  <div style={{ width:46, height:46, borderRadius:12, background:'linear-gradient(135deg,#C9963A,#E8B85A)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:800, color:'#0B1D3A', fontSize:'1.15rem' }}>
                      {child.firstName[0]}{child.lastName[0]}
                    </span>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, color:'#fff', fontSize:'1rem', margin:0 }}>
                      {child.firstName} {child.lastName}
                    </p>
                    <p style={{ color:'#C9963A', fontSize:'.75rem', margin:'.1rem 0 0' }}>
                      {child.className && `${child.className} · `}{child.school.name}
                    </p>
                  </div>
                  {child.school.logoUrl && (
                    <img src={child.school.logoUrl} alt="" style={{ width:36, height:36, borderRadius:9, objectFit:'contain', background:'rgba(255,255,255,.08)', padding:3 }} />
                  )}
                </div>

                {/* Quick actions */}
                <div style={{ padding:'1rem 1.25rem', display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'.6rem' }}>
                  {[
                    { href:`/parent/student/${child.id}`,           icon: Calendar,  label:'Attendance',  color:'#059669' },
                    { href:`/parent/student/${child.id}#fees`,      icon: () => <span style={{ fontWeight:800, fontSize:'.9rem', color:'#7C3AED' }}>₦</span>, label:'Fees', color:'#7C3AED' },
                    { href:`/parent/results?studentId=${child.id}`, icon: FileText,  label:'Report Card', color:'#0E7490' },
                    { href:`/parent/student/${child.id}`,           icon: BookOpen,  label:'Scores',      color:'#1A56A0' },
                  ].map(({ href, icon: Icon, label, color }) => (
                    <Link key={label} href={href} className="action-btn">
                      <div style={{ width:28, height:28, borderRadius:8, background:`${color}15`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <Icon size={14} style={{ color }} />
                      </div>
                      <span style={{ flex:1 }}>{label}</span>
                      <ChevronRight size={13} color="#CBD5E1" />
                    </Link>
                  ))}
                </div>

                {child.studentId && (
                  <div style={{ padding:'.65rem 1.25rem', borderTop:'1px solid #F1F5F9', background:'#FAFBFF' }}>
                    <p style={{ color:'#94A3B8', fontSize:'.72rem', margin:0 }}>
                      Student ID: <strong style={{ color:'#0B1D3A' }}>{child.studentId}</strong>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <footer style={{ background:'#0B1D3A', borderTop:'1px solid rgba(201,150,58,.1)', padding:'1rem 1.25rem', textAlign:'center' }}>
        <p style={{ color:'#475569', fontSize:'.75rem', margin:0 }}>
          Powered by <span style={{ color:'#C9963A', fontWeight:600 }}>Klas School Management Platform</span>
        </p>
      </footer>
    </div>
  );
}

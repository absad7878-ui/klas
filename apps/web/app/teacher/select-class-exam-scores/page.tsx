'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PenLine, ChevronRight, School, ArrowLeft, Users } from 'lucide-react';

type ClassItem = { id: string; name: string; studentCount?: number };

export default function SelectClassForExamScores() {
  const router = useRouter();
  const [classes, setClasses]   = useState<ClassItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/teacher-login'); return; }

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/classes`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => { if (!r.ok) throw new Error('Failed to load classes'); return r.json(); })
      .then(data => setClasses(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="min-h-screen" style={{ fontFamily: "'DM Sans',sans-serif", background: '#F7F6F2' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .fade-up   { animation: fadeUp .5s ease both; }
        .fade-up-1 { animation: fadeUp .5s .08s ease both; }
        .class-card {
          background:#fff; border:1.5px solid #E8EDF3; border-radius:18px;
          padding:1.4rem 1.6rem; display:flex; align-items:center; justify-content:space-between;
          cursor:pointer; transition:transform .2s cubic-bezier(.34,1.56,.64,1),box-shadow .2s,border-color .2s;
          text-decoration:none; position:relative; overflow:hidden;
        }
        .class-card::before {
          content:''; position:absolute; left:0; top:0; bottom:0; width:3px;
          background:#0E7490; opacity:0; transition:opacity .2s;
        }
        .class-card:hover { transform:translateY(-3px); box-shadow:0 10px 32px rgba(11,29,58,.10); border-color:#A5F3FC; }
        .class-card:hover::before { opacity:1; }
        .hero-dot-grid { background-image:radial-gradient(circle,rgba(201,150,58,.13) 1px,transparent 1px); background-size:28px 28px; }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-10" style={{ background: '#0B1D3A', borderBottom: '2px solid #C9963A' }}>
        <div className="max-w-3xl mx-auto px-6 py-3.5 flex items-center gap-3">
          <button onClick={() => router.back()}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition"
            style={{ border: '1px solid rgba(255,255,255,.15)', background: 'rgba(255,255,255,.06)', cursor: 'pointer' }}>
            <ArrowLeft className="h-4 w-4 text-white" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#C9963A,#E8B85A)' }}>
              <School className="h-3.5 w-3.5 text-[#0B1D3A]" />
            </div>
            <span style={{ fontFamily:"'Playfair Display',serif", color:'#fff', fontWeight:700, fontSize:'.9rem' }}>
              Exam Scores
            </span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden fade-up" style={{ background: '#0B1D3A' }}>
        <div className="absolute inset-0 hero-dot-grid" />
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(14,116,144,.25) 0%,transparent 65%)' }} />
        <div className="relative max-w-3xl mx-auto px-6 py-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(14,116,144,.2)', border: '1px solid rgba(14,116,144,.4)' }}>
            <PenLine className="h-6 w-6" style={{ color: '#67E8F9' }} />
          </div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(1.6rem,4vw,2.2rem)', fontWeight:800, color:'#fff', lineHeight:1.2 }}>
            Enter Exam Scores
          </h1>
          <p className="text-slate-400 text-sm mt-2">Select a class to enter CA & exam marks for the term</p>
        </div>
        <div className="h-5" style={{ background: 'linear-gradient(to bottom,transparent,#F7F6F2)' }} />
      </div>

      {/* Class list */}
      <main className="max-w-3xl mx-auto px-6 py-8 fade-up-1">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div style={{ width:40,height:40,borderRadius:'50%',border:'3px solid rgba(14,116,144,.2)',borderTopColor:'#0E7490',animation:'spin .8s linear infinite' }} />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-5 py-4 text-sm">{error}</div>
        )}

        {!loading && !error && classes.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: '#ECFEFF' }}>
              <PenLine className="h-7 w-7 text-[#0E7490]" />
            </div>
            <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:'1.1rem', color:'#0B1D3A' }}>No classes assigned</p>
            <p className="text-slate-400 text-sm mt-1">Ask the admin to assign you to a class first</p>
          </div>
        )}

        {!loading && classes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:'1.1rem', color:'#0B1D3A' }}>
                Your Classes
              </h2>
              <span className="text-xs text-slate-400 font-medium">{classes.length} class{classes.length !== 1 ? 'es' : ''}</span>
            </div>
            <div className="space-y-3">
              {classes.map((cls) => (
                <a key={cls.id} href={`/teacher/exam-scores/${cls.id}`} className="class-card">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: '#ECFEFF', border: '1px solid rgba(14,116,144,.2)' }}>
                      <PenLine className="h-5 w-5 text-[#0E7490]" />
                    </div>
                    <div>
                      <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:'1rem', color:'#0B1D3A' }}>
                        {cls.name}
                      </p>
                      {cls.studentCount !== undefined && (
                        <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                          <Users size={11} /> {cls.studentCount} student{cls.studentCount !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#0E7490' }}>
                    Enter scores <ChevronRight size={14} />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

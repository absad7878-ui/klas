'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AlertCircle, Calendar, CheckCircle, BookOpen, ArrowLeft, Send } from 'lucide-react';

export default function PostAssignmentPage() {
  const { classId } = useParams<{ classId: string }>();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found. Please login again.');

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          classId,
          title: title.trim(),
          description: description.trim() || null,
          dueDate: dueDate || null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error (${res.status})`);
      }

      setSuccess('Assignment posted successfully!');
      setTitle('');
      setDescription('');
      setDueDate('');
    } catch (err: any) {
      setError(err.message || 'Failed to post assignment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

        .gold-shimmer {
          background: linear-gradient(90deg, #C9963A 0%, #F0C060 40%, #C9963A 60%, #E8B85A 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        .hero-dot-grid {
          background-image: radial-gradient(circle, rgba(201,150,58,.13) 1px, transparent 1px);
          background-size: 28px 28px;
        }

        /* Full-width two-column grid */
        .page-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 2rem;
          align-items: start;
          width: 100%;
        }
        @media (max-width: 960px) {
          .page-grid { grid-template-columns: 1fr; }
        }

        .form-card {
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 24px;
          box-shadow: 0 4px 28px rgba(11,29,58,.08);
          overflow: hidden;
        }

        .sidebar-card {
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(11,29,58,.07);
          overflow: hidden;
          position: sticky;
          top: 76px;
        }

        .field-label {
          font-size: .78rem;
          font-weight: 600;
          color: #0B1D3A;
          text-transform: uppercase;
          letter-spacing: .07em;
          display: flex;
          align-items: center;
          gap: .35rem;
          margin-bottom: .45rem;
        }

        .field-input {
          width: 100%;
          padding: .9rem 1.1rem;
          border: 1.5px solid #E2E8F0;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: .9rem;
          color: #0B1D3A;
          background: #FAFAF8;
          outline: none;
          transition: border-color .2s, box-shadow .2s, background .2s;
          resize: vertical;
          box-sizing: border-box;
        }
        .field-input::placeholder { color: #94A3B8; }
        .field-input:focus {
          border-color: #C9963A;
          box-shadow: 0 0 0 3px rgba(201,150,58,.12);
          background: #fff;
        }
        .field-input:hover:not(:focus) { border-color: #CBD5E1; }
        .field-input[type="date"]::-webkit-calendar-picker-indicator { opacity:.5; cursor:pointer; }

        .submit-btn {
          width: 100%;
          padding: 1rem 1.5rem;
          border: none; border-radius: 14px; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: .95rem; font-weight: 600;
          display: flex; align-items: center; justify-content: center; gap: .55rem;
          transition: background .2s, transform .15s, box-shadow .2s;
          background: linear-gradient(135deg, #0B1D3A 0%, #162D54 100%);
          color: #fff;
          box-shadow: 0 4px 18px rgba(11,29,58,.22);
        }
        .submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #162D54 0%, #1e3a6a 100%);
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(11,29,58,.28);
        }
        .submit-btn:disabled { opacity:.65; cursor:not-allowed; }

        .back-btn {
          display: inline-flex; align-items: center; gap: .4rem;
          color: #C9963A; font-size: .82rem; font-weight: 500;
          background: none; border: none; cursor: pointer;
          padding: .4rem .75rem; border-radius: 8px;
          transition: background .2s; font-family: 'DM Sans', sans-serif;
        }
        .back-btn:hover { background: rgba(201,150,58,.1); }

        .alert-slide { animation: slideDown .3s ease both; }
        .gold-divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(201,150,58,.3), transparent); }
        .char-count { font-size: .7rem; color: #94A3B8; text-align: right; margin-top: .2rem; }

        .tip-row {
          display: flex; align-items: flex-start; gap: .7rem;
          padding: .8rem 0;
          border-bottom: 1px solid #F8FAFC;
        }
        .tip-row:last-child { border-bottom: none; padding-bottom: 0; }
      `}</style>

      {/* ══════════ HEADER ══════════ */}
      <header className="sticky top-0 z-20 fade-up"
        style={{ background: '#0B1D3A', borderBottom: '2px solid rgba(201,150,58,.5)' }}>
        <div style={{ padding: '.85rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg, #C9963A, #E8B85A)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <BookOpen size={16} color="#0B1D3A" />
            </div>
            <p style={{ fontFamily: "'Playfair Display', serif", color: '#fff', fontWeight: 700, fontSize: '.9rem' }}>
              Post Assignment
            </p>
          </div>
          <button className="back-btn" onClick={() => router.back()}>
            <ArrowLeft size={14} /> Back
          </button>
        </div>
      </header>

      {/* ══════════ HERO ══════════ */}
      <div className="relative overflow-hidden fade-up-1" style={{ background: '#0B1D3A' }}>
        <div className="absolute inset-0 hero-dot-grid" />
        <div className="absolute" style={{ top: -80, right: -40, width: 300, height: 300, borderRadius: '50%', pointerEvents: 'none', background: 'radial-gradient(circle, rgba(201,150,58,.13) 0%, transparent 65%)' }} />
        <div className="absolute" style={{ bottom: -60, left: -30, width: 200, height: 200, borderRadius: '50%', pointerEvents: 'none', background: 'radial-gradient(circle, rgba(26,86,160,.2) 0%, transparent 65%)' }} />
        <div className="relative" style={{ padding: '2.5rem 2rem 1.25rem' }}>
          <p style={{ color: '#64748B', fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 500, marginBottom: '.5rem' }}>
            Class · {classId}
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.7rem, 3vw, 2.4rem)', fontWeight: 800, color: '#fff', lineHeight: 1.15 }}>
            Create a <span className="gold-shimmer">New Assignment</span>
          </h1>
          <p style={{ color: '#64748B', fontSize: '.88rem', marginTop: '.6rem' }}>
            Fill in the details below and post it to your class instantly.
          </p>
        </div>
        <div style={{ height: 24, background: 'linear-gradient(to bottom, transparent, #F0EFE9)' }} />
      </div>

      {/* ══════════ CONTENT ══════════ */}
      <main className="fade-up-2" style={{ flex: 1, padding: '2rem 2rem 3rem' }}>

        {success && (
          <div className="alert-slide" style={{ marginBottom: '1.25rem', padding: '1rem 1.25rem', borderRadius: 16, background: '#ECFDF5', border: '1.5px solid #6EE7B7', display: 'flex', alignItems: 'flex-start', gap: '.75rem' }}>
            <CheckCircle size={18} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ color: '#065F46', fontWeight: 600, fontSize: '.88rem' }}>Success!</p>
              <p style={{ color: '#047857', fontSize: '.83rem', marginTop: '.1rem' }}>{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="alert-slide" style={{ marginBottom: '1.25rem', padding: '1rem 1.25rem', borderRadius: 16, background: '#FFF1F2', border: '1.5px solid #FECDD3', display: 'flex', alignItems: 'flex-start', gap: '.75rem' }}>
            <AlertCircle size={18} color="#E11D48" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ color: '#9F1239', fontWeight: 600, fontSize: '.88rem' }}>Error</p>
              <p style={{ color: '#BE123C', fontSize: '.83rem', marginTop: '.1rem' }}>{error}</p>
            </div>
          </div>
        )}

        <div className="page-grid">

          {/* ── FORM ── */}
          <div className="form-card">
            <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '.85rem' }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: '#EBF4FF', border: '1px solid rgba(26,86,160,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <BookOpen size={18} color="#1A56A0" />
              </div>
              <div>
                <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: '#0B1D3A', fontSize: '1rem' }}>Assignment Details</p>
                <p style={{ color: '#94A3B8', fontSize: '.75rem' }}>Fields marked <span style={{ color: '#C9963A' }}>*</span> are required</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              <div>
                <label htmlFor="title" className="field-label">
                  Assignment Title <span style={{ color: '#C9963A' }}>*</span>
                </label>
                <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)}
                  className="field-input" placeholder="e.g. Mathematics Assignment — Chapter 5" required maxLength={120} />
                <p className="char-count">{title.length}/120</p>
              </div>

              <div className="gold-divider" />

              <div>
                <label htmlFor="description" className="field-label">
                  Description / Instructions <span style={{ color: '#C9963A' }}>*</span>
                </label>
                <textarea id="description" value={description} onChange={e => setDescription(e.target.value)}
                  className="field-input" placeholder="Detailed instructions, questions, or resources for students…"
                  required style={{ minHeight: 200 }} maxLength={1000} />
                <p className="char-count">{description.length}/1000</p>
              </div>

              <div className="gold-divider" />

              <div>
                <label htmlFor="dueDate" className="field-label">
                  <Calendar size={13} color="#C9963A" />
                  Due Date <span style={{ color: '#94A3B8', fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: '.75rem' }}>(optional)</span>
                </label>
                <input id="dueDate" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]} className="field-input" />
                {dueDate && (
                  <p style={{ fontSize: '.75rem', color: '#C9963A', fontWeight: 500, marginTop: '.35rem' }}>
                    📅 Due: {new Date(dueDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>

              <div style={{ paddingTop: '.25rem' }}>
                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? (
                    <>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(255,255,255,.25)', borderTopColor: '#fff', animation: 'spin .7s linear infinite', flexShrink: 0 }} />
                      Posting Assignment…
                    </>
                  ) : (
                    <><Send size={16} /> Post Assignment</>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* ── SIDEBAR ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            <div className="sidebar-card">
              <div style={{ padding: '1rem 1.4rem', borderBottom: '1px solid #F1F5F9' }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: '#0B1D3A', fontSize: '.9rem' }}>💡 Posting Tips</p>
              </div>
              <div style={{ padding: '.25rem 1.4rem 1.1rem' }}>
                {[
                  { dot: '#1A56A0', text: 'Use a clear, specific title so students know exactly what is expected.' },
                  { dot: '#059669', text: 'Include page numbers, links, or references in the description.' },
                  { dot: '#C9963A', text: 'Setting a due date helps students manage their time better.' },
                  { dot: '#7C3AED', text: 'You can post multiple assignments for the same class.' },
                ].map(({ dot, text }, i) => (
                  <div key={i} className="tip-row">
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: dot, flexShrink: 0, marginTop: 5 }} />
                    <p style={{ color: '#475569', fontSize: '.82rem', lineHeight: 1.55 }}>{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="sidebar-card">
              <div style={{ padding: '1rem 1.4rem', borderBottom: '1px solid #F1F5F9' }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: '#0B1D3A', fontSize: '.9rem' }}>📋 Class Info</p>
              </div>
              <div style={{ padding: '1rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '.7rem' }}>
                {[
                  { label: 'Class ID',  value: classId ?? '—' },
                  { label: 'Posted by', value: 'You (Admin)' },
                  { label: 'Date',      value: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ color: '#94A3B8', fontSize: '.78rem', fontWeight: 500 }}>{label}</p>
                    <p style={{ color: '#0B1D3A', fontSize: '.82rem', fontWeight: 600 }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* ══════════ FOOTER ══════════ */}
      <footer style={{ background: '#0B1D3A', borderTop: '1px solid rgba(201,150,58,.15)', padding: '1.1rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.5rem' }}>
          <p style={{ color: '#475569', fontSize: '.75rem' }}>Class · <span style={{ color: '#94A3B8' }}>{classId}</span></p>
          <p style={{ color: '#475569', fontSize: '.75rem' }}>Powered by <span style={{ color: '#C9963A', fontWeight: 600 }}>Klas School Management Platform</span></p>
        </div>
      </footer>

    </div>
  );
}

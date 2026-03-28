'use client';
// Route: /dashboard/subjects

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ArrowLeft, BookOpen, GripVertical, Check, X } from 'lucide-react';

interface Subject { id: string; name: string; order: number; isActive: boolean; }

export default function SubjectsPage() {
  const router = useRouter();
  const [subjects, setSubjects]   = useState<Subject[]>([]);
  const [loading,  setLoading]    = useState(true);
  const [newName,  setNewName]    = useState('');
  const [adding,   setAdding]     = useState(false);
  const [error,    setError]      = useState('');
  const [success,  setSuccess]    = useState('');

const API   = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const token = () => localStorage.getItem('token') || '';

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const res = await fetch(`${API}/exams/subjects`, { headers: { Authorization: `Bearer ${token()}` } });
    if (res.ok) setSubjects(await res.json());
    setLoading(false);
  };

  const addSubject = async () => {
    if (!newName.trim()) return;
    setAdding(true); setError('');
    try {
      const res = await fetch(`${API}/exams/subjects`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ name: newName.trim(), order: subjects.length }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      setNewName(''); setSuccess('Subject added!'); setTimeout(() => setSuccess(''), 3000);
      load();
    } catch (err: any) { setError(err.message); }
    finally { setAdding(false); }
  };

  const deleteSubject = async (id: string) => {
    if (!confirm('Remove this subject? Past results will still be kept.')) return;
    await fetch(`${API}/exams/subjects/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    load();
  };

  const DEFAULT_SUBJECTS = ['Mathematics','English Language','Basic Science','Social Studies','Civic Education','Agricultural Science','Computer Science','Physical Education','Fine Arts','Music','Yoruba','Igbo','Hausa','Economics','Government','Literature'];

  return (
    <div style={{ minHeight: '100vh', background: '#F0EFE9', fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation:fadeUp .4s ease both; }
        .card { background:#fff;border:1px solid #E2E8F0;border-radius:18px;box-shadow:0 2px 14px rgba(11,29,58,.06); }
        .subj-row { display:flex;align-items:center;gap:.75rem;padding:.75rem 1rem;border-bottom:1px solid #F8FAFC;transition:background .12s; }
        .subj-row:last-child { border-bottom:none; }
        .subj-row:hover { background:#FAFAF8; }
        .add-input { flex:1;padding:.75rem 1rem;border:1.5px solid #E2E8F0;border-radius:11px;font-family:'DM Sans',sans-serif;font-size:.9rem;color:#0B1D3A;background:#FAFBFF;outline:none;transition:border-color .2s,box-shadow .2s; }
        .add-input:focus { border-color:#C9963A;box-shadow:0 0 0 3px rgba(201,150,58,.12); }
        .quick-btn { padding:.45rem .85rem;border-radius:8px;border:1.5px solid #E2E8F0;background:#fff;font-family:'DM Sans',sans-serif;font-size:.78rem;font-weight:600;color:#475569;cursor:pointer;transition:all .12s; }
        .quick-btn:hover { border-color:#C9963A;color:#C9963A;background:#FFFBEB; }
      `}</style>

      <header style={{ background: '#0B1D3A', borderBottom: '2px solid rgba(201,150,58,.5)', padding: '.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#C9963A,#E8B85A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={15} color="#0B1D3A" />
          </div>
          <span style={{ fontFamily: "'Playfair Display',serif", color: '#fff', fontWeight: 700, fontSize: '.9rem' }}>Manage Subjects</span>
        </div>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#C9963A', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.35rem', fontSize: '.82rem', fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>
          <ArrowLeft size={14} /> Back
        </button>
      </header>

      <main style={{ padding: '1.5rem', maxWidth: 700, margin: '0 auto' }}>

        {success && <div style={{ background: '#ECFDF5', border: '1.5px solid #6EE7B7', borderRadius: 12, padding: '.75rem 1rem', marginBottom: '1rem', color: '#065F46', fontSize: '.85rem', fontWeight: 600 }}>{success}</div>}
        {error   && <div style={{ background: '#FFF1F2', border: '1.5px solid #FECDD3', borderRadius: 12, padding: '.75rem 1rem', marginBottom: '1rem', color: '#BE123C', fontSize: '.85rem' }}>{error}</div>}

        {/* Add subject */}
        <div className="card fade-up" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', margin: '0 0 .85rem' }}>Add New Subject</p>
          <div style={{ display: 'flex', gap: '.75rem', marginBottom: '.85rem' }}>
            <input className="add-input" value={newName} onChange={e => setNewName(e.target.value)}
              placeholder="Subject name e.g. Mathematics"
              onKeyDown={e => e.key === 'Enter' && addSubject()} />
            <button onClick={addSubject} disabled={adding || !newName.trim()}
              style={{ display: 'flex', alignItems: 'center', gap: '.4rem', padding: '.75rem 1.25rem', borderRadius: 11, border: 'none', background: 'linear-gradient(135deg,#C9963A,#E8B85A)', color: '#0B1D3A', fontWeight: 700, fontSize: '.85rem', fontFamily: "'DM Sans',sans-serif", cursor: 'pointer', opacity: adding ? .7 : 1, whiteSpace: 'nowrap' }}>
              <Plus size={15} /> Add
            </button>
          </div>
          {/* Quick-add common subjects */}
          <p style={{ fontSize: '.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.07em', margin: '0 0 .5rem' }}>Quick Add</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
            {DEFAULT_SUBJECTS.filter(d => !subjects.find(s => s.name.toLowerCase() === d.toLowerCase())).map(d => (
              <button key={d} className="quick-btn" onClick={() => setNewName(d)}>{d}</button>
            ))}
          </div>
        </div>

        {/* Subject list */}
        <div className="card fade-up">
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F1F5F9' }}>
            <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', margin: 0 }}>
              Current Subjects <span style={{ background: '#EBF4FF', color: '#1A56A0', fontSize: '.72rem', fontWeight: 700, padding: '.15rem .55rem', borderRadius: 20, marginLeft: '.4rem' }}>{subjects.length}</span>
            </p>
          </div>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8', fontSize: '.85rem' }}>Loading…</div>
          ) : subjects.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center' }}>
              <BookOpen size={36} color="#E2E8F0" style={{ margin: '0 auto .75rem' }} />
              <p style={{ color: '#94A3B8', fontSize: '.88rem' }}>No subjects yet — add your first subject above</p>
            </div>
          ) : (
            subjects.map((subj, idx) => (
              <div key={subj.id} className="subj-row">
                <span style={{ width: 24, height: 24, borderRadius: 6, background: '#F1F5F9', color: '#94A3B8', fontSize: '.7rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {idx + 1}
                </span>
                <span style={{ flex: 1, fontWeight: 600, color: '#0B1D3A', fontSize: '.88rem' }}>{subj.name}</span>
                <button onClick={() => deleteSubject(subj.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CBD5E1', lineHeight: 0, padding: '.25rem', borderRadius: 6, transition: 'color .15s' }}
                  onMouseOver={e => (e.currentTarget.style.color = '#DC2626')}
                  onMouseOut={e => (e.currentTarget.style.color = '#CBD5E1')}>
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

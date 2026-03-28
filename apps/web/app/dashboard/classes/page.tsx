'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, BookOpen, ArrowLeft, School, ChevronRight, Users, Trash2 } from 'lucide-react';

export default function ClassesPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return router.push('/login');
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/classes`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => { if (!res.ok) throw new Error('Failed to fetch classes'); return res.json(); })
      .then(data => { setClasses(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (!res.ok) { const errData = await res.json(); throw new Error(errData.error || 'Failed to add class'); }
      const newClass = await res.json();
      setClasses(prev => [...prev, newClass]);
      setShowAddModal(false);
      setFormData({ name: '' });
    } catch (err: any) { setError(err.message); }
  };

  const handleDelete = async () => {
    if (!selectedClass) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/classes/${selectedClass.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { const errData = await res.json(); throw new Error(errData.error || 'Failed to delete class'); }
      setClasses(prev => prev.filter(c => c.id !== selectedClass.id));
      setShowDeleteConfirm(false);
      setSelectedClass(null);
    } catch (err: any) { setError(err.message); setShowDeleteConfirm(false); }
  };

  const accents = [
    { iconColor: '#1A56A0', iconBg: '#EBF4FF', accent: '#1A56A0' },
    { iconColor: '#059669', iconBg: '#E6FFEE', accent: '#059669' },
    { iconColor: '#B45309', iconBg: '#FFFBEB', accent: '#B45309' },
    { iconColor: '#7C3AED', iconBg: '#F3E8FF', accent: '#7C3AED' },
    { iconColor: '#0E7490', iconBg: '#ECFEFF', accent: '#0E7490' },
    { iconColor: '#9D174D', iconBg: '#FCE7F3', accent: '#9D174D' },
  ];

  return (
    <div className="min-h-screen w-screen" style={{ fontFamily: "'DM Sans', sans-serif", background: '#F7F6F2' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        .display { font-family: 'Playfair Display', serif; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .fade-up   { animation: fadeUp .5s ease both; }
        .fade-up-1 { animation: fadeUp .5s .08s ease both; }
        .fade-up-2 { animation: fadeUp .5s .16s ease both; }
        .hero-dot-grid { background-image:radial-gradient(circle,rgba(201,150,58,.13) 1px,transparent 1px);background-size:30px 30px; }
        .class-card { background:#fff;border:1px solid #E2E8F0;border-radius:18px;padding:1.6rem;display:flex;flex-direction:column;text-decoration:none;box-shadow:0 2px 12px rgba(11,29,58,.05);transition:box-shadow .22s,transform .22s,border-color .22s;position:relative;overflow:hidden; }
        .class-card::after { content:'';position:absolute;bottom:0;left:0;right:0;height:3px;background:var(--accent);transform:scaleX(0);transform-origin:left;transition:transform .25s ease; }
        .class-card:hover { box-shadow:0 10px 32px rgba(11,29,58,.12);transform:translateY(-3px);border-color:#CBD5E1; }
        .class-card:hover::after { transform:scaleX(1); }
        .add-btn { display:inline-flex;align-items:center;gap:.5rem;background:linear-gradient(135deg,#C9963A 0%,#E8B85A 100%);color:#0B1D3A;font-weight:700;font-size:.9rem;padding:.75rem 1.4rem;border-radius:11px;border:none;cursor:pointer;box-shadow:0 4px 16px rgba(201,150,58,.3);white-space:nowrap;transition:transform .2s,box-shadow .2s; }
        .add-btn:hover { transform:translateY(-1px);box-shadow:0 7px 22px rgba(201,150,58,.4); }
        .modal-overlay { position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:50;padding:1rem;backdrop-filter:blur(2px); }
        .modal-box { background:#fff;border-radius:20px;box-shadow:0 24px 60px rgba(0,0,0,.2);width:100%;max-width:440px;padding:2rem;position:relative;animation:fadeUp .3s ease both; }
        .form-label { display:block;font-size:.75rem;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:.4rem; }
        .form-input { width:100%;padding:.85rem 1rem;font-family:'DM Sans',sans-serif;font-size:.95rem;border:1.5px solid #E2E8F0;border-radius:11px;background:#FAFBFF;color:#0B1D3A;outline:none;transition:border-color .2s,box-shadow .2s;box-sizing:border-box; }
        .form-input:focus { border-color:#C9963A;box-shadow:0 0 0 3px rgba(201,150,58,.12);background:#fff; }
        .form-input::placeholder { color:#A0AEC0; }
        .submit-btn { width:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#C9963A,#E8B85A);color:#0B1D3A;font-weight:700;font-size:.95rem;padding:.9rem;border-radius:11px;border:none;cursor:pointer;box-shadow:0 4px 16px rgba(201,150,58,.3);transition:transform .2s,box-shadow .2s; }
        .submit-btn:hover { transform:translateY(-1px);box-shadow:0 7px 22px rgba(201,150,58,.4); }
        .delete-btn { position:absolute;top:.75rem;right:.75rem;width:30px;height:30px;border-radius:8px;background:#FEF2F2;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;opacity:1; transition:background .2s; }
        
        .delete-btn:hover { background:#FEE2E2; }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-10 fade-up" style={{ background: '#0B1D3A', borderBottom: '2px solid #C9963A' }}>
        <div className="w-full px-6 py-3.5 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-[#C9963A] hover:text-[#E8B85A] font-semibold text-sm transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#C9963A,#E8B85A)' }}>
              <School className="h-3.5 w-3.5 text-[#0B1D3A]" />
            </div>
            <span className="display text-white font-bold text-sm">School Platform</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden fade-up-1 w-full" style={{ background: '#0B1D3A' }}>
        <div className="absolute inset-0 hero-dot-grid" />
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(201,150,58,.15) 0%,transparent 65%)' }} />
        <div className="relative w-full px-6 py-8 flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider font-medium">Admin Dashboard</p>
            <h1 className="display text-3xl md:text-4xl font-bold text-white leading-tight">
              Classes <span style={{ color: '#C9963A' }}>Management</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">{classes.length} class{classes.length !== 1 ? 'es' : ''} registered</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="add-btn">
            <Plus className="h-4 w-4" /> Add Class
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="w-full px-6 py-8 fade-up-2">
        {error && !showAddModal && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
            <X className="h-4 w-4 flex-shrink-0" /> {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-20 text-center shadow-sm">
            <div style={{ width:40, height:40, borderRadius:'50%', border:'3px solid rgba(201,150,58,.2)', borderTopColor:'#C9963A', animation:'spin .8s linear infinite', margin:'0 auto 1rem' }} />
            <p className="text-slate-400 text-sm">Loading classes…</p>
          </div>

        ) : classes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-20 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-[#0B1D3A] font-semibold text-base mb-1">No classes yet</p>
            <p className="text-slate-400 text-sm mb-6">Click "Add Class" to create your first class</p>
            <button onClick={() => setShowAddModal(true)} className="add-btn mx-auto"><Plus className="h-4 w-4" /> Add Class</button>
          </div>

        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {classes.map((cls: any, idx) => {
              const { iconColor, iconBg, accent } = accents[idx % accents.length];
              return (
                <div key={cls.id} className="class-card" style={{ '--accent': accent } as React.CSSProperties}>
                  {/* Delete button — appears on hover */}
                  <button className="delete-btn" onClick={e => { e.preventDefault(); e.stopPropagation(); setSelectedClass(cls); setShowDeleteConfirm(true); }}>
                    <Trash2 size={13} color="#EF4444" />
                  </button>

                  {/* Card content — clickable to open class */}
                  <a href={`/dashboard/class/${cls.id}/students`} style={{ textDecoration:'none', display:'flex', flexDirection:'column', flex:1 }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 flex-shrink-0" style={{ background: iconBg }}>
                      <BookOpen className="h-6 w-6" style={{ color: iconColor }} />
                    </div>
                    <h3 className="display font-bold text-[#0B1D3A] text-lg mb-1 leading-tight">{cls.name}</h3>
                    <p className="text-slate-400 text-sm flex-1">
                      {cls._count?.students ?? cls.studentCount ?? '—'} students enrolled
                    </p>
                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-slate-300" />
                        <span className="text-xs text-slate-400 font-medium">View Roster</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: accent }}>
                        Open <ChevronRight size={13} />
                      </div>
                    </div>
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <button onClick={() => { setShowAddModal(false); setFormData({ name:'' }); setError(''); }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
              <X className="h-4 w-4 text-slate-500" />
            </button>
            <div className="mb-6">
              <h2 className="display text-xl font-bold text-[#0B1D3A]">Add New Class</h2>
              <p className="text-slate-400 text-sm mt-0.5">Give your class a name to get started</p>
            </div>
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 px-3.5 py-2.5 rounded-xl mb-4 text-sm">
                <X className="h-4 w-4 flex-shrink-0" /> {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="form-label">Class Name *</label>
                <input name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Primary 1A" className="form-input" required />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" className="submit-btn">Add Class</button>
                <button type="button" onClick={() => { setShowAddModal(false); setError(''); }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-3 rounded-xl border-none cursor-pointer transition-colors text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && selectedClass && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 420 }}>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-7 w-7 text-red-400" />
              </div>
              <h2 className="display text-xl font-bold text-[#0B1D3A] mb-2">Delete Class?</h2>
              <p className="text-slate-500 text-sm">
                This will permanently delete <span className="font-semibold text-[#0B1D3A]">{selectedClass.name}</span> and all its students and records. This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl border-none cursor-pointer transition-colors text-sm"
                style={{ fontFamily:"'DM Sans',sans-serif" }}>
                Yes, Delete
              </button>
              <button onClick={() => { setShowDeleteConfirm(false); setSelectedClass(null); }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-3 rounded-xl border-none cursor-pointer transition-colors text-sm"
                style={{ fontFamily:"'DM Sans',sans-serif" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

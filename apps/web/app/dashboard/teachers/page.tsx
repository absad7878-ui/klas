'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, X, GraduationCap, ArrowLeft, School, Mail, Phone } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function TeachersPage() {
  const router = useRouter();
  const [teachers, setTeachers]   = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  // Add modal
  const [showAddModal, setShowAddModal]     = useState(false);
  const [addForm, setAddForm]               = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' });
  const [addLoading, setAddLoading]         = useState(false);

  // Edit modal
  const [editTeacher, setEditTeacher]       = useState<any>(null);
  const [editForm, setEditForm]             = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [editLoading, setEditLoading]       = useState(false);

  // Delete confirm
  const [deleteTeacher, setDeleteTeacher]   = useState<any>(null);
  const [deleteLoading, setDeleteLoading]   = useState(false);

  const token = () => localStorage.getItem('token') || '';

  const flash = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3500); };

  useEffect(() => {
    const t = token();
    if (!t) { router.push('/school-login'); return; }
    fetch(`${API}/teachers`, { headers: { Authorization: `Bearer ${t}` } })
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : Array.isArray(data?.teachers) ? data.teachers : Array.isArray(data?.data) ? data.data : [];
        setTeachers(list); setLoading(false);
      })
      .catch(err => { setError(err.message || 'Failed to load teachers'); setLoading(false); });
  }, [router]);

  // ── ADD ──────────────────────────────────────────────────────────────────
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setAddLoading(true);
    try {
      const res = await fetch(`${API}/teachers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify(addForm),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Failed to add teacher'); }
      const newTeacher = await res.json();
      setTeachers(prev => [...prev, newTeacher?.teacher || newTeacher]);
      setShowAddModal(false);
      setAddForm({ firstName: '', lastName: '', email: '', phone: '', password: '' });
      flash('Teacher added successfully!');
    } catch (err: any) { setError(err.message); }
    finally { setAddLoading(false); }
  };

  // ── EDIT ─────────────────────────────────────────────────────────────────
  const openEdit = (t: any) => {
    setEditTeacher(t);
    setEditForm({ firstName: t.firstName, lastName: t.lastName, email: t.email, phone: t.phone || '' });
    setError('');
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setEditLoading(true);
    try {
      const res = await fetch(`${API}/teachers/${editTeacher.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Failed to update teacher'); }
      const updated = await res.json();
      const updatedObj = updated?.teacher || updated;
      setTeachers(prev => prev.map(t => t.id === editTeacher.id ? { ...t, ...updatedObj } : t));
      setEditTeacher(null);
      flash('Teacher updated successfully!');
    } catch (err: any) { setError(err.message); }
    finally { setEditLoading(false); }
  };

  // ── DELETE ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTeacher) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`${API}/teachers/${deleteTeacher.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Failed to delete teacher'); }
      setTeachers(prev => prev.filter(t => t.id !== deleteTeacher.id));
      setDeleteTeacher(null);
      flash('Teacher removed.');
    } catch (err: any) { setError(err.message); setDeleteTeacher(null); }
    finally { setDeleteLoading(false); }
  };

  const avatarColors = [
    'linear-gradient(135deg,#1A56A0,#2B6CB0)',
    'linear-gradient(135deg,#059669,#0D9488)',
    'linear-gradient(135deg,#7C3AED,#9F7AEA)',
    'linear-gradient(135deg,#B45309,#D97706)',
    'linear-gradient(135deg,#0E7490,#06B6D4)',
    'linear-gradient(135deg,#9D174D,#DB2777)',
  ];

  return (
    <div style={{ minHeight: '100vh', width: '100%', overflowX: 'hidden', fontFamily: "'DM Sans',sans-serif", background: '#F7F6F2', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .fade-up   { animation: fadeUp .5s ease both; }
        .fade-up-1 { animation: fadeUp .5s .08s ease both; }
        .fade-up-2 { animation: fadeUp .5s .16s ease both; }
        .dot-grid  { background-image:radial-gradient(circle,rgba(201,150,58,.13) 1px,transparent 1px);background-size:28px 28px; }
        .add-btn   { display:inline-flex;align-items:center;gap:.5rem;background:linear-gradient(135deg,#C9963A,#E8B85A);color:#0B1D3A;font-weight:700;font-size:.88rem;padding:.7rem 1.3rem;border-radius:11px;border:none;cursor:pointer;box-shadow:0 4px 16px rgba(201,150,58,.3);white-space:nowrap;transition:transform .2s,box-shadow .2s;font-family:'DM Sans',sans-serif; }
        .add-btn:hover { transform:translateY(-1px);box-shadow:0 7px 22px rgba(201,150,58,.4); }
        .back-btn  { display:flex;align-items:center;gap:.4rem;color:#C9963A;background:none;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:600;font-size:.85rem; }
        .back-btn:hover { color:#E8B85A; }
        .action-icon { width:30px;height:30px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;border:none;cursor:pointer;transition:background .18s; }
        .modal-overlay { position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:50;padding:1rem;backdrop-filter:blur(2px); }
        .modal-box { background:#fff;border-radius:20px;box-shadow:0 24px 60px rgba(0,0,0,.2);width:100%;max-width:480px;max-height:90vh;overflow-y:auto;padding:2rem;position:relative;animation:fadeUp .3s ease both; }
        .form-label { display:block;font-size:.7rem;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:.4rem; }
        .form-input { width:100%;padding:.75rem 1rem;font-family:'DM Sans',sans-serif;font-size:.9rem;border:1.5px solid #E2E8F0;border-radius:11px;background:#FAFBFF;color:#0B1D3A;outline:none;transition:border-color .2s,box-shadow .2s;box-sizing:border-box; }
        .form-input:focus { border-color:#C9963A;box-shadow:0 0 0 3px rgba(201,150,58,.12);background:#fff; }
        .form-input::placeholder { color:#A0AEC0; }
        .submit-btn { flex:1;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#C9963A,#E8B85A);color:#0B1D3A;font-weight:700;font-size:.93rem;padding:.9rem;border-radius:11px;border:none;cursor:pointer;box-shadow:0 4px 16px rgba(201,150,58,.3);transition:transform .2s,opacity .2s;font-family:'DM Sans',sans-serif; }
        .submit-btn:hover:not(:disabled) { transform:translateY(-1px); }
        .submit-btn:disabled { opacity:.6;cursor:not-allowed; }
        .cancel-btn { flex:1;background:#F1F5F9;color:#475569;font-weight:600;padding:.9rem;border-radius:11px;border:none;cursor:pointer;font-size:.93rem;font-family:'DM Sans',sans-serif;transition:background .2s; }
        .cancel-btn:hover { background:#E2E8F0; }
        .table-wrap { overflow-x: auto; }
        @media (max-width: 640px) {
          .teachers-table thead { display: none; }
          .teachers-table, .teachers-table tbody, .teachers-table tr, .teachers-table td { display: block; width: 100%; }
          .teachers-table tr { background: #fff; border-radius: 14px; border: 1px solid #F1F5F9; margin-bottom: .75rem; padding: 1rem; }
          .teachers-table td { padding: .3rem 0; border: none; font-size: .87rem; }
          .teachers-table td::before { content: attr(data-label); font-size: .65rem; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: .07em; display: block; margin-bottom: .2rem; }
          .table-wrap { overflow-x: visible; }
          .modal-box { padding: 1.5rem 1.25rem; }
          .form-grid  { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Header */}
      <header className="fade-up" style={{ background: '#0B1D3A', borderBottom: '2px solid rgba(201,150,58,.5)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ padding: '.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => router.back()} className="back-btn"><ArrowLeft size={15} /> Back</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: 'linear-gradient(135deg,#C9963A,#E8B85A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <School size={14} color="#0B1D3A" />
            </div>
            <span style={{ fontFamily: "'Playfair Display',serif", color: '#fff', fontWeight: 700, fontSize: '.88rem' }}>School Platform</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="fade-up-1" style={{ background: '#0B1D3A', position: 'relative', overflow: 'hidden' }}>
        <div className="dot-grid" style={{ position: 'absolute', inset: 0 }} />
        <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,150,58,.15) 0%,transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', padding: '2rem 1.25rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ color: '#64748B', fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 500, marginBottom: '.35rem' }}>Admin Dashboard</p>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.7rem,4vw,2.5rem)', fontWeight: 800, color: '#fff', lineHeight: 1.15 }}>
              Teachers <span style={{ color: '#C9963A' }}>Management</span>
            </h1>
            <p style={{ color: '#64748B', fontSize: '.84rem', marginTop: '.35rem' }}>{teachers.length} teacher{teachers.length !== 1 ? 's' : ''} registered</p>
          </div>
          <button onClick={() => { setShowAddModal(true); setError(''); }} className="add-btn">
            <Plus size={15} /> Add Teacher
          </button>
        </div>
        <div style={{ height: 24, background: 'linear-gradient(to bottom,transparent,#F7F6F2)' }} />
      </div>

      {/* Main */}
      <main className="fade-up-2" style={{ flex: 1, padding: '1.5rem 1.25rem 3rem' }}>

        {error && !showAddModal && !editTeacher && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '.85rem 1rem', borderRadius: 12, marginBottom: '1.25rem', fontSize: '.85rem' }}>
            <X size={14} style={{ flexShrink: 0 }} /> {error}
          </div>
        )}

        {success && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem', background: '#DCFCE7', border: '1px solid #86EFAC', color: '#15803D', padding: '.85rem 1rem', borderRadius: 12, marginBottom: '1.25rem', fontSize: '.85rem', fontWeight: 600 }}>
            ✓ {success}
          </div>
        )}

        {loading ? (
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #F1F5F9', padding: '5rem 1rem', textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(201,150,58,.2)', borderTopColor: '#C9963A', animation: 'spin .8s linear infinite', margin: '0 auto 1rem' }} />
            <p style={{ color: '#94A3B8', fontSize: '.88rem' }}>Loading teachers…</p>
          </div>

        ) : teachers.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #F1F5F9', padding: '5rem 1rem', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <GraduationCap size={28} color="#CBD5E1" />
            </div>
            <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '1rem', marginBottom: '.4rem' }}>No teachers yet</p>
            <p style={{ color: '#94A3B8', fontSize: '.85rem', marginBottom: '1.5rem' }}>Add your first teacher to get started</p>
            <button onClick={() => setShowAddModal(true)} className="add-btn" style={{ margin: '0 auto' }}>
              <Plus size={15} /> Add Teacher
            </button>
          </div>

        ) : (
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #F1F5F9', boxShadow: '0 2px 12px rgba(11,29,58,.05)', overflow: 'hidden' }}>
            <div style={{ padding: '.9rem 1.25rem', borderBottom: '1px solid #F1F5F9', background: '#FAFBFF' }}>
              <span style={{ fontSize: '.72rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.07em' }}>
                {teachers.length} teacher{teachers.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="table-wrap">
              <table className="teachers-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#FAFBFF' }}>
                    {['#', 'Name', 'Email', 'Phone', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '.75rem 1.1rem', textAlign: h === 'Actions' ? 'right' : 'left', fontSize: '.68rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.07em', borderBottom: '1px solid #F1F5F9' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((teacher: any, idx) => (
                    <tr key={teacher.id} style={{ borderBottom: idx < teachers.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                      <td data-label="#" style={{ padding: '.9rem 1.1rem', color: '#CBD5E1', fontWeight: 600, fontSize: '.82rem', width: 40 }}>{idx + 1}</td>
                      <td data-label="Name" style={{ padding: '.9rem 1.1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: avatarColors[idx % avatarColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.75rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                            {teacher.firstName?.[0]}{teacher.lastName?.[0]}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, color: '#0B1D3A', fontSize: '.88rem' }}>{teacher.firstName} {teacher.lastName}</p>
                            <p style={{ color: '#94A3B8', fontSize: '.73rem', marginTop: '.1rem' }}>Teacher</p>
                          </div>
                        </div>
                      </td>
                      <td data-label="Email" style={{ padding: '.9rem 1.1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.45rem' }}>
                          <Mail size={13} color="#CBD5E1" style={{ flexShrink: 0 }} />
                          <span style={{ color: '#64748B', fontSize: '.86rem' }}>{teacher.email}</span>
                        </div>
                      </td>
                      <td data-label="Phone" style={{ padding: '.9rem 1.1rem' }}>
                        {teacher.phone
                          ? <div style={{ display: 'flex', alignItems: 'center', gap: '.45rem' }}>
                              <Phone size={13} color="#CBD5E1" style={{ flexShrink: 0 }} />
                              <span style={{ color: '#64748B', fontSize: '.86rem' }}>{teacher.phone}</span>
                            </div>
                          : <span style={{ color: '#CBD5E1' }}>—</span>}
                      </td>
                      <td data-label="Actions" style={{ padding: '.9rem 1.1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '.5rem' }}>
                          <button className="action-icon" style={{ background: '#EBF4FF', color: '#1A56A0' }}
                            onClick={() => openEdit(teacher)}>
                            <Edit size={13} />
                          </button>
                          <button className="action-icon" style={{ background: '#FEE2E2', color: '#DC2626' }}
                            onClick={() => setDeleteTeacher(teacher)}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ── ADD MODAL ── */}
      {showAddModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setShowAddModal(false); setError(''); } }}>
          <div className="modal-box">
            <button onClick={() => { setShowAddModal(false); setError(''); }}
              style={{ position: 'absolute', top: '1rem', right: '1rem', width: 30, height: 30, borderRadius: '50%', background: '#F1F5F9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={14} color="#64748B" />
            </button>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '1.2rem' }}>Add New Teacher</h2>
              <p style={{ color: '#94A3B8', fontSize: '.83rem', marginTop: '.3rem' }}>Fill in the teacher's details below</p>
            </div>
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '.75rem .9rem', borderRadius: 10, marginBottom: '1rem', fontSize: '.83rem' }}>
                <X size={13} style={{ flexShrink: 0 }} /> {error}
              </div>
            )}
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
                <div>
                  <label className="form-label">First Name *</label>
                  <input name="firstName" value={addForm.firstName} onChange={e => setAddForm(p => ({ ...p, firstName: e.target.value }))} className="form-input" placeholder="e.g. Chidi" required />
                </div>
                <div>
                  <label className="form-label">Last Name *</label>
                  <input name="lastName" value={addForm.lastName} onChange={e => setAddForm(p => ({ ...p, lastName: e.target.value }))} className="form-input" placeholder="e.g. Okeke" required />
                </div>
              </div>
              <div>
                <label className="form-label">Email *</label>
                <input name="email" type="email" value={addForm.email} onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))} className="form-input" placeholder="teacher@school.com" required />
              </div>
              <div>
                <label className="form-label">Phone</label>
                <input name="phone" value={addForm.phone} onChange={e => setAddForm(p => ({ ...p, phone: e.target.value }))} className="form-input" placeholder="e.g. 08012345678" />
              </div>
              <div>
                <label className="form-label">Temporary Password *</label>
                <input name="password" type="password" value={addForm.password} onChange={e => setAddForm(p => ({ ...p, password: e.target.value }))} className="form-input" placeholder="••••••••" required />
                <p style={{ fontSize: '.72rem', color: '#94A3B8', marginTop: '.35rem' }}>⚠ Teacher will be prompted to change this on first login</p>
              </div>
              <div style={{ display: 'flex', gap: '.75rem', paddingTop: '.25rem' }}>
                <button type="submit" disabled={addLoading} className="submit-btn">
                  {addLoading ? <><div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(11,29,58,.2)', borderTopColor: '#0B1D3A', animation: 'spin .6s linear infinite' }} /> Adding…</> : 'Add Teacher'}
                </button>
                <button type="button" onClick={() => { setShowAddModal(false); setError(''); }} className="cancel-btn">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {editTeacher && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setEditTeacher(null); setError(''); } }}>
          <div className="modal-box">
            <button onClick={() => { setEditTeacher(null); setError(''); }}
              style={{ position: 'absolute', top: '1rem', right: '1rem', width: 30, height: 30, borderRadius: '50%', background: '#F1F5F9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={14} color="#64748B" />
            </button>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '1.2rem' }}>Edit Teacher</h2>
              <p style={{ color: '#94A3B8', fontSize: '.83rem', marginTop: '.3rem' }}>Editing {editTeacher.firstName} {editTeacher.lastName}</p>
            </div>
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '.75rem .9rem', borderRadius: 10, marginBottom: '1rem', fontSize: '.83rem' }}>
                <X size={13} style={{ flexShrink: 0 }} /> {error}
              </div>
            )}
            <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
                <div>
                  <label className="form-label">First Name *</label>
                  <input value={editForm.firstName} onChange={e => setEditForm(p => ({ ...p, firstName: e.target.value }))} className="form-input" required />
                </div>
                <div>
                  <label className="form-label">Last Name *</label>
                  <input value={editForm.lastName} onChange={e => setEditForm(p => ({ ...p, lastName: e.target.value }))} className="form-input" required />
                </div>
              </div>
              <div>
                <label className="form-label">Email *</label>
                <input type="email" value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} className="form-input" required />
              </div>
              <div>
                <label className="form-label">Phone</label>
                <input value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} className="form-input" placeholder="e.g. 08012345678" />
              </div>
              <div style={{ display: 'flex', gap: '.75rem', paddingTop: '.25rem' }}>
                <button type="submit" disabled={editLoading} className="submit-btn">
                  {editLoading ? <><div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(11,29,58,.2)', borderTopColor: '#0B1D3A', animation: 'spin .6s linear infinite' }} /> Saving…</> : 'Save Changes'}
                </button>
                <button type="button" onClick={() => { setEditTeacher(null); setError(''); }} className="cancel-btn">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {deleteTeacher && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setDeleteTeacher(null); }}>
          <div className="modal-box" style={{ maxWidth: 400 }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Trash2 size={24} color="#DC2626" />
              </div>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '1.15rem', marginBottom: '.5rem' }}>Delete Teacher?</h2>
              <p style={{ color: '#64748B', fontSize: '.85rem' }}>
                This will permanently remove <strong style={{ color: '#0B1D3A' }}>{deleteTeacher.firstName} {deleteTeacher.lastName}</strong> and all their records. This cannot be undone.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '.75rem' }}>
              <button onClick={handleDelete} disabled={deleteLoading}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.4rem', background: '#DC2626', color: '#fff', fontWeight: 700, fontSize: '.9rem', padding: '.9rem', borderRadius: 11, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", opacity: deleteLoading ? .7 : 1, transition: 'opacity .2s' }}>
                {deleteLoading ? <><div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', animation: 'spin .6s linear infinite' }} /> Deleting…</> : 'Yes, Delete'}
              </button>
              <button onClick={() => setDeleteTeacher(null)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

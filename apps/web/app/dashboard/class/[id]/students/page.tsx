'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plus, Edit, Trash2, X, Search, Users, ArrowLeft, School } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// StudentForm lives OUTSIDE the page component so it never remounts on re-render
// ─────────────────────────────────────────────────────────────────────────────
interface FormData {
  firstName: string; lastName: string; studentId: string; dateOfBirth: string;
  gender: string; parentName: string; parentPhone: string; parentEmail: string;
}

interface StudentFormProps {
  isEdit: boolean;
  formData: FormData;
  className: string;
  error: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onStudentIdChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

function StudentForm({
  isEdit, formData, className, error,
  onChange, onStudentIdChange, onSubmit, onCancel,
}: StudentFormProps) {
  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 px-3.5 py-2.5 rounded-xl text-sm">
          <X className="h-4 w-4 flex-shrink-0" /> {error}
        </div>
      )}

      <div className="section-divider"><span>Student Info</span></div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">First Name *</label>
          <input name="firstName" value={formData.firstName} onChange={onChange}
            className="form-input" placeholder="e.g. Amina" required />
        </div>
        <div>
          <label className="form-label">Last Name *</label>
          <input name="lastName" value={formData.lastName} onChange={onChange}
            className="form-input" placeholder="e.g. Bello" required />
        </div>
      </div>

      <div>
        <label className="form-label">Student ID *</label>
        <input name="studentId" value={formData.studentId} onChange={onStudentIdChange}
          placeholder="e.g. STD-2026-001" className="form-input" required maxLength={17} />
        <p className="text-xs text-slate-400 mt-1">Format: AAA-BBB-CCC (hyphens added automatically, uppercase)</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">Date of Birth</label>
          <input type="date" name="dateOfBirth" value={formData.dateOfBirth}
            onChange={onChange} className="form-input" />
        </div>
        <div>
          <label className="form-label">Gender</label>
          <select name="gender" value={formData.gender} onChange={onChange} className="form-input">
            <option value="">Select</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label className="form-label">Class</label>
        <input value={className} readOnly className="form-input"
          style={{ background: '#F1F5F9', color: '#94A3B8', cursor: 'not-allowed' }} />
      </div>

      <div className="section-divider"><span>Parent / Guardian</span></div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">Parent Name</label>
          <input name="parentName" value={formData.parentName} onChange={onChange}
            placeholder="Full name" className="form-input" />
        </div>
        <div>
          <label className="form-label">Parent Phone</label>
          <input name="parentPhone" value={formData.parentPhone} onChange={onChange}
            placeholder="e.g. 08012345678" className="form-input" />
        </div>
      </div>

      <div>
        <label className="form-label">
          Parent Email{' '}
          <span style={{ color: '#CBD5E1', fontWeight: 400, textTransform: 'none' }}>(optional)</span>
        </label>
        <input name="parentEmail" value={formData.parentEmail} onChange={onChange}
          placeholder="parent@example.com" className="form-input" />
      </div>

      <div className="flex gap-3 pt-1">
        <button type="submit" className="submit-btn">
          {isEdit ? 'Update Student' : 'Add Student'}
        </button>
        <button type="button" onClick={onCancel} className="cancel-btn">Cancel</button>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page component
// ─────────────────────────────────────────────────────────────────────────────
export default function ClassStudentsPage() {
  const router = useRouter();
  const { id } = useParams();

  const [students, setStudents] = useState<any[]>([]);
  const [className, setClassName] = useState('Loading...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const emptyForm: FormData = {
    firstName: '', lastName: '', studentId: '', dateOfBirth: '',
    gender: '', parentName: '', parentPhone: '', parentEmail: '',
  };
  const [formData, setFormData] = useState<FormData>(emptyForm);

  const filteredStudents = students.filter(s => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return `${s.firstName} ${s.lastName}`.toLowerCase().includes(q)
      || s.studentId?.toLowerCase().includes(q);
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/classes/${id}/students`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => { if (!res.ok) throw new Error('Failed to load class data'); return res.json(); })
      .then(data => {
        setClassName(data.class?.name || 'Unknown Class');
        setStudents(data.students || []);
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [router, id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/-/g, '');
    const formatted = raw.match(/.{1,3}/g)?.join('-') || raw;
    setFormData(prev => ({ ...prev, studentId: formatted.toUpperCase() }));
  };

  const openAddModal = () => {
    setFormData(emptyForm);
    setError('');
    setShowAddModal(true);
    setShowEditModal(false);
  };

  const openEditModal = (student: any) => {
    setSelectedStudent(student);
    setFormData({
      firstName:   student.firstName,
      lastName:    student.lastName,
      studentId:   student.studentId,
      dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
      gender:      student.gender || '',
      parentName:  student.parent?.name  || '',
      parentPhone: student.parent?.phone || '',
      parentEmail: student.parent?.email || '',
    });
    setError('');
    setShowEditModal(true);
    setShowAddModal(false);
  };

  const closeModals = () => { setShowAddModal(false); setShowEditModal(false); setError(''); };

  const flash = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(''), 4000); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const isEdit = showEditModal;
    const token = localStorage.getItem('token');
    const url = isEdit
      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/students/${selectedStudent.id}`
: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/students`;    try {
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...formData, className, dateOfBirth: formData.dateOfBirth || null }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to ${isEdit ? 'update' : 'add'} student`);
      }
      const result = await res.json();
      if (isEdit) {
        setStudents(prev => prev.map(s => s.id === result.id ? result : s));
        setShowEditModal(false);
        flash('Student updated successfully!');
      } else {
        setStudents(prev => [...prev, result]);
        setShowAddModal(false);
        flash('Student added successfully!');
      }
      setFormData(emptyForm);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!selectedStudent) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/students/${selectedStudent.id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete student');
      setStudents(prev => prev.filter(s => s.id !== selectedStudent.id));
      setShowDeleteConfirm(false);
      setSelectedStudent(null);
      flash('Student removed from class.');
    } catch (err: any) {
      setError(err.message);
    }
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
    <div className="min-h-screen w-screen" style={{ fontFamily: "'DM Sans', sans-serif", background: '#F7F6F2' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        .display { font-family: 'Playfair Display', serif; }

        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }

        .fade-up   { animation: fadeUp .5s ease both; }
        .fade-up-1 { animation: fadeUp .5s .08s ease both; }
        .fade-up-2 { animation: fadeUp .5s .16s ease both; }

        .hero-dot-grid {
          background-image: radial-gradient(circle, rgba(201,150,58,.13) 1px, transparent 1px);
          background-size: 30px 30px;
        }

        .search-input {
          width: 100%; padding: .75rem .9rem .75rem 2.6rem;
          font-family: 'DM Sans', sans-serif; font-size: .88rem;
          border: 1.5px solid #E2E8F0; border-radius: 11px;
          background: #fff; color: #0B1D3A; outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        .search-input:focus { border-color: #C9963A; box-shadow: 0 0 0 3px rgba(201,150,58,.12); }
        .search-input::placeholder { color: #A0AEC0; }

        .add-btn {
          display: inline-flex; align-items: center; gap: .5rem;
          background: linear-gradient(135deg, #C9963A 0%, #E8B85A 100%);
          color: #0B1D3A; font-weight: 700; font-size: .88rem;
          padding: .75rem 1.4rem; border-radius: 11px; border: none; cursor: pointer;
          box-shadow: 0 4px 16px rgba(201,150,58,.3); white-space: nowrap;
          transition: transform .2s, box-shadow .2s;
        }
        .add-btn:hover { transform: translateY(-1px); box-shadow: 0 7px 22px rgba(201,150,58,.4); }

        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th {
          padding: .75rem 1.2rem; text-align: left;
          font-size: .7rem; font-weight: 600; color: #94A3B8;
          text-transform: uppercase; letter-spacing: .07em;
          border-bottom: 1px solid #E2E8F0; background: #FAFBFF;
        }
        .data-table td {
          padding: .9rem 1.2rem; font-size: .88rem;
          color: #334155; border-bottom: 1px solid #F1F5F9;
        }
        .data-table tr:last-child td { border-bottom: none; }
        .data-table tbody tr:hover td { background: #F7F6F2; }

        .action-icon {
          width: 30px; height: 30px; border-radius: 8px;
          display: inline-flex; align-items: center; justify-content: center;
          border: none; cursor: pointer; transition: background .18s;
        }

        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,.55);
          display: flex; align-items: center; justify-content: center;
          z-index: 50; padding: 1rem; backdrop-filter: blur(2px);
        }
        .modal-box {
          background: #fff; border-radius: 20px;
          box-shadow: 0 24px 60px rgba(0,0,0,.2);
          width: 100%; max-width: 540px; max-height: 90vh; overflow-y: auto;
          padding: 2rem; position: relative;
          animation: fadeUp .3s ease both;
        }

        .form-label {
          display: block; font-size: .72rem; font-weight: 600;
          color: #94A3B8; text-transform: uppercase; letter-spacing: .06em; margin-bottom: .4rem;
        }
        .form-input {
          width: 100%; padding: .75rem 1rem; box-sizing: border-box;
          font-family: 'DM Sans', sans-serif; font-size: .9rem;
          border: 1.5px solid #E2E8F0; border-radius: 11px;
          background: #FAFBFF; color: #0B1D3A; outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        .form-input:focus { border-color: #C9963A; box-shadow: 0 0 0 3px rgba(201,150,58,.12); background: #fff; }
        .form-input::placeholder { color: #A0AEC0; }

        .submit-btn {
          flex: 1; display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #C9963A, #E8B85A);
          color: #0B1D3A; font-weight: 700; font-size: .93rem;
          padding: .9rem; border-radius: 11px; border: none; cursor: pointer;
          box-shadow: 0 4px 16px rgba(201,150,58,.3);
          transition: transform .2s, box-shadow .2s;
        }
        .submit-btn:hover { transform: translateY(-1px); box-shadow: 0 7px 22px rgba(201,150,58,.4); }
        .cancel-btn {
          flex: 1; display: flex; align-items: center; justify-content: center;
          background: #F1F5F9; color: #475569; font-weight: 600;
          padding: .9rem; border-radius: 11px; border: none; cursor: pointer;
          font-size: .93rem; font-family: 'DM Sans', sans-serif; transition: background .2s;
        }
        .cancel-btn:hover { background: #E2E8F0; }

        .section-divider {
          display: flex; align-items: center; gap: .75rem; margin: .25rem 0;
        }
        .section-divider span {
          font-size: .68rem; font-weight: 700; color: #CBD5E1;
          text-transform: uppercase; letter-spacing: .08em; white-space: nowrap;
        }
        .section-divider::before, .section-divider::after {
          content: ''; flex: 1; height: 1px; background: #E2E8F0;
        }
      `}</style>

      {/* ── Header ── */}
      <header className="sticky top-0 z-10 fade-up" style={{ background: '#0B1D3A', borderBottom: '2px solid #C9963A' }}>
        <div className="w-full px-6 py-3.5 flex items-center justify-between">
          <button onClick={() => router.back()}
            className="flex items-center gap-2 text-[#C9963A] hover:text-[#E8B85A] font-semibold text-sm transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #C9963A, #E8B85A)' }}>
              <School className="h-3.5 w-3.5 text-[#0B1D3A]" />
            </div>
            <span className="display text-white font-bold text-sm">School Platform</span>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <div className="relative overflow-hidden fade-up-1" style={{ background: '#0B1D3A' }}>
        <div className="absolute inset-0 hero-dot-grid" />
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(201,150,58,.15) 0%, transparent 65%)' }} />
        <div className="relative w-full px-6 py-8 flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider font-medium">Class Roster</p>
            <h1 className="display text-3xl md:text-4xl font-bold text-white leading-tight">
              Students in <span style={{ color: '#C9963A' }}>{className}</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {students.length} student{students.length !== 1 ? 's' : ''} enrolled
            </p>
          </div>
          <button onClick={openAddModal} className="add-btn">
            <Plus className="h-4 w-4" /> Add Student
          </button>
        </div>
      </div>

      {/* ── Main ── */}
      <div className="w-full px-6 py-8 fade-up-2">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name or ID…" className="search-input" />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="text-slate-400 text-sm">
            Showing <span className="font-semibold text-[#0B1D3A]">{filteredStudents.length}</span> of{' '}
            <span className="font-semibold text-[#0B1D3A]">{students.length}</span> students
          </p>
        </div>

        {/* Alerts */}
        {success && (
          <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mb-5 text-sm font-medium">
            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs flex-shrink-0">✓</span>
            {success}
          </div>
        )}
        {error && !showAddModal && !showEditModal && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm">
            <X className="h-4 w-4 flex-shrink-0" /> {error}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-20 text-center shadow-sm">
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(201,150,58,.2)', borderTopColor: '#C9963A', animation: 'spin .8s linear infinite', margin: '0 auto 1rem' }} />
            <p className="text-slate-400 text-sm">Loading students…</p>
          </div>

        ) : filteredStudents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-20 text-center shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Users className="h-7 w-7 text-slate-300" />
            </div>
            <p className="text-[#0B1D3A] font-semibold text-base mb-1">
              {searchQuery ? 'No matching students' : 'No students yet'}
            </p>
            <p className="text-slate-400 text-sm mb-6">
              {searchQuery ? 'Try a different search term' : `Add the first student to ${className}`}
            </p>
            {!searchQuery && (
              <button onClick={openAddModal} className="add-btn mx-auto">
                <Plus className="h-4 w-4" /> Add Student
              </button>
            )}
          </div>

        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
                {searchQuery && ` matching "${searchQuery}"`}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Student ID</th>
                    <th>Gender</th>
                    <th>Parent</th>
                    <th>Parent Phone</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student: any, idx) => (
                    <tr key={student.id}>
                      <td className="text-slate-300 font-medium w-10">{idx + 1}</td>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ background: avatarColors[idx % avatarColors.length] }}>
                            {student.firstName?.[0]}{student.lastName?.[0]}
                          </div>
                          <span className="font-semibold text-[#0B1D3A] text-sm">
                            {student.firstName} {student.lastName}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                          {student.studentId}
                        </span>
                      </td>
                      <td>
                        {student.gender ? (
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            student.gender === 'MALE'   ? 'bg-blue-50 text-blue-700'
                            : student.gender === 'FEMALE' ? 'bg-pink-50 text-pink-700'
                            : 'bg-slate-100 text-slate-600'
                          }`}>{student.gender}</span>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="text-slate-600 text-sm">
                        {student.parent?.name || <span className="text-slate-300">—</span>}
                      </td>
                      <td className="text-slate-500 text-sm">
                        {student.parent?.phone || <span className="text-slate-300">—</span>}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => openEditModal(student)}
                            className="action-icon bg-blue-50 hover:bg-blue-100 text-[#1A56A0]">
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => { setSelectedStudent(student); setShowDeleteConfirm(true); }}
                            className="action-icon bg-red-50 hover:bg-red-100 text-red-500">
                            <Trash2 className="h-3.5 w-3.5" />
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
      </div>

      {/* ── Add Modal ── */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <button onClick={closeModals}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
              <X className="h-4 w-4 text-slate-500" />
            </button>
            <div className="mb-5">
              <h2 className="display text-xl font-bold text-[#0B1D3A]">Add New Student</h2>
              <p className="text-slate-400 text-sm mt-0.5">
                Adding to <span className="font-semibold text-[#0B1D3A]">{className}</span>
              </p>
            </div>
            <StudentForm
              isEdit={false}
              formData={formData}
              className={className}
              error={error}
              onChange={handleInputChange}
              onStudentIdChange={handleStudentIdChange}
              onSubmit={handleSubmit}
              onCancel={closeModals}
            />
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {showEditModal && selectedStudent && (
        <div className="modal-overlay">
          <div className="modal-box">
            <button onClick={closeModals}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
              <X className="h-4 w-4 text-slate-500" />
            </button>
            <div className="mb-5">
              <h2 className="display text-xl font-bold text-[#0B1D3A]">Edit Student</h2>
              <p className="text-slate-400 text-sm mt-0.5">
                Editing <span className="font-semibold text-[#0B1D3A]">{selectedStudent.firstName} {selectedStudent.lastName}</span>
              </p>
            </div>
            <StudentForm
              isEdit={true}
              formData={formData}
              className={className}
              error={error}
              onChange={handleInputChange}
              onStudentIdChange={handleStudentIdChange}
              onSubmit={handleSubmit}
              onCancel={closeModals}
            />
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {showDeleteConfirm && selectedStudent && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 420 }}>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-7 w-7 text-red-400" />
              </div>
              <h2 className="display text-xl font-bold text-[#0B1D3A] mb-2">Delete Student?</h2>
              <p className="text-slate-500 text-sm">
                This will permanently remove{' '}
                <span className="font-semibold text-[#0B1D3A]">
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </span>{' '}
                and all their records. This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl border-none cursor-pointer transition-colors text-sm"
                style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Yes, Delete
              </button>
              <button onClick={() => { setShowDeleteConfirm(false); setSelectedStudent(null); }} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

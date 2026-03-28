'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, School, CheckCircle, AlertCircle,
  DollarSign, Users, TrendingUp, X, Plus, Search,
  Building2, CreditCard, Save, Pencil, MessageSquare, Send, BellRing
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type FeeStatus = {
  id?: string; studentId: string; studentName: string; term: string;
  amountDue: number; amountPaid: number; status: 'Paid' | 'Partial' | 'Unpaid'; lastPaymentDate: string | null;
};
type BankDetails = { bankName: string; accountNumber: string; accountName: string; };

const TERMS = ['Term 1', 'Term 2', 'Term 3'];
const CURRENT_YEAR = '2026';

export default function FeesManagementPage() {
  const router = useRouter();
  const [classes, setClasses]             = useState<{ id: string; name: string }[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm]   = useState('Term 1');
  const [feeData, setFeeData]             = useState<FeeStatus[]>([]);
  const [loading, setLoading]             = useState(false);
  const [saving, setSaving]               = useState<string | null>(null);
  const [search, setSearch]               = useState('');
  const [bulkAmount, setBulkAmount]       = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [successMsg, setSuccessMsg]       = useState('');
  const [error, setError]                 = useState('');
  const [payModal, setPayModal]           = useState<{ student: FeeStatus; amount: string } | null>(null);
  const [sendingReminder, setSendingReminder]     = useState<string | null>(null);
  const [reminderSuccess, setReminderSuccess]     = useState<string | null>(null);
  const [showBulkReminder, setShowBulkReminder]   = useState(false);
  const [sendingBulkReminder, setSendingBulkReminder] = useState(false);
  const [bank, setBank]           = useState<BankDetails>({ bankName: '', accountNumber: '', accountName: '' });
  const [bankEdit, setBankEdit]   = useState<BankDetails>({ bankName: '', accountNumber: '', accountName: '' });
  const [editingBank, setEditingBank] = useState(false);
  const [savingBank, setSavingBank]   = useState(false);
  const [bankSaved, setBankSaved]     = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/school-login'); return; }
    fetch(`${API}/classes`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => { const list = Array.isArray(data) ? data : data?.classes ?? []; setClasses(list); if (list.length > 0) setSelectedClass(list[0].id); })
      .catch(() => setError('Failed to load classes'));
    fetch(`${API}/schools/bank-details`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null).then(data => { if (data) { setBank(data); setBankEdit(data); setBankSaved(true); } }).catch(() => {});
  }, [router]);

  useEffect(() => { if (!selectedClass) return; loadFees(); }, [selectedClass, selectedTerm]);

  const loadFees = async () => {
    setLoading(true); setError('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/fees?classId=${selectedClass}&term=${encodeURIComponent(selectedTerm + ' ' + CURRENT_YEAR)}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load fees');
      const data = await res.json();
      setFeeData(Array.isArray(data) ? data : data?.fees ?? []);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const saveBank = async () => {
    if (!bankEdit.bankName || !bankEdit.accountNumber || !bankEdit.accountName) { setError('Please fill in all bank fields'); return; }
    setSavingBank(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/schools/bank-details`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(bankEdit) });
      if (!res.ok) throw new Error('Failed to save bank details');
      setBank(bankEdit); setEditingBank(false); setBankSaved(true);
      setSuccessMsg('Bank details saved successfully'); setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) { setError(err.message); } finally { setSavingBank(false); }
  };

  const recordPayment = async () => {
    if (!payModal) return;
    const token = localStorage.getItem('token');
    setSaving(payModal.student.studentId);
    try {
      const amount = parseFloat(payModal.amount);
      if (isNaN(amount) || amount <= 0) throw new Error('Invalid amount');
      const newPaid = payModal.student.amountPaid + amount;
      const newStatus: 'Paid' | 'Partial' | 'Unpaid' = newPaid >= payModal.student.amountDue ? 'Paid' : newPaid > 0 ? 'Partial' : 'Unpaid';
      const res = await fetch(`${API}/fees/${payModal.student.studentId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ term: selectedTerm + ' ' + CURRENT_YEAR, amountDue: payModal.student.amountDue, amountPaid: newPaid, status: newStatus, lastPaymentDate: new Date().toISOString() }) });
      if (!res.ok) throw new Error('Failed to save payment');
      setFeeData(prev => prev.map(s => s.studentId === payModal.student.studentId ? { ...s, amountPaid: newPaid, status: newStatus, lastPaymentDate: new Date().toISOString() } : s));
      setPayModal(null); setSuccessMsg('Payment recorded successfully'); setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) { setError(err.message); } finally { setSaving(null); }
  };

  const sendReminder = async (student: FeeStatus) => {
    setSendingReminder(student.studentId);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/sms/send-fee-reminder`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ studentId: student.studentId, studentName: student.studentName, amountDue: student.amountDue, amountPaid: student.amountPaid, balance: student.amountDue - student.amountPaid, term: selectedTerm + ' ' + CURRENT_YEAR, className: selectedClassName }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send reminder');
      setReminderSuccess(student.studentId); setTimeout(() => setReminderSuccess(null), 4000);
    } catch (err: any) { setError(err.message); } finally { setSendingReminder(null); }
  };

  const sendBulkReminder = async () => {
    setSendingBulkReminder(true);
    const token = localStorage.getItem('token');
    try {
      const unpaidStudents = feeData.filter(f => f.status !== 'Paid');
      const res = await fetch(`${API}/sms/send-fee-reminder/bulk`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ students: unpaidStudents.map(s => ({ studentId: s.studentId, studentName: s.studentName, amountDue: s.amountDue, amountPaid: s.amountPaid, balance: s.amountDue - s.amountPaid })), term: selectedTerm + ' ' + CURRENT_YEAR, className: selectedClassName }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send reminders');
      setShowBulkReminder(false); setSuccessMsg(`✓ Reminders sent to ${data.sent ?? unpaidStudents.filter(f => f.status !== 'Paid').length} parents`); setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) { setError(err.message); } finally { setSendingBulkReminder(false); }
  };

  const applyBulkAmount = async () => {
    const amount = parseFloat(bulkAmount);
    if (isNaN(amount) || amount <= 0) return;
    const token = localStorage.getItem('token');
    setSaving('bulk');
    try {
      const res = await fetch(`${API}/fees/bulk`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ classId: selectedClass, term: selectedTerm + ' ' + CURRENT_YEAR, amountDue: amount }) });
      if (!res.ok) throw new Error('Failed to set fee amounts');
      await loadFees(); setShowBulkModal(false); setBulkAmount('');
      setSuccessMsg(`Fee set to ₦${amount.toLocaleString()} for all students`); setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) { setError(err.message); } finally { setSaving(null); }
  };

  const filtered        = feeData.filter(s => s.studentName.toLowerCase().includes(search.toLowerCase()));
  const totalDue        = feeData.reduce((s, f) => s + f.amountDue, 0);
  const totalPaid       = feeData.reduce((s, f) => s + f.amountPaid, 0);
  const totalOwed       = totalDue - totalPaid;
  const paidCount       = feeData.filter(f => f.status === 'Paid').length;
  const partialCount    = feeData.filter(f => f.status === 'Partial').length;
  const unpaidCount     = feeData.filter(f => f.status === 'Unpaid').length;
  const collectionRate  = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;
  const selectedClassName = classes.find(c => c.id === selectedClass)?.name ?? '';

  const sp = (n: string) => ({ width: n, height: n, borderRadius: '50%', border: '2px solid rgba(255,255,255,.25)', borderTopColor: '#fff', animation: 'spin .6s linear infinite', flexShrink: 0 } as React.CSSProperties);

  return (
    <div style={{ minHeight: '100vh', width: '100%', overflowX: 'hidden', fontFamily: "'DM Sans',sans-serif", background: '#F0EFE9', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer   { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes spin      { to{transform:rotate(360deg)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .fade-up   { animation: fadeUp .5s ease both; }
        .fade-up-1 { animation: fadeUp .5s .08s ease both; }
        .fade-up-2 { animation: fadeUp .5s .16s ease both; }
        ${Array.from({length:30},(_,i)=>`.row-${i}{animation:fadeUp .4s ${.2+i*.04}s ease both;}`).join('')}
        .gold-shimmer { background:linear-gradient(90deg,#C9963A 0%,#F0C060 40%,#C9963A 60%,#E8B85A 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 4s linear infinite; }
        .dot-grid { background-image:radial-gradient(circle,rgba(201,150,58,.13) 1px,transparent 1px);background-size:28px 28px; }
        .back-btn { display:flex;align-items:center;gap:.4rem;color:#C9963A;background:none;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:600;font-size:.85rem; }
        .stat-card { background:#fff;border:1px solid #E2E8F0;border-radius:16px;padding:1.1rem 1.25rem;display:flex;align-items:center;gap:.9rem;box-shadow:0 2px 12px rgba(11,29,58,.06);flex:1;min-width:140px; }
        .select-pill { appearance:none;background:#fff;border:1.5px solid #E2E8F0;border-radius:12px;padding:.6rem 2.2rem .6rem 1rem;font-family:'DM Sans',sans-serif;font-size:.85rem;font-weight:600;color:#0B1D3A;cursor:pointer;outline:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right .75rem center;max-width:100%; }
        .term-btn { padding:.5rem .9rem;border-radius:10px;border:1.5px solid #E2E8F0;font-family:'DM Sans',sans-serif;font-size:.8rem;font-weight:600;cursor:pointer;transition:all .15s;background:#fff;color:#64748B;white-space:nowrap; }
        .term-btn.active { background:#0B1D3A;color:#fff;border-color:#0B1D3A; }
        .term-btn:not(.active):hover { border-color:#C9963A;color:#C9963A; }
        .main-card { background:#fff;border:1px solid #E2E8F0;border-radius:20px;box-shadow:0 4px 22px rgba(11,29,58,.07);overflow:hidden; }
        .fees-table { width:100%;border-collapse:collapse;min-width:650px; }
        .fees-table thead th { padding:.75rem 1rem;text-align:left;font-size:.67rem;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:.08em;background:#FAFAF8;border-bottom:1px solid #F1F5F9; }
        .fees-table tbody tr { border-bottom:1px solid #F8FAFC;transition:background .15s; }
        .fees-table tbody tr:last-child { border-bottom:none; }
        .fees-table tbody tr:hover { background:#FAFAF8; }
        .fees-table tbody td { padding:.8rem 1rem;vertical-align:middle; }
        .status-pill { display:inline-flex;align-items:center;gap:.3rem;padding:.25rem .7rem;border-radius:20px;font-size:.72rem;font-weight:700; }
        .pay-btn { display:inline-flex;align-items:center;gap:.3rem;padding:.42rem .85rem;border-radius:9px;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:.76rem;font-weight:700;background:linear-gradient(135deg,#0B1D3A,#1A3A6A);color:#fff;transition:transform .15s; }
        .pay-btn:hover { transform:translateY(-1px); }
        .pay-btn:disabled { opacity:.5;cursor:not-allowed;transform:none; }
        .bulk-btn { display:inline-flex;align-items:center;gap:.4rem;padding:.6rem 1.1rem;border-radius:11px;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:.8rem;font-weight:700;background:linear-gradient(135deg,#C9963A,#E8B85A);color:#0B1D3A;box-shadow:0 3px 14px rgba(201,150,58,.3);white-space:nowrap; }
        .sms-bulk-btn { display:inline-flex;align-items:center;gap:.4rem;padding:.6rem 1.1rem;border-radius:11px;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:.8rem;font-weight:700;background:linear-gradient(135deg,#1A56A0,#2563EB);color:#fff;box-shadow:0 3px 14px rgba(26,86,160,.3);white-space:nowrap; }
        .progress-bar-bg  { height:7px;background:#E2E8F0;border-radius:99px;overflow:hidden;flex:1; }
        .progress-bar-fill{ height:100%;border-radius:99px;transition:width .6s ease; }
        .modal-overlay { position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:50;padding:1rem;backdrop-filter:blur(3px); }
        .modal-box { background:#fff;border-radius:20px;padding:1.75rem;width:100%;max-width:420px;box-shadow:0 24px 60px rgba(0,0,0,.2);animation:slideDown .25s ease both; }
        .modal-input { width:100%;padding:.8rem 1rem;border:1.5px solid #E2E8F0;border-radius:11px;font-family:'DM Sans',sans-serif;font-size:.95rem;color:#0B1D3A;background:#FAFAF8;outline:none;transition:border-color .2s;box-sizing:border-box; }
        .modal-input:focus { border-color:#C9963A;box-shadow:0 0 0 3px rgba(201,150,58,.12);background:#fff; }
        .modal-submit { width:100%;padding:.88rem;border:none;border-radius:12px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:.93rem;font-weight:700;background:linear-gradient(135deg,#C9963A,#E8B85A);color:#0B1D3A;box-shadow:0 4px 16px rgba(201,150,58,.3); }
        .modal-submit:disabled { opacity:.6;cursor:not-allowed; }
        .modal-cancel { width:100%;padding:.83rem;border:none;border-radius:12px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:.9rem;font-weight:600;background:#F1F5F9;color:#475569; }
        .modal-cancel:hover { background:#E2E8F0; }
        .alert-s { display:flex;align-items:center;gap:.65rem;background:#DCFCE7;border:1px solid #86EFAC;color:#15803D;padding:.8rem 1rem;border-radius:13px;font-size:.84rem;font-weight:600;animation:slideDown .3s ease both; }
        .alert-e { display:flex;align-items:center;gap:.65rem;background:#FEE2E2;border:1px solid #FCA5A5;color:#B91C1C;padding:.8rem 1rem;border-radius:13px;font-size:.84rem;font-weight:600;animation:slideDown .3s ease both; }
        .bank-field-input { width:100%;padding:.75rem 1rem;border:1.5px solid #E2E8F0;border-radius:11px;font-family:'DM Sans',sans-serif;font-size:.88rem;color:#0B1D3A;background:#FAFAF8;outline:none;transition:border-color .2s;box-sizing:border-box; }
        .bank-field-input:focus { border-color:#C9963A;box-shadow:0 0 0 3px rgba(201,150,58,.12);background:#fff; }
        .bank-field-input::placeholder { color:#CBD5E1; }
        .sms-row-btn { display:inline-flex;align-items:center;gap:.3rem;padding:.36rem .7rem;border-radius:8px;border:1.5px solid rgba(26,86,160,.25);background:#EBF4FF;color:#1A56A0;font-size:.73rem;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .15s; }
        .sms-row-btn:hover { background:#1A56A0;color:#fff;border-color:#1A56A0; }
        .sms-row-btn:disabled { opacity:.6;cursor:not-allowed; }

        /* Mobile */
        .stats-grid { display:flex;gap:.85rem;flex-wrap:wrap; }
        .controls-row { display:flex;align-items:flex-start;gap:.85rem;flex-wrap:wrap; }
        .controls-actions { display:flex;gap:.65rem;flex-wrap:wrap;align-items:center; }
        .bank-grid { display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:.9rem; }
        @media(max-width:640px) {
          .stat-card { min-width:calc(50% - .5rem); }
          .modal-box { padding:1.5rem 1.1rem; }
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
        <div style={{ position: 'absolute', top: -80, right: -40, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,150,58,.13) 0%,transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', padding: '2rem 1.25rem .75rem' }}>
          <p style={{ color: '#64748B', fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 500, marginBottom: '.4rem' }}>Admin · {CURRENT_YEAR}</p>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.5rem,3vw,2.1rem)', fontWeight: 800, color: '#fff', lineHeight: 1.15 }}>
            <span className="gold-shimmer">School Fees</span> Management
          </h1>
          <p style={{ color: '#64748B', fontSize: '.83rem', marginTop: '.4rem' }}>Track payments, send SMS reminders, manage bank details.</p>
        </div>
        <div style={{ height: 22, background: 'linear-gradient(to bottom,transparent,#F0EFE9)' }} />
      </div>

      <main className="fade-up-2" style={{ flex: 1, padding: '1.5rem 1.25rem 3rem' }}>

        {successMsg && <div className="alert-s" style={{ marginBottom: '1.1rem' }}><CheckCircle size={15} />{successMsg}</div>}
        {error && (
          <div className="alert-e" style={{ marginBottom: '1.1rem' }}>
            <AlertCircle size={15} />{error}
            <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', lineHeight: 0 }}><X size={13} /></button>
          </div>
        )}

        {/* Bank Details */}
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 22px rgba(11,29,58,.07)', marginBottom: '1.5rem' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FAFAL8', flexWrap: 'wrap', gap: '.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: '#EBF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={16} color="#1A56A0" />
              </div>
              <div>
                <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '.92rem', margin: 0 }}>School Bank Details</p>
                <p style={{ color: '#94A3B8', fontSize: '.7rem', margin: 0 }}>Parents see this when paying fees</p>
              </div>
            </div>
            {bankSaved && !editingBank && (
              <button onClick={() => { setEditingBank(true); setBankEdit(bank); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem', padding: '.45rem .9rem', borderRadius: 9, border: '1.5px solid #E2E8F0', background: '#fff', fontFamily: "'DM Sans',sans-serif", fontSize: '.78rem', fontWeight: 600, color: '#64748B', cursor: 'pointer' }}>
                <Pencil size={11} /> Edit
              </button>
            )}
          </div>
          <div style={{ padding: '1.1rem 1.25rem' }}>
            {!editingBank && bankSaved ? (
              <div>
                {[{ label: 'Bank Name', value: bank.bankName, icon: Building2 }, { label: 'Account Number', value: bank.accountNumber, icon: CreditCard }, { label: 'Account Name', value: bank.accountName, icon: School }].map(({ label, value, icon: Icon }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.55rem 0', borderBottom: '1px solid #F8FAFC' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={12} color="#64748B" /></div>
                      <span style={{ fontSize: '.75rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: '#0B1D3A', fontSize: '.87rem' }}>{value}</span>
                  </div>
                ))}
                <div style={{ marginTop: '.85rem', padding: '.65rem .9rem', background: '#DCFCE7', borderRadius: 11, border: '1px solid #86EFAC', display: 'flex', alignItems: 'center', gap: '.45rem' }}>
                  <CheckCircle size={13} color="#15803D" />
                  <p style={{ color: '#15803D', fontSize: '.78rem', fontWeight: 600, margin: 0 }}>Saved — parents can see this</p>
                </div>
              </div>
            ) : (
              <div>
                {!bankSaved && <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 11, padding: '.65rem .9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '.45rem' }}><AlertCircle size={13} color="#B45309" /><p style={{ color: '#B45309', fontSize: '.78rem', fontWeight: 600, margin: 0 }}>No bank details yet</p></div>}
                <div className="bank-grid" style={{ marginBottom: '1rem' }}>
                  {[{ label: 'Bank Name', key: 'bankName', placeholder: 'e.g. First Bank of Nigeria' }, { label: 'Account Number', key: 'accountNumber', placeholder: 'e.g. 0123456789', max: 10 }, { label: 'Account Name', key: 'accountName', placeholder: 'e.g. Greenfield Academy Ltd' }].map(({ label, key, placeholder, max }) => (
                    <div key={key}>
                      <label style={{ display: 'block', fontSize: '.68rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '.3rem' }}>{label}</label>
                      <input value={(bankEdit as any)[key]} onChange={e => setBankEdit(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} className="bank-field-input" maxLength={max} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '.65rem', flexWrap: 'wrap' }}>
                  <button onClick={saveBank} disabled={savingBank} style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', padding: '.55rem 1.1rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: '.8rem', fontWeight: 700, background: 'linear-gradient(135deg,#0B1D3A,#1A3A6A)', color: '#fff', opacity: savingBank ? .65 : 1 }}>
                    {savingBank ? <><div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', animation: 'spin .6s linear infinite' }} />Saving…</> : <><Save size={12} />Save Bank Details</>}
                  </button>
                  {editingBank && <button onClick={() => { setEditingBank(false); setBankEdit(bank); }} style={{ padding: '.55rem 1rem', borderRadius: 10, border: '1.5px solid #E2E8F0', background: '#fff', fontFamily: "'DM Sans',sans-serif", fontSize: '.8rem', fontWeight: 600, color: '#64748B', cursor: 'pointer' }}>Cancel</button>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="controls-row" style={{ marginBottom: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '.67rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.3rem' }}>Class</label>
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="select-pill">
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '.67rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.3rem' }}>Term</label>
            <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
              {TERMS.map(t => <button key={t} onClick={() => setSelectedTerm(t)} className={`term-btn ${selectedTerm === t ? 'active' : ''}`}>{t}</button>)}
            </div>
          </div>
          <div className="controls-actions" style={{ marginLeft: 'auto' }}>
            <button onClick={() => setShowBulkModal(true)} className="bulk-btn"><DollarSign size={13} />Set Fee Amount</button>
            {(unpaidCount + partialCount) > 0 && <button onClick={() => setShowBulkReminder(true)} className="sms-bulk-btn"><BellRing size={13} />Reminders ({unpaidCount + partialCount})</button>}
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
          {[
            { label: 'Total Due',       value: `₦${totalDue.toLocaleString()}`,  icon: DollarSign,  color: '#1A56A0', bg: '#EBF4FF' },
            { label: 'Total Collected', value: `₦${totalPaid.toLocaleString()}`, icon: TrendingUp,  color: '#059669', bg: '#DCFCE7' },
            { label: 'Outstanding',     value: `₦${totalOwed.toLocaleString()}`, icon: AlertCircle, color: '#B91C1C', bg: '#FEE2E2' },
            { label: 'Students',        value: feeData.length,                   icon: Users,       color: '#7C3AED', bg: '#F3E8FF' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="stat-card">
              <div style={{ width: 40, height: 40, borderRadius: 11, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={19} color={color} />
              </div>
              <div>
                <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0B1D3A', lineHeight: 1.1, margin: 0 }}>{value}</p>
                <p style={{ fontSize: '.67rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', margin: 0 }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: '1.1rem 1.25rem', marginBottom: '1.5rem', boxShadow: '0 2px 12px rgba(11,29,58,.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.65rem', flexWrap: 'wrap', gap: '.5rem' }}>
            <div>
              <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '.9rem', margin: 0 }}>{selectedClassName} · {selectedTerm} {CURRENT_YEAR}</p>
              <p style={{ color: '#94A3B8', fontSize: '.72rem', marginTop: '.1rem', margin: 0 }}>
                <span style={{ color: '#15803D', fontWeight: 700 }}>{paidCount}P</span> · <span style={{ color: '#B45309', fontWeight: 700 }}>{partialCount}Pa</span> · <span style={{ color: '#B91C1C', fontWeight: 700 }}>{unpaidCount}U</span>
              </p>
            </div>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0B1D3A', fontFamily: "'Playfair Display',serif", margin: 0 }}>
              {collectionRate}<span style={{ fontSize: '.9rem', color: '#94A3B8' }}>%</span>
            </p>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${collectionRate}%`, background: collectionRate >= 80 ? 'linear-gradient(90deg,#059669,#34D399)' : collectionRate >= 50 ? 'linear-gradient(90deg,#C9963A,#E8B85A)' : 'linear-gradient(90deg,#DC2626,#F87171)' }} />
          </div>
        </div>

        {/* Table */}
        <div className="main-card">
          <div style={{ padding: '.9rem 1.25rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.65rem' }}>
            <div>
              <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '.9rem', margin: 0 }}>{selectedClassName} — {selectedTerm} {CURRENT_YEAR}</p>
              <p style={{ color: '#94A3B8', fontSize: '.7rem', margin: 0 }}>{filtered.length} students</p>
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: '.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" style={{ padding: '.6rem .85rem .6rem 2.2rem', border: '1.5px solid #E2E8F0', borderRadius: 10, fontFamily: "'DM Sans',sans-serif", fontSize: '.83rem', color: '#0B1D3A', background: '#FAFAF8', outline: 'none', width: 180 }} />
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '3.5rem', textAlign: 'center' }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', border: '3px solid rgba(201,150,58,.2)', borderTopColor: '#C9963A', animation: 'spin .8s linear infinite', margin: '0 auto 1rem' }} />
              <p style={{ color: '#94A3B8', fontSize: '.84rem' }}>Loading fee records…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '3.5rem', textAlign: 'center' }}>
              <DollarSign size={34} color="#E2E8F0" style={{ margin: '0 auto .65rem' }} />
              <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '.95rem', margin: '0 0 .35rem' }}>{search ? 'No students match' : 'No fee records yet'}</p>
              {!search && <p style={{ color: '#94A3B8', fontSize: '.8rem' }}>Click "Set Fee Amount" to create records</p>}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="fees-table">
                <thead>
                  <tr>
                    <th>#</th><th>Student</th><th>Due</th><th>Paid</th><th>Balance</th><th>Status</th><th>Last Paid</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((f, idx) => {
                    const balance = f.amountDue - f.amountPaid;
                    const pct = f.amountDue > 0 ? Math.round((f.amountPaid / f.amountDue) * 100) : 0;
                    return (
                      <tr key={f.studentId} className={`row-${Math.min(idx, 29)}`}>
                        <td><span style={{ width: 24, height: 24, borderRadius: 6, background: '#F1F5F9', color: '#94A3B8', fontSize: '.7rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{idx + 1}</span></td>
                        <td><p style={{ fontWeight: 600, color: '#0B1D3A', fontSize: '.86rem', margin: 0 }}>{f.studentName}</p></td>
                        <td><p style={{ fontWeight: 600, color: '#0B1D3A', fontSize: '.86rem', margin: 0 }}>₦{f.amountDue.toLocaleString()}</p></td>
                        <td>
                          <p style={{ fontWeight: 600, color: '#059669', fontSize: '.86rem', margin: 0 }}>₦{f.amountPaid.toLocaleString()}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '.35rem', marginTop: '.25rem' }}>
                            <div className="progress-bar-bg" style={{ height: 3, width: 60 }}><div className="progress-bar-fill" style={{ width: `${pct}%`, background: pct === 100 ? '#059669' : pct > 0 ? '#C9963A' : '#E2E8F0' }} /></div>
                            <span style={{ fontSize: '.65rem', color: '#94A3B8', fontWeight: 600 }}>{pct}%</span>
                          </div>
                        </td>
                        <td><p style={{ fontWeight: 700, color: balance === 0 ? '#059669' : '#B91C1C', fontSize: '.86rem', margin: 0 }}>{balance === 0 ? '—' : `₦${balance.toLocaleString()}`}</p></td>
                        <td>
                          <span className="status-pill" style={{ background: f.status === 'Paid' ? '#DCFCE7' : f.status === 'Partial' ? '#FEF9C3' : '#FEE2E2', color: f.status === 'Paid' ? '#15803D' : f.status === 'Partial' ? '#B45309' : '#B91C1C', border: `1px solid ${f.status === 'Paid' ? '#86EFAC' : f.status === 'Partial' ? '#FDE68A' : '#FCA5A5'}` }}>
                            <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />{f.status}
                          </span>
                        </td>
                        <td><p style={{ color: '#64748B', fontSize: '.78rem', margin: 0 }}>{f.lastPaymentDate ? new Date(f.lastPaymentDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}</p></td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                            {f.status !== 'Paid' ? (
                              <button onClick={() => setPayModal({ student: f, amount: '' })} disabled={saving === f.studentId} className="pay-btn">
                                {saving === f.studentId ? <div style={{ width: 11, height: 11, borderRadius: '50%', border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', animation: 'spin .6s linear infinite' }} /> : <Plus size={11} />}
                                Record
                              </button>
                            ) : (
                              <span style={{ color: '#15803D', fontSize: '.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '.25rem' }}><CheckCircle size={11} />Cleared</span>
                            )}
                            {f.status !== 'Paid' && (
                              reminderSuccess === f.studentId
                                ? <span style={{ color: '#059669', fontSize: '.72rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '.25rem' }}><CheckCircle size={11} />Sent!</span>
                                : <button onClick={() => sendReminder(f)} disabled={sendingReminder === f.studentId} className="sms-row-btn">
                                    {sendingReminder === f.studentId ? <div style={{ width: 9, height: 9, borderRadius: '50%', border: '2px solid rgba(26,86,160,.25)', borderTopColor: '#1A56A0', animation: 'spin .6s linear infinite' }} /> : <Send size={9} />}
                                    SMS
                                  </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {filtered.length > 0 && (
            <div style={{ padding: '.8rem 1.25rem', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.5rem' }}>
              <p style={{ color: '#94A3B8', fontSize: '.73rem', margin: 0 }}>Showing <span style={{ color: '#0B1D3A', fontWeight: 600 }}>{filtered.length}</span> students</p>
              <div style={{ display: 'flex', gap: '.5rem' }}>
                {[{ bg: '#DCFCE7', color: '#15803D', val: paidCount, label: 'paid' }, { bg: '#FEF9C3', color: '#B45309', val: partialCount, label: 'partial' }, { bg: '#FEE2E2', color: '#B91C1C', val: unpaidCount, label: 'unpaid' }].map(({ bg, color, val, label }) => (
                  <span key={label} style={{ background: bg, color, fontSize: '.7rem', fontWeight: 700, padding: '.18rem .55rem', borderRadius: 20 }}>{val} {label}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer style={{ background: '#0B1D3A', borderTop: '1px solid rgba(201,150,58,.15)', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.5rem' }}>
          <p style={{ color: '#475569', fontSize: '.73rem', margin: 0 }}>Fees · <span style={{ color: '#C9963A' }}>{CURRENT_YEAR}</span></p>
          <p style={{ color: '#475569', fontSize: '.73rem', margin: 0 }}>Powered by <span style={{ color: '#C9963A', fontWeight: 600 }}>Klas School Management Platform</span></p>
        </div>
      </footer>

      {/* Bulk Fee Modal */}
      {showBulkModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowBulkModal(false); }}>
          <div className="modal-box">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.1rem' }}>
              <div>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '1.1rem', margin: 0 }}>Set Fee Amount</h2>
                <p style={{ color: '#94A3B8', fontSize: '.78rem', margin: 0 }}>{selectedClassName} · {selectedTerm} {CURRENT_YEAR}</p>
              </div>
              <button onClick={() => setShowBulkModal(false)} style={{ background: '#F1F5F9', border: 'none', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={13} color="#64748B" /></button>
            </div>
            <label style={{ display: 'block', fontSize: '.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.4rem' }}>Fee Amount (₦)</label>
            <input type="number" value={bulkAmount} onChange={e => setBulkAmount(e.target.value)} placeholder="e.g. 45000" className="modal-input" style={{ marginBottom: '1.1rem' }} onKeyDown={e => e.key === 'Enter' && applyBulkAmount()} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.55rem' }}>
              <button onClick={applyBulkAmount} disabled={saving === 'bulk'} className="modal-submit">{saving === 'bulk' ? 'Saving…' : `Set ₦${parseFloat(bulkAmount || '0').toLocaleString()} for All`}</button>
              <button onClick={() => setShowBulkModal(false)} className="modal-cancel">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk SMS Modal */}
      {showBulkReminder && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowBulkReminder(false); }}>
          <div className="modal-box">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.1rem' }}>
              <div>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '1.1rem', margin: 0 }}>Send Fee Reminders</h2>
                <p style={{ color: '#94A3B8', fontSize: '.78rem', margin: 0 }}>{unpaidCount + partialCount} parents will receive SMS</p>
              </div>
              <button onClick={() => setShowBulkReminder(false)} style={{ background: '#F1F5F9', border: 'none', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={13} color="#64748B" /></button>
            </div>
            <div style={{ background: '#F8FAFC', borderRadius: 13, padding: '.9rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '.45rem' }}>
              {[{ label: 'Class', value: selectedClassName }, { label: 'Term', value: `${selectedTerm} ${CURRENT_YEAR}` }].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B', fontSize: '.82rem' }}>{r.label}</span>
                  <span style={{ fontWeight: 700, color: '#0B1D3A', fontSize: '.82rem' }}>{r.value}</span>
                </div>
              ))}
              <div style={{ height: 1, background: '#E2E8F0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#B91C1C', fontWeight: 700, fontSize: '.82rem' }}>Outstanding: ₦{totalOwed.toLocaleString()}</span>
              </div>
            </div>
            <div style={{ background: '#EFF6FF', border: '1px solid rgba(26,86,160,.2)', borderRadius: 11, padding: '.75rem .9rem', marginBottom: '1rem' }}>
              <p style={{ fontSize: '.67rem', fontWeight: 700, color: '#1A56A0', textTransform: 'uppercase', letterSpacing: '.07em', margin: '0 0 .35rem' }}>📱 Message Preview</p>
              <p style={{ color: '#1E40AF', fontSize: '.78rem', lineHeight: 1.6, margin: 0 }}>"Dear Parent, this is a reminder that [Student]'s school fees for {selectedTerm} {CURRENT_YEAR} has an outstanding balance of ₦[Amount]. Please pay at your earliest convenience."</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.55rem' }}>
              <button onClick={sendBulkReminder} disabled={sendingBulkReminder}
                style={{ width: '100%', padding: '.88rem', border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: '.93rem', fontWeight: 700, background: 'linear-gradient(135deg,#1A56A0,#2563EB)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem', opacity: sendingBulkReminder ? .7 : 1 }}>
                {sendingBulkReminder ? <><div style={sp('15px')} />Sending…</> : <><MessageSquare size={14} />Send {unpaidCount + partialCount} Reminders</>}
              </button>
              <button onClick={() => setShowBulkReminder(false)} className="modal-cancel">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {payModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setPayModal(null); }}>
          <div className="modal-box">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.1rem' }}>
              <div>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '1.1rem', margin: 0 }}>Record Payment</h2>
                <p style={{ color: '#94A3B8', fontSize: '.78rem', margin: 0 }}>{payModal.student.studentName}</p>
              </div>
              <button onClick={() => setPayModal(null)} style={{ background: '#F1F5F9', border: 'none', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={13} color="#64748B" /></button>
            </div>
            <div style={{ background: '#F8FAFC', borderRadius: 13, padding: '.9rem', marginBottom: '1rem' }}>
              {[{ label: 'Total Due', value: `₦${payModal.student.amountDue.toLocaleString()}`, color: '#0B1D3A' }, { label: 'Already Paid', value: `₦${payModal.student.amountPaid.toLocaleString()}`, color: '#059669' }].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.4rem' }}>
                  <span style={{ color: '#64748B', fontSize: '.82rem' }}>{r.label}</span>
                  <span style={{ fontWeight: 700, color: r.color, fontSize: '.82rem' }}>{r.value}</span>
                </div>
              ))}
              <div style={{ height: 1, background: '#E2E8F0', margin: '.4rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#B91C1C', fontWeight: 600, fontSize: '.82rem' }}>Balance</span>
                <span style={{ fontWeight: 800, color: '#B91C1C', fontSize: '.82rem' }}>₦{(payModal.student.amountDue - payModal.student.amountPaid).toLocaleString()}</span>
              </div>
            </div>
            <label style={{ display: 'block', fontSize: '.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.4rem' }}>Amount Being Paid Now (₦)</label>
            <input type="number" value={payModal.amount} onChange={e => setPayModal(p => p ? { ...p, amount: e.target.value } : null)} placeholder={`Max ₦${(payModal.student.amountDue - payModal.student.amountPaid).toLocaleString()}`} className="modal-input" style={{ marginBottom: '1.1rem' }} onKeyDown={e => e.key === 'Enter' && recordPayment()} autoFocus />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.55rem' }}>
              <button onClick={recordPayment} disabled={saving === payModal.student.studentId} className="modal-submit">
                {saving === payModal.student.studentId ? 'Recording…' : `Record ₦${parseFloat(payModal.amount || '0').toLocaleString()} Payment`}
              </button>
              <button onClick={() => setPayModal(null)} className="modal-cancel">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

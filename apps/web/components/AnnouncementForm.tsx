'use client';

import { useState } from 'react';
import { Send, X, CheckCircle, AlertCircle } from 'lucide-react';

interface Props {
  onClose?:   () => void;
  onSuccess?: (announcement: any) => void;
}

export default function AnnouncementForm({ onClose, onSuccess }: Props) {
  const [title,          setTitle]          = useState('');
  const [content,        setContent]        = useState('');
  const [targetAudience, setTargetAudience] = useState('all');
  const [saving,         setSaving]         = useState(false);
  const [success,        setSuccess]        = useState('');
  const [error,          setError]          = useState('');

  const API   = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const token = () => localStorage.getItem('token') || '';

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required'); return;
    }
    setSaving(true); setError('');
    try {
      const res = await fetch(`${API}/announcements`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body:    JSON.stringify({ title, content, targetAudience }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const data = await res.json();
      setSuccess(`Announcement posted! ${data.notified} people notified.`);
      setTitle(''); setContent('');
      onSuccess?.(data.announcement);
      setTimeout(() => { setSuccess(''); onClose?.(); }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to post announcement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #E2E8F0', padding: '1.5rem', fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '1rem', margin: 0 }}>
          New Announcement
        </p>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
            <X size={16} />
          </button>
        )}
      </div>

      {success && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#16A34A', padding: '.75rem 1rem', borderRadius: 10, marginBottom: '1rem', fontSize: '.85rem', fontWeight: 600 }}>
          <CheckCircle size={14} /> {success}
        </div>
      )}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', background: '#FFF1F2', border: '1px solid #FECDD3', color: '#DC2626', padding: '.75rem 1rem', borderRadius: 10, marginBottom: '1rem', fontSize: '.85rem' }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '.4rem' }}>
            Title
          </label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. School Resumption Notice"
            style={{ width: '100%', padding: '.75rem 1rem', border: '1.5px solid #E2E8F0', borderRadius: 11, fontFamily: "'DM Sans',sans-serif", fontSize: '.9rem', color: '#0B1D3A', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '.4rem' }}>
            Message
          </label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write your announcement here…"
            rows={4}
            style={{ width: '100%', padding: '.75rem 1rem', border: '1.5px solid #E2E8F0', borderRadius: 11, fontFamily: "'DM Sans',sans-serif", fontSize: '.9rem', color: '#0B1D3A', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '.4rem' }}>
            Send To
          </label>
          <select
            value={targetAudience}
            onChange={e => setTargetAudience(e.target.value)}
            style={{ width: '100%', padding: '.75rem 1rem', border: '1.5px solid #E2E8F0', borderRadius: 11, fontFamily: "'DM Sans',sans-serif", fontSize: '.9rem', color: '#0B1D3A', outline: 'none', background: '#fff', boxSizing: 'border-box' }}>
            <option value="all">Everyone (Parents + Teachers)</option>
            <option value="parents">Parents only</option>
            <option value="teachers">Teachers only</option>
          </select>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving || !title.trim() || !content.trim()}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem', padding: '.85rem', borderRadius: 12, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg,#C9963A,#E8B85A)', color: '#0B1D3A', fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: '.92rem', opacity: saving ? .7 : 1 }}>
          {saving
            ? <><div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(11,29,58,.2)', borderTopColor: '#0B1D3A', animation: 'spin .6s linear infinite' }} /> Posting…</>
            : <><Send size={14} /> Post Announcement</>}
        </button>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
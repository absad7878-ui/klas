'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, CheckCircle, AlertCircle, Image, RefreshCw, School, X, MapPin, Phone, Mail, Globe, FileText, Save, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function resolveUrl(url: string | null | undefined) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API}${url}`;
}

export default function BrandingSettingsPage() {
  const router = useRouter();

  const [school, setSchool]             = useState<any>(null);
  const [loadingSchool, setLoadingSchool] = useState(true);
  const [logoFile, setLogoFile]         = useState<File | null>(null);
  const [coverFile, setCoverFile]       = useState<File | null>(null);
  const [logoPreview, setLogoPreview]   = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [contact, setContact]           = useState({ address: '', phone: '', email: '', website: '', description: '' });
  const [savingContact, setSavingContact] = useState(false);
  const [contactSuccess, setContactSuccess] = useState('');
  const [saving, setSaving]             = useState(false);
  const [success, setSuccess]           = useState('');
  const [error, setError]               = useState('');

  const logoRef  = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/school-login'); return; }
    fetch(`${API}/api/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(me => {
        if (me?.schoolId) {
          return fetch(`${API}/schools/${me.schoolId}`)
            .then(r => r.json())
            .then(s => {
              setSchool(s);
              setContact({
                address:     s.address     || '',
                phone:       s.phone       || '',
                email:       s.email       || '',
                website:     s.website     || '',
                description: s.description || '',
              });
            });
        }
      })
      .catch(console.error)
      .finally(() => setLoadingSchool(false));
  }, []);

  const handleFile = (file: File | null, setFile: (f: File | null) => void, setPreview: (p: string | null) => void, maxMB: number) => {
    if (!file) return;
    if (file.size > maxMB * 1024 * 1024) { setError(`File too large — max ${maxMB}MB`); return; }
    setFile(file); setPreview(URL.createObjectURL(file)); setError(''); setSuccess('');
  };

  const handleSave = async () => {
    if (!logoFile && !coverFile) { setError('Please select at least one image to update.'); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      if (logoFile)  fd.append('logo',  logoFile);
      if (coverFile) fd.append('cover', coverFile);
      const res = await fetch(`${API}/schools/branding`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setSchool((prev: any) => ({ ...prev, logoUrl: data.logoUrl ?? prev?.logoUrl, coverImageUrl: data.coverImageUrl ?? prev?.coverImageUrl }));
      setLogoFile(null); setLogoPreview(null);
      setCoverFile(null); setCoverPreview(null);
      setSuccess('Branding updated successfully!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) { setError(err.message || 'Something went wrong'); }
    finally { setSaving(false); }
  };

  const handleSaveContact = async () => {
    setSavingContact(true); setError(''); setContactSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/schools/contact`, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(contact) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setSchool((prev: any) => ({ ...prev, ...contact }));
      setContactSuccess('Contact details updated!');
      setTimeout(() => setContactSuccess(''), 4000);
    } catch (err: any) { setError(err.message || 'Something went wrong'); }
    finally { setSavingContact(false); }
  };

  const currentLogo  = logoPreview  || resolveUrl(school?.logoUrl);
  const currentCover = coverPreview || resolveUrl(school?.coverImageUrl);

  const inputStyle: React.CSSProperties = { width: '100%', padding: '.85rem 1rem', border: '1.5px solid #E2E8F0', borderRadius: 12, fontFamily: "'DM Sans',sans-serif", fontSize: '.88rem', color: '#0B1D3A', background: '#FAFAF8', outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ minHeight: '100vh', width: '100%', overflowX: 'hidden', fontFamily: "'DM Sans',sans-serif", background: '#F0EFE9', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin      { to{transform:rotate(360deg)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        .fade-up   { animation: fadeUp .45s ease both; }
        .fade-up-1 { animation: fadeUp .45s .08s ease both; }
        .fade-up-2 { animation: fadeUp .45s .16s ease both; }
        .alert-anim { animation: slideDown .3s ease both; }
        .upload-zone { border:2px dashed #E2E8F0;border-radius:16px;background:#FAFAF8;cursor:pointer;transition:border-color .2s,background .2s;position:relative;overflow:hidden; }
        .upload-zone:hover { border-color:#C9963A;background:rgba(201,150,58,.04); }
        .upload-zone.has-file { border-color:#22C55E;background:#F0FDF4; }
        .remove-btn { position:absolute;top:8px;right:8px;width:28px;height:28px;border-radius:50%;background:rgba(0,0,0,.55);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:2;transition:background .2s; }
        .remove-btn:hover { background:rgba(225,29,72,.8); }
        .save-btn { padding:.9rem 2rem;border:none;border-radius:13px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:.9rem;font-weight:700;background:linear-gradient(135deg,#C9963A,#E8B85A);color:#0B1D3A;box-shadow:0 4px 18px rgba(201,150,58,.3);transition:transform .2s,box-shadow .2s;display:flex;align-items:center;gap:.5rem; }
        .save-btn:hover:not(:disabled) { transform:translateY(-2px);box-shadow:0 8px 28px rgba(201,150,58,.45); }
        .save-btn:disabled { opacity:.65;cursor:not-allowed; }
        .form-input-focus:focus { border-color:#C9963A !important;box-shadow:0 0 0 3px rgba(201,150,58,.12) !important; }
        .back-btn { display:flex;align-items:center;gap:.4rem;color:#C9963A;background:none;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:600;font-size:.85rem; }

        /* Responsive grids */
        .upload-grid  { display:grid;grid-template-columns:1fr 1fr;gap:1.25rem; }
        .contact-grid { display:grid;grid-template-columns:1fr 1fr;gap:1.1rem; }
        @media(max-width:640px) {
          .upload-grid  { grid-template-columns:1fr; }
          .contact-grid { grid-template-columns:1fr; }
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

      <main className="fade-up-1" style={{ flex: 1, padding: '1.75rem 1.25rem 3rem' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>

          {/* Page title */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.4rem,3vw,1.9rem)', fontWeight: 800, color: '#0B1D3A', marginBottom: '.3rem' }}>School Branding</h1>
            <p style={{ color: '#94A3B8', fontSize: '.87rem' }}>Update your school logo, cover banner and contact info.</p>
          </div>

          {/* Alerts */}
          {success && (
            <div className="alert-anim" style={{ marginBottom: '1.1rem', padding: '.85rem 1.1rem', borderRadius: 13, background: '#ECFDF5', border: '1.5px solid #6EE7B7', display: 'flex', alignItems: 'center', gap: '.65rem' }}>
              <CheckCircle size={16} color="#059669" />
              <p style={{ color: '#065F46', fontWeight: 600, fontSize: '.87rem', margin: 0 }}>{success}</p>
            </div>
          )}
          {error && (
            <div className="alert-anim" style={{ marginBottom: '1.1rem', padding: '.85rem 1.1rem', borderRadius: 13, background: '#FFF1F2', border: '1.5px solid #FECDD3', display: 'flex', alignItems: 'center', gap: '.65rem' }}>
              <AlertCircle size={16} color="#E11D48" />
              <p style={{ color: '#9F1239', fontWeight: 600, fontSize: '.87rem', margin: 0 }}>{error}</p>
            </div>
          )}

          {/* Live Preview */}
          <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 20, overflow: 'hidden', marginBottom: '1.5rem', boxShadow: '0 4px 22px rgba(11,29,58,.07)' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '.65rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: '#EBF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Image size={15} color="#1A56A0" />
              </div>
              <div>
                <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '.9rem', margin: 0 }}>Live Preview</p>
                <p style={{ color: '#94A3B8', fontSize: '.71rem', margin: 0 }}>How your profile looks right now</p>
              </div>
            </div>
            <div style={{ position: 'relative', height: 140, overflow: 'hidden' }}>
              {currentCover
                ? <img src={currentCover} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ height: '100%', background: '#0B1D3A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: 'rgba(255,255,255,.2)', fontSize: '.8rem' }}>No banner uploaded</p></div>}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,transparent 40%,rgba(11,29,58,.8))' }} />
              <div style={{ position: 'absolute', bottom: 14, left: 16, display: 'flex', alignItems: 'flex-end', gap: '.85rem' }}>
                {currentLogo
                  ? <img src={currentLogo} alt="logo" style={{ width: 52, height: 52, borderRadius: 12, objectFit: 'contain', background: '#fff', padding: 3, border: '2px solid rgba(201,150,58,.5)', flexShrink: 0 }} />
                  : <div style={{ width: 52, height: 52, borderRadius: 12, background: 'linear-gradient(135deg,#C9963A,#E8B85A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><School size={22} color="#0B1D3A" /></div>}
                <div>
                  <p style={{ fontFamily: "'Playfair Display',serif", color: '#fff', fontWeight: 700, fontSize: '1rem', lineHeight: 1.2, margin: 0 }}>{loadingSchool ? '…' : school?.name || 'Your School'}</p>
                  <p style={{ color: '#C9963A', fontSize: '.7rem', margin: 0 }}>{school?.subdomain ? `${school.subdomain}.klas.ng` : ''}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Cards */}
          <div className="upload-grid" style={{ marginBottom: '1.5rem' }}>

            {/* Logo */}
            <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 22px rgba(11,29,58,.07)' }}>
              <div style={{ padding: '1rem 1.4rem', borderBottom: '1px solid #F1F5F9' }}>
                <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '.88rem', margin: 0 }}>School Logo</p>
                <p style={{ color: '#94A3B8', fontSize: '.7rem', marginTop: '.1rem' }}>Square · PNG/JPG · max 2MB</p>
              </div>
              <div style={{ padding: '1.25rem' }}>
                <input ref={logoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0] || null, setLogoFile, setLogoPreview, 2)} />
                <div className={`upload-zone ${logoFile ? 'has-file' : ''}`} style={{ padding: '1.5rem', textAlign: 'center' }}
                  onClick={() => logoRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
                  onDragLeave={e => e.currentTarget.classList.remove('drag-over')}
                  onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('drag-over'); handleFile(e.dataTransfer.files[0] || null, setLogoFile, setLogoPreview, 2); }}>
                  {logoPreview ? (
                    <>
                      <button className="remove-btn" onClick={e => { e.stopPropagation(); setLogoFile(null); setLogoPreview(null); }}><X size={13} color="#fff" /></button>
                      <img src={logoPreview} alt="preview" style={{ width: 70, height: 70, objectFit: 'contain', borderRadius: 12, border: '2px solid rgba(34,197,94,.3)', background: '#fff', padding: 3, margin: '0 auto' }} />
                      <p style={{ color: '#059669', fontWeight: 600, fontSize: '.78rem', marginTop: '.65rem' }}>✓ New logo ready</p>
                    </>
                  ) : (
                    <>
                      <Upload size={26} color="#CBD5E1" style={{ margin: '0 auto .65rem' }} />
                      <p style={{ color: '#64748B', fontSize: '.82rem', fontWeight: 500 }}>Click or drag to upload</p>
                    </>
                  )}
                </div>
                {school?.logoUrl && !logoPreview && (
                  <div style={{ marginTop: '.9rem', padding: '.65rem', borderRadius: 11, background: '#F8FAFC', border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '.65rem' }}>
                    <img src={resolveUrl(school.logoUrl)!} alt="current" style={{ width: 36, height: 36, borderRadius: 9, objectFit: 'contain', background: '#fff', border: '1px solid #E2E8F0', padding: 2 }} />
                    <div>
                      <p style={{ fontSize: '.7rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', margin: 0 }}>Current Logo</p>
                      <p style={{ fontSize: '.75rem', color: '#64748B', margin: 0 }}>Upload above to replace</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Banner */}
            <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 22px rgba(11,29,58,.07)' }}>
              <div style={{ padding: '1rem 1.4rem', borderBottom: '1px solid #F1F5F9' }}>
                <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '.88rem', margin: 0 }}>Cover Banner</p>
                <p style={{ color: '#94A3B8', fontSize: '.7rem', marginTop: '.1rem' }}>Landscape 1600×400 · max 5MB</p>
              </div>
              <div style={{ padding: '1.25rem' }}>
                <input ref={coverRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0] || null, setCoverFile, setCoverPreview, 5)} />
                <div className={`upload-zone ${coverFile ? 'has-file' : ''}`} style={{ padding: '1.5rem', textAlign: 'center' }}
                  onClick={() => coverRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
                  onDragLeave={e => e.currentTarget.classList.remove('drag-over')}
                  onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('drag-over'); handleFile(e.dataTransfer.files[0] || null, setCoverFile, setCoverPreview, 5); }}>
                  {coverPreview ? (
                    <>
                      <button className="remove-btn" onClick={e => { e.stopPropagation(); setCoverFile(null); setCoverPreview(null); }}><X size={13} color="#fff" /></button>
                      <img src={coverPreview} alt="preview" style={{ width: '100%', height: 70, objectFit: 'cover', borderRadius: 9, border: '2px solid rgba(34,197,94,.3)' }} />
                      <p style={{ color: '#059669', fontWeight: 600, fontSize: '.78rem', marginTop: '.65rem' }}>✓ New banner ready</p>
                    </>
                  ) : (
                    <>
                      <Upload size={26} color="#CBD5E1" style={{ margin: '0 auto .65rem' }} />
                      <p style={{ color: '#64748B', fontSize: '.82rem', fontWeight: 500 }}>Click or drag to upload</p>
                      <p style={{ color: '#94A3B8', fontSize: '.7rem', marginTop: '.25rem' }}>Wide image recommended</p>
                    </>
                  )}
                </div>
                {school?.coverImageUrl && !coverPreview && (
                  <div style={{ marginTop: '.9rem', padding: '.65rem', borderRadius: 11, background: '#F8FAFC', border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '.65rem' }}>
                    <img src={resolveUrl(school.coverImageUrl)!} alt="current" style={{ width: 54, height: 32, objectFit: 'cover', borderRadius: 7, border: '1px solid #E2E8F0' }} />
                    <div>
                      <p style={{ fontSize: '.7rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', margin: 0 }}>Current Banner</p>
                      <p style={{ fontSize: '.75rem', color: '#64748B', margin: 0 }}>Upload above to replace</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Save branding button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem', marginBottom: '1.75rem' }}>
            {(logoFile || coverFile) && (
              <p style={{ color: '#C9963A', fontSize: '.82rem', fontWeight: 600 }}>
                {[logoFile && 'Logo', coverFile && 'Banner'].filter(Boolean).join(' + ')} ready to save
              </p>
            )}
            <button className="save-btn" onClick={handleSave} disabled={saving || (!logoFile && !coverFile)}>
              {saving ? <><div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(11,29,58,.2)', borderTopColor: '#0B1D3A', animation: 'spin .7s linear infinite' }} />Saving…</> : <><RefreshCw size={15} />Save Branding</>}
            </button>
          </div>

          {/* Contact Details */}
          <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 22px rgba(11,29,58,.07)' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '.65rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: '#E6FFEE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={15} color="#059669" />
              </div>
              <div>
                <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#0B1D3A', fontSize: '.9rem', margin: 0 }}>Contact Details</p>
                <p style={{ color: '#94A3B8', fontSize: '.71rem', margin: 0 }}>Update your school's public contact information</p>
              </div>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

              {contactSuccess && (
                <div style={{ padding: '.85rem 1.1rem', borderRadius: 13, background: '#ECFDF5', border: '1.5px solid #6EE7B7', display: 'flex', alignItems: 'center', gap: '.65rem' }}>
                  <CheckCircle size={16} color="#059669" />
                  <p style={{ color: '#065F46', fontWeight: 600, fontSize: '.87rem', margin: 0 }}>{contactSuccess}</p>
                </div>
              )}

              <div className="contact-grid">
                {[
                  { key: 'phone',   label: 'Phone Number', icon: Phone,  type: 'text',  placeholder: '+234 800 000 0000' },
                  { key: 'email',   label: 'Official Email', icon: Mail,  type: 'email', placeholder: 'admin@yourschool.com' },
                  { key: 'address', label: 'Address',       icon: MapPin, type: 'text',  placeholder: '12 School Road, Lagos' },
                  { key: 'website', label: 'Website',       icon: Globe,  type: 'url',   placeholder: 'https://yourschool.com' },
                ].map(({ key, label, icon: Icon, type, placeholder }) => (
                  <div key={key}>
                    <label style={{ fontSize: '.72rem', fontWeight: 700, color: '#0B1D3A', textTransform: 'uppercase', letterSpacing: '.07em', display: 'flex', alignItems: 'center', gap: '.35rem', marginBottom: '.4rem' }}>
                      <Icon size={11} color="#C9963A" /> {label}
                    </label>
                    <input
                      type={type}
                      value={(contact as any)[key]}
                      onChange={e => setContact(p => ({ ...p, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="form-input-focus"
                      style={inputStyle}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label style={{ fontSize: '.72rem', fontWeight: 700, color: '#0B1D3A', textTransform: 'uppercase', letterSpacing: '.07em', display: 'flex', alignItems: 'center', gap: '.35rem', marginBottom: '.4rem' }}>
                  <FileText size={11} color="#C9963A" /> About the School
                </label>
                <textarea
                  value={contact.description}
                  onChange={e => setContact(p => ({ ...p, description: e.target.value }))}
                  placeholder="Tell us about your school, vision, values…"
                  rows={4}
                  className="form-input-focus"
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={handleSaveContact} disabled={savingContact}
                  style={{ padding: '.85rem 1.75rem', border: 'none', borderRadius: 13, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: '.88rem', fontWeight: 700, background: 'linear-gradient(135deg,#0B1D3A,#162D54)', color: '#fff', boxShadow: '0 4px 18px rgba(11,29,58,.22)', display: 'flex', alignItems: 'center', gap: '.5rem', opacity: savingContact ? .65 : 1, transition: 'opacity .2s' }}>
                  {savingContact
                    ? <><div style={{ width: 15, height: 15, borderRadius: '50%', border: '2px solid rgba(255,255,255,.25)', borderTopColor: '#fff', animation: 'spin .7s linear infinite' }} />Saving…</>
                    : <><Save size={14} />Save Contact Details</>}
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

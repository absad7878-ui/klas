'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, AlertCircle, CheckCircle, School, ArrowRight, Building2, Mail, Lock, Globe, Phone, MapPin, BookOpen, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerMetadata } from '@/app/seo-metadata';


const registerSchema = z.object({
  name: z.string().min(3).max(100).trim(),
  subdomain: z
    .string().min(3).max(50)
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, hyphens')
    .transform((val) => val.toLowerCase())
    .refine((val) => !val.startsWith('-') && !val.endsWith('-'), { message: 'Cannot start or end with hyphen' }),
  address: z.string().max(200).optional(),
  phoneNumber: z.string().max(30).optional(),
  officialEmail: z.string().email().trim(),
  adminEmail: z.string().email().trim().optional(),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().max(1500).optional(),
  gradingSystem: z.object({ type: z.enum(['letter', 'gpa', 'percentage']) }).optional(),
  academicStructure: z.object({ termsPerYear: z.number().int().min(1).max(4), usesSemesters: z.boolean() }).optional(),
  adminPassword: z.string().min(8).max(128)
    .refine((val) => /[A-Z]/.test(val), 'At least one uppercase')
    .refine((val) => /[a-z]/.test(val), 'At least one lowercase')
    .refine((val) => /\d/.test(val), 'At least one number')
    .refine((val) => /[!@#$%^&*(),.?":{}|<>]/.test(val), 'At least one special char'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '', subdomain: '', address: '', phoneNumber: '',
      officialEmail: '', adminEmail: '', website: '', description: '',
      gradingSystem: { type: 'letter' },
      academicStructure: { termsPerYear: 3, usesSemesters: false },
      adminPassword: '',
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true); setError(null); setSuccess(false);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('subdomain', data.subdomain);
      formData.append('officialEmail', data.officialEmail);
      formData.append('adminEmail', data.adminEmail || data.officialEmail);
      formData.append('adminPassword', data.adminPassword);
      if (data.address) formData.append('address', data.address);
      if (data.phoneNumber) formData.append('phoneNumber', data.phoneNumber);
      if (data.website) formData.append('website', data.website);
      if (data.description) formData.append('description', data.description);
      formData.append('gradingSystem', JSON.stringify(data.gradingSystem || { type: 'letter' }));
      formData.append('academicStructure', JSON.stringify(data.academicStructure || { termsPerYear: 3, usesSemesters: false }));
      if (logoFile) formData.append('logo', logoFile);
      if (coverFile) formData.append('cover', coverFile);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/schools/register`, { method: 'POST', body: formData });
      const result = await response.json();
      if (!response.ok) {
        if (response.status === 400 && result.details) {
          const formatted = Object.entries(result.details).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('\n');
          throw new Error(`Validation failed:\n${formatted}`);
        }
        throw new Error(result.error || 'Registration failed');
      }
      setSuccess(true);
      setSuccessMessage(`School "${result.school?.name || data.name}" registered successfully! Redirecting…`);
      setTimeout(() => router.push('/school-login'), 3000);
      reset(); setLogoFile(null); setCoverFile(null);
    } catch (err: any) {
      setError(err.message || 'Network error during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        @keyframes fadeUp    { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer   { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }

        .fade-up   { animation: fadeUp .5s ease both; }
        .fade-up-1 { animation: fadeUp .5s .08s ease both; }
        .fade-up-2 { animation: fadeUp .5s .16s ease both; }
        .alert     { animation: slideDown .3s ease both; }

        .gold-shimmer {
          background: linear-gradient(90deg,#C9963A 0%,#F0C060 40%,#C9963A 60%,#E8B85A 100%);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; animation: shimmer 4s linear infinite;
        }

        .hero-dot-grid {
          background-image: radial-gradient(circle,rgba(201,150,58,.13) 1px,transparent 1px);
          background-size: 28px 28px;
        }

        .float-icon { animation: float 4s ease-in-out infinite; }

        /* ── Left panel ── */
        .left-panel {
          width: 420px; flex-shrink: 0;
          background: #0B1D3A;
          position: sticky; top: 0; height: 100vh;
          overflow: hidden; display: flex; flex-direction: column;
          justify-content: space-between; padding: 3rem 2.5rem;
        }
        @media(max-width:960px){ .left-panel{display:none;} }

        .feature-row {
          display:flex;align-items:flex-start;gap:.85rem;
          padding:.8rem 0;border-bottom:1px solid rgba(255,255,255,.06);
        }
        .feature-row:last-child{border-bottom:none;}

        /* ── Right panel ── */
        .right-panel {
          flex:1; background:#F0EFE9;
          overflow-y:auto; padding:3rem 2rem 4rem;
        }

        .form-section {
          background:#fff;border:1px solid #E2E8F0;border-radius:22px;
          box-shadow:0 4px 22px rgba(11,29,58,.07);overflow:hidden;
          margin-bottom:1.5rem;
        }
        .section-header {
          padding:1.1rem 1.75rem;border-bottom:1px solid #F1F5F9;
          display:flex;align-items:center;gap:.75rem;
        }
        .section-body { padding:1.75rem; display:flex; flex-direction:column; gap:1.25rem; }

        /* Form grid */
        .field-grid-2 { display:grid;grid-template-columns:1fr 1fr;gap:1.25rem; }
        @media(max-width:640px){ .field-grid-2{grid-template-columns:1fr;} }

        .field-label {
          font-size:.76rem;font-weight:600;color:#0B1D3A;
          text-transform:uppercase;letter-spacing:.07em;
          display:flex;align-items:center;gap:.35rem;margin-bottom:.45rem;
        }
        .req { color:#C9963A; }
        .opt { color:#94A3B8;font-weight:400;text-transform:none;letter-spacing:0;font-size:.72rem; }

        .field-input, .field-select, .field-textarea {
          width:100%;padding:.85rem 1rem;
          border:1.5px solid #E2E8F0;border-radius:12px;
          font-family:'DM Sans',sans-serif;font-size:.88rem;color:#0B1D3A;
          background:#FAFAF8;outline:none;box-sizing:border-box;
          transition:border-color .2s,box-shadow .2s,background .2s;
        }
        .field-input::placeholder,.field-textarea::placeholder{color:#CBD5E1;}
        .field-input:focus,.field-select:focus,.field-textarea:focus{
          border-color:#C9963A;box-shadow:0 0 0 3px rgba(201,150,58,.12);background:#fff;
        }
        .field-textarea{resize:vertical;min-height:110px;}
        .field-select{appearance:none;-webkit-appearance:none;cursor:pointer;}

        /* Subdomain input group */
        .subdomain-wrap{display:flex;border:1.5px solid #E2E8F0;border-radius:12px;overflow:hidden;background:#FAFAF8;transition:border-color .2s,box-shadow .2s;}
        .subdomain-wrap:focus-within{border-color:#C9963A;box-shadow:0 0 0 3px rgba(201,150,58,.12);background:#fff;}
        .subdomain-input{flex:1;padding:.85rem 1rem;border:none;outline:none;background:transparent;font-family:'DM Sans',sans-serif;font-size:.88rem;color:#0B1D3A;}
        .subdomain-suffix{padding:.85rem 1rem;background:rgba(201,150,58,.08);color:#C9963A;font-size:.8rem;font-weight:600;border-left:1px solid #E2E8F0;white-space:nowrap;display:flex;align-items:center;}

        /* Upload zone */
        .upload-zone{
          border:2px dashed #E2E8F0;border-radius:16px;padding:2.25rem;
          text-align:center;cursor:pointer;transition:border-color .2s,background .2s;
          background:#FAFAF8;
        }
        .upload-zone:hover{border-color:#C9963A;background:rgba(201,150,58,.04);}
        .upload-zone.has-file{border-color:#22C55E;background:#F0FDF4;}

        /* Checkbox */
        .custom-checkbox{width:18px;height:18px;accent-color:#C9963A;cursor:pointer;flex-shrink:0;}

        /* Error text */
        .field-error{font-size:.75rem;color:#E11D48;margin-top:.3rem;display:flex;align-items:center;gap:.3rem;}

        /* Password toggle */
        .pw-wrap{position:relative;}
        .pw-toggle{
          position:absolute;right:1rem;top:50%;transform:translateY(-50%);
          background:none;border:none;cursor:pointer;color:#94A3B8;
          font-size:.72rem;font-weight:600;font-family:'DM Sans',sans-serif;
          padding:.25rem .4rem;border-radius:6px;transition:color .15s;
        }
        .pw-toggle:hover{color:#C9963A;background:rgba(201,150,58,.08);}

        .gold-divider{height:1px;background:linear-gradient(90deg,transparent,rgba(201,150,58,.3),transparent);}

        /* Submit */
        .submit-btn{
          width:100%;padding:1.05rem;border:none;border-radius:14px;cursor:pointer;
          font-family:'DM Sans',sans-serif;font-size:1rem;font-weight:700;
          display:flex;align-items:center;justify-content:center;gap:.6rem;
          background:linear-gradient(135deg,#0B1D3A 0%,#162D54 100%);
          color:#fff;box-shadow:0 4px 18px rgba(11,29,58,.22);
          transition:background .2s,transform .15s,box-shadow .2s;
        }
        .submit-btn:hover:not(:disabled){
          background:linear-gradient(135deg,#162D54 0%,#1e3a6a 100%);
          transform:translateY(-1px);box-shadow:0 8px 28px rgba(11,29,58,.28);
        }
        .submit-btn:disabled{opacity:.65;cursor:not-allowed;}
      `}</style>

      {/* ══════════════ LEFT PANEL ══════════════ */}
      <div className="left-panel">
        <div className="hero-dot-grid absolute inset-0" />
        <div style={{ position:'absolute', top:-60, right:-60, width:280, height:280, borderRadius:'50%', background:'radial-gradient(circle,rgba(201,150,58,.14) 0%,transparent 65%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-80, left:-40, width:240, height:240, borderRadius:'50%', background:'radial-gradient(circle,rgba(26,86,160,.22) 0%,transparent 65%)', pointerEvents:'none' }} />

        {/* Top */}
        <div className="relative fade-up">
          <div style={{ display:'flex', alignItems:'center', gap:'.75rem', marginBottom:'2.75rem' }}>
            <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#C9963A,#E8B85A)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <School size={20} color="#0B1D3A" />
            </div>
            <p style={{ fontFamily:"'Playfair Display',serif", color:'#fff', fontWeight:700, fontSize:'1rem' }}>
              Klas School Management Platform
            </p>
          </div>

          <div className="float-icon" style={{ width:72, height:72, borderRadius:20, background:'rgba(201,150,58,.12)', border:'1px solid rgba(201,150,58,.25)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'1.5rem' }}>
            <Building2 size={34} color="#C9963A" />
          </div>

          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.8rem', fontWeight:800, color:'#fff', lineHeight:1.2, marginBottom:'.75rem' }}>
            Register Your <span className="gold-shimmer">School</span>
          </h2>
          <p style={{ color:'#64748B', fontSize:'.85rem', lineHeight:1.65, maxWidth:300 }}>
            Join schools across Africa using our modern, affordable platform. Setup takes less than 5 minutes.
          </p>
        </div>

        {/* Middle: steps */}
        <div className="relative fade-up-1" style={{ margin:'2rem 0' }}>
          {[
            { step:'01', title:'School Details',    desc:'Name, subdomain, contact info.' },
            { step:'02', title:'Academic Settings', desc:'Grading system & term structure.' },
            { step:'03', title:'Admin Account',     desc:'Set up your admin login credentials.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="feature-row">
              <div style={{ width:36, height:36, borderRadius:10, background:'rgba(201,150,58,.12)', border:'1px solid rgba(201,150,58,.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ color:'#C9963A', fontWeight:700, fontSize:'.75rem' }}>{step}</span>
              </div>
              <div>
                <p style={{ color:'#fff', fontWeight:600, fontSize:'.88rem', lineHeight:1.2 }}>{title}</p>
                <p style={{ color:'#64748B', fontSize:'.76rem', marginTop:'.2rem' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="relative fade-up-2">
          <p style={{ color:'#334155', fontSize:'.72rem' }}>
            Already registered?{' '}
            <Link href="/school-login" style={{ color:'#C9963A', fontWeight:600, textDecoration:'none' }}>Login here →</Link>
          </p>
        </div>
      </div>

      {/* ══════════════ RIGHT PANEL ══════════════ */}
      <div className="right-panel">
        <div style={{ maxWidth:760, margin:'0 auto' }}>

          {/* Page heading */}
          <div className="fade-up" style={{ marginBottom:'2rem' }}>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(1.6rem,3vw,2.2rem)', fontWeight:800, color:'#0B1D3A', lineHeight:1.15, marginBottom:'.4rem' }}>
              School Registration
            </h1>
            <p style={{ color:'#94A3B8', fontSize:'.85rem' }}>Fill in the details below to create your school account.</p>
          </div>

          {/* Alerts */}
          {success && (
            <div className="alert" style={{ marginBottom:'1.5rem', padding:'1rem 1.25rem', borderRadius:16, background:'#ECFDF5', border:'1.5px solid #6EE7B7', display:'flex', alignItems:'flex-start', gap:'.75rem' }}>
              <CheckCircle size={18} color="#059669" style={{ flexShrink:0, marginTop:2 }} />
              <div>
                <p style={{ color:'#065F46', fontWeight:600, fontSize:'.88rem' }}>Registration Successful!</p>
                <p style={{ color:'#047857', fontSize:'.83rem', marginTop:'.15rem' }}>{successMessage}</p>
              </div>
            </div>
          )}
          {error && (
            <div className="alert" style={{ marginBottom:'1.5rem', padding:'1rem 1.25rem', borderRadius:16, background:'#FFF1F2', border:'1.5px solid #FECDD3', display:'flex', alignItems:'flex-start', gap:'.75rem', whiteSpace:'pre-line' }}>
              <AlertCircle size={18} color="#E11D48" style={{ flexShrink:0, marginTop:2 }} />
              <div>
                <p style={{ color:'#9F1239', fontWeight:600, fontSize:'.88rem' }}>Registration Failed</p>
                <p style={{ color:'#BE123C', fontSize:'.83rem', marginTop:'.15rem' }}>{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>

            {/* ── SECTION 1: School Identity ── */}
            <div className="form-section fade-up">
              <div className="section-header">
                <div style={{ width:36, height:36, borderRadius:10, background:'#EBF4FF', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Building2 size={17} color="#1A56A0" />
                </div>
                <div>
                  <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, color:'#0B1D3A', fontSize:'.95rem' }}>School Identity</p>
                  <p style={{ color:'#94A3B8', fontSize:'.72rem' }}>Basic information about your school</p>
                </div>
              </div>
              <div className="section-body">
                <div className="field-grid-2">
                  <div>
                    <label className="field-label"><Building2 size={11} color="#C9963A" /> School Name <span className="req">*</span></label>
                    <input {...register('name')} className="field-input" placeholder="e.g. Greenwood International Academy" />
                    {errors.name && <p className="field-error"><AlertCircle size={11}/>{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="field-label"><Globe size={11} color="#C9963A" /> Subdomain <span className="req">*</span></label>
                    <div className="subdomain-wrap">
                      <input {...register('subdomain')} className="subdomain-input" placeholder="greenwood" />
                      <span className="subdomain-suffix">.klas.ng</span>
                    </div>
                    {errors.subdomain && <p className="field-error"><AlertCircle size={11}/>{errors.subdomain.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="field-label">About the School <span className="opt">(optional)</span></label>
                  <textarea {...register('description')} className="field-textarea" placeholder="Tell us about your school, vision, values…" />
                </div>
              </div>
            </div>

            {/* ── SECTION 2: Contact Info ── */}
            <div className="form-section fade-up-1">
              <div className="section-header">
                <div style={{ width:36, height:36, borderRadius:10, background:'#E6FFEE', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Phone size={16} color="#059669" />
                </div>
                <div>
                  <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, color:'#0B1D3A', fontSize:'.95rem' }}>Contact Information</p>
                  <p style={{ color:'#94A3B8', fontSize:'.72rem' }}>How to reach your school</p>
                </div>
              </div>
              <div className="section-body">
                <div className="field-grid-2">
                  <div>
                    <label className="field-label"><Mail size={11} color="#C9963A" /> Official Email <span className="req">*</span></label>
                    <input {...register('officialEmail')} type="email" className="field-input" placeholder="admin@yourschool.com" />
                    {errors.officialEmail && <p className="field-error"><AlertCircle size={11}/>{errors.officialEmail.message}</p>}
                  </div>
                  <div>
                    <label className="field-label"><Phone size={11} color="#C9963A" /> Phone Number <span className="opt">(optional)</span></label>
                    <input {...register('phoneNumber')} type="tel" className="field-input" placeholder="+234 800 000 0000" />
                  </div>
                </div>
                <div className="field-grid-2">
                  <div>
                    <label className="field-label"><MapPin size={11} color="#C9963A" /> Address <span className="opt">(optional)</span></label>
                    <input {...register('address')} className="field-input" placeholder="12 School Road, Lagos" />
                  </div>
                  <div>
                    <label className="field-label"><Globe size={11} color="#C9963A" /> Website <span className="opt">(optional)</span></label>
                    <input {...register('website')} type="url" className="field-input" placeholder="https://yourschool.com" />
                  </div>
                </div>
              </div>
            </div>

            {/* ── SECTION 3: Branding ── */}
            <div className="form-section fade-up-1">
              <div className="section-header">
                <div style={{ width:36, height:36, borderRadius:10, background:'#FFFBEB', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Upload size={16} color="#B45309" />
                </div>
                <div>
                  <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, color:'#0B1D3A', fontSize:'.95rem' }}>School Branding</p>
                  <p style={{ color:'#94A3B8', fontSize:'.72rem' }}>Logo and cover image</p>
                </div>
              </div>
              <div className="section-body">
                <div className="field-grid-2">
                  {/* Logo */}
                  <div>
                    <label className="field-label"><Upload size={11} color="#C9963A" /> School Logo <span className="opt">(max 2MB)</span></label>
                    <div className={`upload-zone ${logoFile ? 'has-file' : ''}`}>
                      <input type="file" accept="image/*" id="logo-upload" className="hidden" style={{ display:'none' }}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file && file.size <= 2*1024*1024) setLogoFile(file);
                          else if (file) alert('Logo must be under 2MB');
                        }} />
                      <label htmlFor="logo-upload" style={{ cursor:'pointer', display:'block' }}>
                        <Upload size={28} color={logoFile ? '#059669' : '#94A3B8'} style={{ margin:'0 auto .75rem' }} />
                        {logoFile
                          ? <p style={{ color:'#059669', fontWeight:600, fontSize:'.82rem' }}>✓ {logoFile.name}</p>
                          : <p style={{ color:'#94A3B8', fontSize:'.82rem' }}>Click to upload PNG / JPG</p>
                        }
                      </label>
                    </div>
                  </div>
                  {/* Cover */}
                  <div>
                    <label className="field-label"><Upload size={11} color="#C9963A" /> Cover Banner <span className="opt">(1600×400)</span></label>
                    <div className={`upload-zone ${coverFile ? 'has-file' : ''}`}>
                      <input type="file" accept="image/*" id="cover-upload" style={{ display:'none' }}
                        onChange={e => setCoverFile(e.target.files?.[0] || null)} />
                      <label htmlFor="cover-upload" style={{ cursor:'pointer', display:'block' }}>
                        <Upload size={28} color={coverFile ? '#059669' : '#94A3B8'} style={{ margin:'0 auto .75rem' }} />
                        {coverFile
                          ? <p style={{ color:'#059669', fontWeight:600, fontSize:'.82rem' }}>✓ {coverFile.name}</p>
                          : <p style={{ color:'#94A3B8', fontSize:'.82rem' }}>Click to upload banner</p>
                        }
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── SECTION 4: Academic Settings ── */}
            <div className="form-section fade-up-2">
              <div className="section-header">
                <div style={{ width:36, height:36, borderRadius:10, background:'#F3E8FF', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Settings size={16} color="#7C3AED" />
                </div>
                <div>
                  <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, color:'#0B1D3A', fontSize:'.95rem' }}>Academic Settings</p>
                  <p style={{ color:'#94A3B8', fontSize:'.72rem' }}>Grading system and term structure</p>
                </div>
              </div>
              <div className="section-body">
                <div className="field-grid-2">
                  <div>
                    <label className="field-label"><BookOpen size={11} color="#C9963A" /> Grading System</label>
                    <select {...register('gradingSystem.type')} className="field-select">
                      <option value="letter">Letter Grading (A–F)</option>
                      <option value="gpa">GPA Scale</option>
                      <option value="percentage">Percentage (0–100)</option>
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Terms per Year</label>
                    <input type="number" {...register('academicStructure.termsPerYear', { valueAsNumber:true })} min={1} max={4} className="field-input" />
                    {errors.academicStructure?.termsPerYear && <p className="field-error"><AlertCircle size={11}/>{errors.academicStructure.termsPerYear.message}</p>}
                  </div>
                </div>
                <label style={{ display:'flex', alignItems:'center', gap:'.75rem', cursor:'pointer', userSelect:'none' }}>
                  <input type="checkbox" {...register('academicStructure.usesSemesters')} className="custom-checkbox" />
                  <span style={{ color:'#0B1D3A', fontSize:'.88rem', fontWeight:500 }}>Uses Semesters instead of Terms</span>
                </label>
              </div>
            </div>

            {/* ── SECTION 5: Admin Account ── */}
            <div className="form-section fade-up-2">
              <div className="section-header">
                <div style={{ width:36, height:36, borderRadius:10, background:'#ECFEFF', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Lock size={16} color="#0E7490" />
                </div>
                <div>
                  <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, color:'#0B1D3A', fontSize:'.95rem' }}>Admin Account</p>
                  <p style={{ color:'#94A3B8', fontSize:'.72rem' }}>Login credentials for the school admin</p>
                </div>
              </div>
              <div className="section-body">
                <div className="field-grid-2">
                  <div>
                    <label className="field-label"><Mail size={11} color="#C9963A" /> Admin Email <span className="req">*</span></label>
                    <input {...register('adminEmail')} type="email" className="field-input" placeholder="admin@yourschool.com" />
                    {errors.adminEmail && <p className="field-error"><AlertCircle size={11}/>{errors.adminEmail.message}</p>}
                  </div>
                  <div>
                    <label className="field-label"><Lock size={11} color="#C9963A" /> Admin Password <span className="req">*</span></label>
                    <div className="pw-wrap">
                      <input {...register('adminPassword')} type={showPassword ? 'text' : 'password'} className="field-input" placeholder="••••••••••••" style={{ paddingRight:'4rem' }} />
                      <button type="button" className="pw-toggle" onClick={() => setShowPassword(v => !v)}>
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    {errors.adminPassword && <p className="field-error"><AlertCircle size={11}/>{errors.adminPassword.message}</p>}
                    <p style={{ fontSize:'.72rem', color:'#94A3B8', marginTop:'.4rem' }}>
                      Min 8 chars · uppercase · lowercase · number · special char
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── SUBMIT ── */}
            <div className="gold-divider" />
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? (
                <>
                  <div style={{ width:18, height:18, borderRadius:'50%', border:'2px solid rgba(255,255,255,.25)', borderTopColor:'#fff', animation:'spin .7s linear infinite', flexShrink:0 }} />
                  Registering School…
                </>
              ) : (
                <>Register School <ArrowRight size={18} /></>
              )}
            </button>

            <p style={{ textAlign:'center', color:'#94A3B8', fontSize:'.8rem', marginTop:'.5rem' }}>
              Already registered?{' '}
              <Link href="/school-login" style={{ color:'#C9963A', fontWeight:700, textDecoration:'none' }}>Login to your dashboard →</Link>
            </p>

          </form>
        </div>
      </div>

    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, School, Mail, Phone, MapPin, MessageSquare, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { contactMetadata } from '@/app/seo-metadata';


export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('https://formsubmit.co/ajax/Absadcompany@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...form, _subject: `[klas.ng] ${form.subject}` }),
      });
      if (!res.ok) throw new Error('Failed to send');
      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setStatus('error');
      setErrMsg('Failed to send message. Please email us directly at Absadcompany@gmail.com');
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'DM Sans',sans-serif", background: '#F0EFE9' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        .fade-up   { animation:fadeUp .55s ease both; }
        .fade-up-1 { animation:fadeUp .55s .1s ease both; }
        .fade-up-2 { animation:fadeUp .55s .2s ease both; }
        .gold-shimmer { background:linear-gradient(90deg,#C9963A 0%,#F0C060 40%,#C9963A 60%,#E8B85A 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 4s linear infinite; }
        .hero-dot-grid { background-image:radial-gradient(circle,rgba(201,150,58,.13) 1px,transparent 1px);background-size:28px 28px; }
        .field-label { display:block;font-size:.72rem;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:.07em;margin-bottom:.4rem; }
        .field-input { width:100%;padding:.85rem 1rem;border:1.5px solid #E2E8F0;border-radius:12px;font-family:'DM Sans',sans-serif;font-size:.9rem;color:#0B1D3A;background:#FAFAF8;outline:none;transition:border-color .2s,box-shadow .2s;box-sizing:border-box; }
        .field-input:focus { border-color:#C9963A;box-shadow:0 0 0 3px rgba(201,150,58,.12);background:#fff; }
        .field-input::placeholder { color:#CBD5E1; }
        .contact-link { display:flex;align-items:flex-start;gap:1rem;padding:1.25rem;border-radius:16px;border:1.5px solid #E2E8F0;background:#fff;text-decoration:none;transition:border-color .2s,box-shadow .2s; }
        .contact-link:hover { border-color:rgba(201,150,58,.35);box-shadow:0 4px 16px rgba(11,29,58,.08); }
        @media(max-width:768px){ .page-grid{grid-template-columns:1fr !important;} }
      `}</style>

      {/* Header */}
      <header style={{ background:'#0B1D3A', borderBottom:'2px solid rgba(201,150,58,.5)', padding:'.85rem 2rem', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:20 }}>
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:'.5rem', color:'#C9963A', textDecoration:'none', fontWeight:600, fontSize:'.85rem' }}>
          <ArrowLeft size={15} /> Home
        </Link>
        <div style={{ display:'flex', alignItems:'center', gap:'.75rem' }}>
          <div style={{ width:32, height:32, borderRadius:9, background:'linear-gradient(135deg,#C9963A,#E8B85A)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <School size={16} color="#0B1D3A" />
          </div>
          <span style={{ fontFamily:"'Playfair Display',serif", color:'#fff', fontWeight:700, fontSize:'.9rem' }}>Klas School Management Platform</span>
        </div>
        <div style={{ width:80 }} />
      </header>

      {/* Hero */}
      <div style={{ background:'#0B1D3A', position:'relative', overflow:'hidden' }}>
        <div className="hero-dot-grid" style={{ position:'absolute', inset:0 }} />
        <div style={{ position:'relative', maxWidth:700, margin:'0 auto', padding:'4rem 2rem 1.5rem', textAlign:'center' }} className="fade-up">
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(2rem,5vw,3.2rem)', fontWeight:800, color:'#fff', lineHeight:1.15, marginBottom:'.75rem' }}>
            Get In <span className="gold-shimmer">Touch</span>
          </h1>
          <p style={{ color:'#94A3B8', fontSize:'.95rem', lineHeight:1.7 }}>
            Have questions about klas.ng? We're here to help. Reach out via any channel below.
          </p>
        </div>
        <div style={{ height:24, background:'linear-gradient(to bottom,transparent,#F0EFE9)' }} />
      </div>

      <main style={{ flex:1, maxWidth:1000, width:'100%', margin:'0 auto', padding:'2.5rem 1.5rem 5rem' }}>
        <div className="page-grid fade-up-1" style={{ display:'grid', gridTemplateColumns:'1fr 1.4fr', gap:'2rem', alignItems:'start' }}>

          {/* Contact Info */}
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, color:'#0B1D3A', fontSize:'1.15rem', marginBottom:'.25rem' }}>Contact Information</h2>

            {/* Email */}
            <a href="mailto:Absadcompany@gmail.com" className="contact-link">
              <div style={{ width:42, height:42, borderRadius:11, background:'#F3E8FF', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Mail size={19} color="#7C3AED" />
              </div>
              <div>
                <p style={{ fontSize:'.68rem', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:'.2rem' }}>Email Us</p>
                <p style={{ color:'#7C3AED', fontWeight:600, fontSize:'.88rem' }}>Absadcompany@gmail.com</p>
                <p style={{ color:'#94A3B8', fontSize:'.75rem', marginTop:'.15rem' }}>We reply within 24 hours</p>
              </div>
            </a>

            {/* Phone */}
            <a href="tel:08061646919" className="contact-link">
              <div style={{ width:42, height:42, borderRadius:11, background:'#E6FFEE', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Phone size={19} color="#059669" />
              </div>
              <div>
                <p style={{ fontSize:'.68rem', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:'.2rem' }}>Call Us</p>
                <p style={{ color:'#059669', fontWeight:600, fontSize:'.88rem' }}>08061646919</p>
                <p style={{ color:'#059669', fontWeight:600, fontSize:'.88rem' }}>08029104796</p>
                <p style={{ color:'#94A3B8', fontSize:'.75rem', marginTop:'.15rem' }}>Mon – Fri, 8am – 6pm</p>
              </div>
            </a>

            {/* WhatsApp */}
            <a href="https://wa.me/2348029104796" target="_blank" rel="noopener noreferrer" className="contact-link">
              <div style={{ width:42, height:42, borderRadius:11, background:'#DCFCE7', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <MessageSquare size={19} color="#16A34A" />
              </div>
              <div>
                <p style={{ fontSize:'.68rem', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:'.2rem' }}>WhatsApp</p>
                <p style={{ color:'#16A34A', fontWeight:600, fontSize:'.88rem' }}>08029104796</p>
                <p style={{ color:'#94A3B8', fontSize:'.75rem', marginTop:'.15rem' }}>Chat with us instantly</p>
              </div>
            </a>

            {/* Address */}
            <div className="contact-link" style={{ cursor:'default' }}>
              <div style={{ width:42, height:42, borderRadius:11, background:'#EBF4FF', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <MapPin size={19} color="#1A56A0" />
              </div>
              <div>
                <p style={{ fontSize:'.68rem', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:'.2rem' }}>Office Address</p>
                <p style={{ color:'#0B1D3A', fontWeight:600, fontSize:'.88rem' }}>No. 7 Makurdi Road</p>
                <p style={{ color:'#475569', fontSize:'.85rem' }}>Funtua, Katsina State</p>
                <p style={{ color:'#475569', fontSize:'.85rem' }}>Nigeria</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div style={{ background:'#fff', borderRadius:24, border:'1px solid #E2E8F0', overflow:'hidden', boxShadow:'0 4px 24px rgba(11,29,58,.07)' }}>
            <div style={{ padding:'1.25rem 1.75rem', borderBottom:'1px solid #F1F5F9', background:'#FAFAF8', display:'flex', alignItems:'center', gap:'.75rem' }}>
              <div style={{ width:38, height:38, borderRadius:10, background:'#FEF3C7', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Send size={17} color="#C9963A" />
              </div>
              <div>
                <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, color:'#0B1D3A', fontSize:'.95rem' }}>Send a Message</p>
                <p style={{ color:'#94A3B8', fontSize:'.72rem' }}>We'll get back to you within 24 hours</p>
              </div>
            </div>

            <div style={{ padding:'1.75rem' }}>
              {status === 'success' ? (
                <div style={{ textAlign:'center', padding:'2.5rem 1rem' }}>
                  <div style={{ width:64, height:64, borderRadius:'50%', background:'#DCFCE7', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.25rem' }}>
                    <CheckCircle size={30} color="#16A34A" />
                  </div>
                  <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, color:'#0B1D3A', fontSize:'1.1rem', marginBottom:'.4rem' }}>Message Sent!</p>
                  <p style={{ color:'#64748B', fontSize:'.85rem', marginBottom:'1.5rem' }}>Thank you for reaching out. We'll reply within 24 hours.</p>
                  <button onClick={() => setStatus('idle')} style={{ background:'linear-gradient(135deg,#C9963A,#E8B85A)', color:'#0B1D3A', fontWeight:700, fontSize:'.85rem', padding:'.75rem 1.5rem', borderRadius:11, border:'none', cursor:'pointer' }}>
                    Send Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1.1rem' }}>
                  {status === 'error' && (
                    <div style={{ display:'flex', alignItems:'center', gap:'.6rem', background:'#FFF1F2', border:'1px solid #FECDD3', borderRadius:11, padding:'.8rem 1rem' }}>
                      <AlertCircle size={15} color="#E11D48" style={{ flexShrink:0 }} />
                      <p style={{ color:'#BE123C', fontSize:'.82rem' }}>{errMsg}</p>
                    </div>
                  )}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                    <div>
                      <label className="field-label">Your Name</label>
                      <input className="field-input" type="text" placeholder="Full name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                    </div>
                    <div>
                      <label className="field-label">Email</label>
                      <input className="field-input" type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
                    </div>
                  </div>
                  <div>
                    <label className="field-label">Subject</label>
                    <input className="field-input" type="text" placeholder="How can we help?" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="field-label">Message</label>
                    <textarea className="field-input" rows={5} placeholder="Tell us more about your school and what you need..." value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} required style={{ resize:'vertical' }} />
                  </div>
                  <button type="submit" disabled={status === 'sending'} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'.5rem', background:'linear-gradient(135deg,#C9963A,#E8B85A)', color:'#0B1D3A', fontWeight:700, fontSize:'.9rem', padding:'.95rem', borderRadius:13, border:'none', cursor:'pointer', boxShadow:'0 4px 16px rgba(201,150,58,.3)', opacity: status === 'sending' ? .7 : 1 }}>
                    {status === 'sending'
                      ? <><div style={{ width:16, height:16, borderRadius:'50%', border:'2px solid rgba(11,29,58,.2)', borderTopColor:'#0B1D3A', animation:'spin .7s linear infinite' }} /> Sending…</>
                      : <><Send size={15} /> Send Message</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer style={{ background:'#0B1D3A', borderTop:'1px solid rgba(201,150,58,.15)', padding:'1.25rem 2rem', textAlign:'center' }}>
        <p style={{ color:'#475569', fontSize:'.78rem' }}>© {new Date().getFullYear()} Absad Company Limited · <span style={{ color:'#C9963A', fontWeight:600 }}>klas.ng</span></p>
      </footer>
    </div>
  );
}

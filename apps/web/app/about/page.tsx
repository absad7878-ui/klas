'use client';

import Link from 'next/link';
import { ArrowRight, School, Users, Globe, Shield, Zap, Heart, CheckCircle, ArrowLeft } from 'lucide-react';
import { aboutMetadata } from '@/app/seo-metadata';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'DM Sans',sans-serif", background: '#F0EFE9' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        .fade-up   { animation:fadeUp .6s ease both; }
        .fade-up-1 { animation:fadeUp .6s .1s ease both; }
        .fade-up-2 { animation:fadeUp .6s .2s ease both; }
        .fade-up-3 { animation:fadeUp .6s .3s ease both; }
        .gold-shimmer { background:linear-gradient(90deg,#C9963A 0%,#F0C060 40%,#C9963A 60%,#E8B85A 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 4s linear infinite; }
        .hero-dot-grid { background-image:radial-gradient(circle,rgba(201,150,58,.13) 1px,transparent 1px);background-size:28px 28px; }
        .gold-divider { height:1px;background:linear-gradient(90deg,transparent,rgba(201,150,58,.4),transparent);margin:2rem 0; }
        .value-card { background:#fff;border:1px solid #E2E8F0;border-radius:20px;padding:2rem;transition:box-shadow .2s,transform .2s; }
        .value-card:hover { box-shadow:0 12px 36px rgba(11,29,58,.1);transform:translateY(-3px); }
        .team-stat { background:#fff;border:1px solid #E2E8F0;border-radius:16px;padding:1.5rem;text-align:center; }
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
        <Link href="/school-login" style={{ background:'linear-gradient(135deg,#C9963A,#E8B85A)', color:'#0B1D3A', fontWeight:700, fontSize:'.8rem', padding:'.45rem 1rem', borderRadius:9, textDecoration:'none' }}>
          Get Started
        </Link>
      </header>

      {/* Hero */}
      <div style={{ background:'#0B1D3A', position:'relative', overflow:'hidden' }}>
        <div className="hero-dot-grid absolute inset-0" style={{ position:'absolute', inset:0 }} />
        <div style={{ position:'absolute', top:-80, right:-60, width:320, height:320, borderRadius:'50%', background:'radial-gradient(circle,rgba(201,150,58,.15) 0%,transparent 65%)', pointerEvents:'none' }} />
        <div style={{ position:'relative', maxWidth:800, margin:'0 auto', padding:'5rem 2rem 4rem', textAlign:'center' }} className="fade-up">
          <div style={{ display:'inline-flex', alignItems:'center', gap:'.5rem', background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.15)', color:'#FCD34D', fontSize:'.75rem', fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', padding:'.4rem 1.1rem', borderRadius:999, marginBottom:'1.75rem' }}>
            🌍 Built for Africa
          </div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(2.2rem,5vw,3.8rem)', fontWeight:900, color:'#fff', lineHeight:1.1, marginBottom:'1.25rem' }}>
            About <span className="gold-shimmer">Klas School Management Platform</span>
          </h1>
          <p style={{ color:'#94A3B8', fontSize:'clamp(.95rem,2vw,1.1rem)', lineHeight:1.75, maxWidth:600, margin:'0 auto' }}>
            We are a Nigerian technology company building modern, affordable school management tools for African educational institutions.
          </p>
        </div>
        <div style={{ height:24, background:'linear-gradient(to bottom,transparent,#F0EFE9)' }} />
      </div>

      <main style={{ flex:1, maxWidth:1000, width:'100%', margin:'0 auto', padding:'3rem 1.5rem 5rem' }}>

        {/* Mission */}
        <div className="fade-up-1" style={{ background:'#fff', borderRadius:24, border:'1px solid #E2E8F0', padding:'2.5rem', marginBottom:'2rem', boxShadow:'0 2px 16px rgba(11,29,58,.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'.75rem', marginBottom:'1.25rem' }}>
            <div style={{ width:42, height:42, borderRadius:12, background:'#FEF3C7', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Heart size={20} color="#C9963A" />
            </div>
            <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, color:'#0B1D3A', fontSize:'1.1rem' }}>Our Mission</p>
          </div>
          <p style={{ color:'#475569', fontSize:'.95rem', lineHeight:1.8 }}>
            At <strong style={{ color:'#0B1D3A' }}>Absad Company Limited</strong>, we believe every school in Africa deserves access to powerful, easy-to-use management tools — regardless of size or budget. Our platform, <strong style={{ color:'#C9963A' }}>klas.ng</strong>, empowers school administrators, teachers, and parents with real-time information and seamless communication, replacing paper-based processes with a secure, digital solution built specifically for the Nigerian and African education system.
          </p>
          <div className="gold-divider" />
          <p style={{ color:'#475569', fontSize:'.95rem', lineHeight:1.8 }}>
            From a small primary school in Katsina to a large secondary school in Lagos — our platform scales to meet every institution's needs, with features covering student management, attendance tracking, exam results, fee collection, SMS notifications, and parent communication.
          </p>
        </div>

        {/* Stats */}
        <div className="fade-up-2" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'1rem', marginBottom:'2rem' }}>
          {[
            { value:'100%', label:'Nigerian Built', icon:'🇳🇬' },
            { value:'Free',  label:'To Get Started', icon:'🎓' },
            { value:'24/7',  label:'Platform Access', icon:'⚡' },
            { value:'₦8',    label:'Per SMS Credit',  icon:'💬' },
          ].map(({ value, label, icon }) => (
            <div key={label} className="team-stat">
              <div style={{ fontSize:'1.75rem', marginBottom:'.4rem' }}>{icon}</div>
              <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:800, color:'#0B1D3A', fontSize:'1.6rem', lineHeight:1.1 }}>{value}</p>
              <p style={{ color:'#94A3B8', fontSize:'.75rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'.06em', marginTop:'.25rem' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Values */}
        <div className="fade-up-2" style={{ marginBottom:'2rem' }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontWeight:800, color:'#0B1D3A', fontSize:'1.6rem', marginBottom:'1.5rem', textAlign:'center' }}>
            What We Stand For
          </h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:'1.25rem' }}>
            {[
              { icon: Shield,  color:'#1A56A0', bg:'#EBF4FF', title:'Security First',       desc:'Your school data is encrypted and protected. We never sell your information to third parties.' },
              { icon: Zap,     color:'#C9963A', bg:'#FEF3C7', title:'Built for Africa',     desc:'Designed with Nigerian schools in mind — local currency, local language, local support.' },
              { icon: Users,   color:'#059669', bg:'#E6FFEE', title:'Parents Included',     desc:'Parents get real-time access to their child\'s data without needing a login or technical skills.' },
              { icon: Globe,   color:'#7C3AED', bg:'#F3E8FF', title:'Always Available',     desc:'Cloud-based platform accessible from any device — phone, tablet, or computer.' },
            ].map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="value-card">
                <div style={{ width:46, height:46, borderRadius:13, background:bg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'1.1rem' }}>
                  <Icon size={22} color={color} />
                </div>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, color:'#0B1D3A', fontSize:'.95rem', marginBottom:'.5rem' }}>{title}</h3>
                <p style={{ color:'#64748B', fontSize:'.85rem', lineHeight:1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Company Info */}
        <div className="fade-up-3" style={{ background:'#0B1D3A', borderRadius:24, padding:'2.5rem', position:'relative', overflow:'hidden' }}>
          <div className="hero-dot-grid" style={{ position:'absolute', inset:0, opacity:.5 }} />
          <div style={{ position:'relative' }}>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontWeight:800, color:'#fff', fontSize:'1.4rem', marginBottom:'1rem' }}>
              About Absad Company Limited
            </h2>
            <p style={{ color:'#94A3B8', fontSize:'.9rem', lineHeight:1.8, marginBottom:'1.5rem' }}>
              Absad Company Limited is a Nigerian technology and education services company headquartered in Funtua, Katsina State. We are committed to developing digital solutions that transform how schools across Nigeria manage their operations, communicate with parents, and track student progress.
            </p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'.75rem' }}>
              {['Registered in Nigeria', 'Katsina State Based', 'Education Technology', 'SME Focused'].map(tag => (
                <span key={tag} style={{ background:'rgba(201,150,58,.15)', border:'1px solid rgba(201,150,58,.3)', color:'#F0C060', fontSize:'.72rem', fontWeight:700, padding:'.3rem .85rem', borderRadius:999 }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="fade-up-3" style={{ textAlign:'center', marginTop:'3rem' }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontWeight:800, color:'#0B1D3A', fontSize:'1.6rem', marginBottom:'.75rem' }}>
            Ready to Join Us?
          </h2>
          <p style={{ color:'#94A3B8', fontSize:'.9rem', marginBottom:'1.75rem' }}>Register your school today — it's free to get started.</p>
          <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
            <Link href="/register" style={{ display:'inline-flex', alignItems:'center', gap:'.5rem', background:'linear-gradient(135deg,#C9963A,#E8B85A)', color:'#0B1D3A', fontWeight:700, fontSize:'.9rem', padding:'.9rem 2rem', borderRadius:13, textDecoration:'none', boxShadow:'0 4px 16px rgba(201,150,58,.3)' }}>
              Register Your School <ArrowRight size={16} />
            </Link>
            <Link href="/contact" style={{ display:'inline-flex', alignItems:'center', gap:'.5rem', background:'#fff', color:'#0B1D3A', fontWeight:700, fontSize:'.9rem', padding:'.9rem 2rem', borderRadius:13, textDecoration:'none', border:'1.5px solid #E2E8F0' }}>
              Contact Us
            </Link>
          </div>
        </div>
      </main>

      <footer style={{ background:'#0B1D3A', borderTop:'1px solid rgba(201,150,58,.15)', padding:'1.25rem 2rem', textAlign:'center' }}>
        <p style={{ color:'#475569', fontSize:'.78rem' }}>© {new Date().getFullYear()} Absad Company Limited · <span style={{ color:'#C9963A', fontWeight:600 }}>klas.ng</span> · All rights reserved</p>
      </footer>
    </div>
  );
}

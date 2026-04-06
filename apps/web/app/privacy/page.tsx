'use client';

import Link from 'next/link';
import { ArrowLeft, School, Shield } from 'lucide-react';
import { privacyMetadata } from '@/app/seo-metadata';

export const metadata = privacyMetadata;
const LAST_UPDATED = 'January 1, 2025';

const sections = [
  {
    title: '1. Information We Collect',
    content: `We collect information you provide directly to us when registering a school or using our platform. This includes:

• School name, address, and contact details
• Administrator, teacher, and student profile information
• Attendance records, exam scores, and academic data
• Fee payment records and transaction references
• Parent contact information (phone numbers for SMS notifications)
• Login credentials (passwords are encrypted and never stored in plain text)

We also automatically collect certain technical information when you use our platform, including IP addresses, browser type, device information, and usage logs.`,
  },
  {
    title: '2. How We Use Your Information',
    content: `We use the information we collect to:

• Provide, maintain, and improve the klas.ng platform
• Process and manage school registrations and subscriptions
• Send SMS notifications to parents about student attendance and updates
• Generate report cards, attendance records, and academic reports
• Respond to support requests and customer service inquiries
• Send important service updates and platform announcements
• Comply with legal obligations and protect against fraud

We do not sell, rent, or share your personal information with third parties for marketing purposes.`,
  },
  {
    title: '3. Data Storage and Security',
    content: `Your data is stored on secure cloud servers. We implement industry-standard security measures including:

• Encrypted data transmission (HTTPS/SSL)
• Secure password hashing using industry-standard algorithms
• Regular security audits and vulnerability assessments
• Access controls limiting who can view sensitive school data
• Automatic backups to prevent data loss

While we take reasonable precautions, no method of transmission over the internet is 100% secure. We encourage you to use strong passwords and keep your login credentials confidential.`,
  },
  {
    title: '4. Data Sharing',
    content: `We only share your information in the following limited circumstances:

• With service providers who assist in operating our platform (e.g., SMS providers like Termii, payment processors like Paystack) — these providers are bound by confidentiality agreements
• When required by Nigerian law, court order, or government authority
• To protect the rights, property, or safety of Absad Company Limited, our users, or the public
• In connection with a merger, acquisition, or sale of assets — you will be notified of any such change

We never sell personal data to advertisers or data brokers.`,
  },
  {
    title: '5. Student Data',
    content: `We take the privacy of students especially seriously. Student data including names, attendance records, exam scores, and other academic information is:

• Only accessible to authorized school administrators and teachers of the relevant school
• Shared with parents only through the school's parent portal, using the student's unique ID
• Never used for advertising or profiling purposes
• Retained only as long as the school maintains an active account with us

Schools are responsible for obtaining necessary consent from parents or guardians before enrolling student data on the platform.`,
  },
  {
    title: '6. Your Rights',
    content: `You have the following rights regarding your personal data:

• Access: You can request a copy of the personal data we hold about you
• Correction: You can request correction of inaccurate or incomplete data
• Deletion: You can request deletion of your account and associated data
• Portability: You can request your data in a portable format
• Objection: You can object to certain types of data processing

To exercise any of these rights, contact us at Absadcompany@gmail.com. We will respond within 30 days.`,
  },
  {
    title: '7. Cookies',
    content: `We use essential cookies and local storage to maintain your login session and remember your preferences. We do not use tracking cookies or third-party advertising cookies. You can clear cookies at any time through your browser settings, though this will log you out of the platform.`,
  },
  {
    title: '8. Children\'s Privacy',
    content: `Our platform is designed for use by schools on behalf of students. School administrators are responsible for ensuring appropriate consent is obtained for students under 18. We do not knowingly collect personal information directly from children without institutional oversight from the school.`,
  },
  {
    title: '9. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. We will notify registered school administrators of significant changes by email. Continued use of the platform after changes constitutes acceptance of the updated policy. We encourage you to review this policy periodically.`,
  },
  {
    title: '10. Contact Us',
    content: `If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:

Absad Company Limited
No. 7 Makurdi Road, Funtua
Katsina State, Nigeria
Email: Absadcompany@gmail.com
Phone: 08061646919`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'DM Sans',sans-serif", background: '#F0EFE9' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        .fade-up { animation:fadeUp .5s ease both; }
        .gold-shimmer { background:linear-gradient(90deg,#C9963A 0%,#F0C060 40%,#C9963A 60%,#E8B85A 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 4s linear infinite; }
        .hero-dot-grid { background-image:radial-gradient(circle,rgba(201,150,58,.13) 1px,transparent 1px);background-size:28px 28px; }
        .section-card { background:#fff;border:1px solid #E2E8F0;border-radius:18px;padding:2rem;margin-bottom:1.25rem;box-shadow:0 2px 12px rgba(11,29,58,.05); }
        .section-title { fontFamily:"'Playfair Display',serif";font-weight:700;color:#0B1D3A;font-size:1.05rem;margin-bottom:1rem;padding-bottom:.65rem;border-bottom:1px solid #F1F5F9; }
        .section-content { color:#475569;font-size:.88rem;line-height:1.85;white-space:pre-line; }
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
          <div style={{ width:56, height:56, borderRadius:16, background:'rgba(201,150,58,.15)', border:'1px solid rgba(201,150,58,.25)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.25rem' }}>
            <Shield size={26} color="#C9963A" />
          </div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(1.9rem,5vw,3rem)', fontWeight:800, color:'#fff', lineHeight:1.15, marginBottom:'.75rem' }}>
            Privacy <span className="gold-shimmer">Policy</span>
          </h1>
          <p style={{ color:'#64748B', fontSize:'.85rem' }}>Last updated: {LAST_UPDATED}</p>
          <p style={{ color:'#94A3B8', fontSize:'.9rem', marginTop:'.5rem', lineHeight:1.7 }}>
            Absad Company Limited ("we", "our", "us") operates klas.ng. This policy explains how we collect, use, and protect your information.
          </p>
        </div>
        <div style={{ height:24, background:'linear-gradient(to bottom,transparent,#F0EFE9)' }} />
      </div>

      <main style={{ flex:1, maxWidth:800, width:'100%', margin:'0 auto', padding:'2.5rem 1.5rem 5rem' }}>
        {sections.map(({ title, content }) => (
          <div key={title} className="section-card">
            <h2 className="section-title" style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, color:'#0B1D3A', fontSize:'1.05rem', marginBottom:'1rem', paddingBottom:'.65rem', borderBottom:'1px solid #F1F5F9' }}>{title}</h2>
            <p className="section-content" style={{ color:'#475569', fontSize:'.88rem', lineHeight:1.85, whiteSpace:'pre-line' }}>{content}</p>
          </div>
        ))}
      </main>

      <footer style={{ background:'#0B1D3A', borderTop:'1px solid rgba(201,150,58,.15)', padding:'1.25rem 2rem', textAlign:'center' }}>
        <p style={{ color:'#475569', fontSize:'.78rem' }}>© {new Date().getFullYear()} Absad Company Limited · <span style={{ color:'#C9963A', fontWeight:600 }}>klas.ng</span> · All rights reserved</p>
      </footer>
    </div>
  );
}

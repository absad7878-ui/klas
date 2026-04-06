'use client';

import Link from 'next/link';
import { ArrowLeft, School, FileText } from 'lucide-react';
import { termsMetadata } from '@/app/seo-metadata';


const LAST_UPDATED = 'January 1, 2025';

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: `By registering a school, creating an account, or using any part of the klas.ng platform operated by Absad Company Limited, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.

These terms apply to all users including school administrators, teachers, and any other persons who access the platform on behalf of a registered school.`,
  },
  {
    title: '2. Description of Service',
    content: `klas.ng is a cloud-based school management platform that provides tools for:

• Student and teacher profile management
• Attendance tracking and reporting
• Examination scores and report card generation
• Fee management and payment tracking
• SMS notifications to parents via Termii
• Parent portal access using student IDs
• Announcements and school communication

We reserve the right to modify, suspend, or discontinue any part of the service at any time with reasonable notice.`,
  },
  {
    title: '3. Registration and Account',
    content: `To use the platform, you must register your school and create an administrator account. You agree to:

• Provide accurate and complete registration information
• Keep your login credentials confidential and secure
• Notify us immediately at Absadcompany@gmail.com if you suspect unauthorized access
• Be responsible for all activities that occur under your account
• Not share your administrator credentials with unauthorized persons

You must be at least 18 years old and authorized to act on behalf of the school to register an account.`,
  },
  {
    title: '4. Subscription and Payments',
    content: `Some features of klas.ng may require a paid subscription or credit purchase. By making a payment:

• SMS credits are purchased at ₦8 per credit and processed via Paystack
• Credits are non-refundable once purchased but never expire
• Subscription fees, if applicable, are billed in advance
• All prices are in Nigerian Naira (₦)
• Payments are subject to Paystack's terms and conditions

We reserve the right to change pricing with 30 days notice to registered school administrators.`,
  },
  {
    title: '5. Acceptable Use',
    content: `You agree to use klas.ng only for lawful purposes and in accordance with these Terms. You must NOT:

• Upload false, misleading, or fraudulent student or school information
• Use the platform to send spam or unsolicited messages to parents
• Attempt to gain unauthorized access to other schools' data
• Reverse engineer, copy, or redistribute any part of the platform
• Use automated tools to scrape or extract data from the platform
• Violate any applicable Nigerian laws or regulations

Violation of these terms may result in immediate account suspension without refund.`,
  },
  {
    title: '6. Data Ownership',
    content: `You retain ownership of all data you input into the platform, including student records, teacher profiles, and school information. By using the platform, you grant Absad Company Limited a limited license to store, process, and display your data solely for the purpose of providing the service.

We do not claim ownership of your school's data. Upon account termination, you may request an export of your data within 30 days.`,
  },
  {
    title: '7. Privacy',
    content: `Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference. By using klas.ng, you consent to our data practices as described in the Privacy Policy.

You are responsible for obtaining necessary consent from parents and guardians before uploading student information to the platform.`,
  },
  {
    title: '8. Intellectual Property',
    content: `The klas.ng platform, including its design, features, code, logos, and content, is the intellectual property of Absad Company Limited and is protected by Nigerian and international copyright laws.

You may not copy, reproduce, distribute, or create derivative works from any part of the platform without our prior written consent. The Klas School Management Platform name and klas.ng brand are trademarks of Absad Company Limited.`,
  },
  {
    title: '9. Limitation of Liability',
    content: `To the maximum extent permitted by Nigerian law, Absad Company Limited shall not be liable for:

• Loss of data due to technical failures beyond our reasonable control
• Indirect, incidental, or consequential damages arising from use of the platform
• Errors in SMS delivery due to network provider issues
• Losses arising from unauthorized access to your account due to your negligence

Our total liability to you for any claim shall not exceed the amount you paid us in the 3 months preceding the claim.`,
  },
  {
    title: '10. Service Availability',
    content: `We strive to maintain 99% uptime but do not guarantee uninterrupted access to the platform. Scheduled maintenance will be announced in advance. We are not liable for losses arising from platform downtime, whether scheduled or unscheduled.`,
  },
  {
    title: '11. Termination',
    content: `Either party may terminate the account at any time. Upon termination:

• Your access to the platform will be revoked
• Your data will be retained for 30 days to allow export requests
• After 30 days, your data will be permanently deleted
• No refunds will be issued for unused subscription periods or SMS credits

We may terminate accounts immediately without notice for violation of these Terms.`,
  },
  {
    title: '12. Governing Law',
    content: `These Terms of Service are governed by the laws of the Federal Republic of Nigeria. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the Nigerian courts.

If any provision of these terms is found to be unenforceable, the remaining provisions will continue in full force and effect.`,
  },
  {
    title: '13. Changes to Terms',
    content: `We reserve the right to update these Terms at any time. We will notify registered administrators by email at least 14 days before significant changes take effect. Continued use of the platform after changes take effect constitutes acceptance of the updated Terms.`,
  },
  {
    title: '14. Contact',
    content: `For questions about these Terms of Service, please contact us:

Absad Company Limited
No. 7 Makurdi Road, Funtua
Katsina State, Nigeria
Email: Absadcompany@gmail.com
Phone: 08061646919
WhatsApp: 08029104796`,
  },
];

export default function TermsPage() {
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
            <FileText size={26} color="#C9963A" />
          </div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(1.9rem,5vw,3rem)', fontWeight:800, color:'#fff', lineHeight:1.15, marginBottom:'.75rem' }}>
            Terms of <span className="gold-shimmer">Service</span>
          </h1>
          <p style={{ color:'#64748B', fontSize:'.85rem' }}>Last updated: {LAST_UPDATED}</p>
          <p style={{ color:'#94A3B8', fontSize:'.9rem', marginTop:'.5rem', lineHeight:1.7 }}>
            Please read these terms carefully before using the klas.ng platform provided by Absad Company Limited.
          </p>
        </div>
        <div style={{ height:24, background:'linear-gradient(to bottom,transparent,#F0EFE9)' }} />
      </div>

      <main style={{ flex:1, maxWidth:800, width:'100%', margin:'0 auto', padding:'2.5rem 1.5rem 5rem' }}>
        {/* Quick nav */}
        <div style={{ background:'#fff', borderRadius:18, border:'1px solid #E2E8F0', padding:'1.5rem', marginBottom:'1.5rem', boxShadow:'0 2px 12px rgba(11,29,58,.05)' }}>
          <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, color:'#0B1D3A', fontSize:'.9rem', marginBottom:'.85rem' }}>📋 Table of Contents</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'.4rem' }}>
            {sections.map(({ title }) => (
              <span key={title} style={{ background:'#F1F5F9', color:'#475569', fontSize:'.72rem', fontWeight:500, padding:'.25rem .65rem', borderRadius:20 }}>
                {title.split('.')[0]}.
              </span>
            ))}
          </div>
        </div>

        {sections.map(({ title, content }) => (
          <div key={title} className="section-card">
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, color:'#0B1D3A', fontSize:'1.05rem', marginBottom:'1rem', paddingBottom:'.65rem', borderBottom:'1px solid #F1F5F9' }}>{title}</h2>
            <p style={{ color:'#475569', fontSize:'.88rem', lineHeight:1.85, whiteSpace:'pre-line' }}>{content}</p>
          </div>
        ))}

        <div style={{ background:'#0B1D3A', borderRadius:18, padding:'1.75rem', textAlign:'center', marginTop:'1rem' }}>
          <p style={{ color:'#94A3B8', fontSize:'.85rem', marginBottom:'.75rem' }}>Questions about these terms?</p>
          <Link href="/contact" style={{ display:'inline-flex', alignItems:'center', gap:'.5rem', background:'linear-gradient(135deg,#C9963A,#E8B85A)', color:'#0B1D3A', fontWeight:700, fontSize:'.88rem', padding:'.75rem 1.75rem', borderRadius:11, textDecoration:'none' }}>
            Contact Us
          </Link>
        </div>
      </main>

      <footer style={{ background:'#0B1D3A', borderTop:'1px solid rgba(201,150,58,.15)', padding:'1.25rem 2rem', textAlign:'center' }}>
        <p style={{ color:'#475569', fontSize:'.78rem' }}>© {new Date().getFullYear()} Absad Company Limited · <span style={{ color:'#C9963A', fontWeight:600 }}>klas.ng</span> · All rights reserved</p>
      </footer>
    </div>
  );
}

'use client';

import Link from 'next/link';
import InstallButton from '@/components/InstallButton';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import { homepageMetadata } from '@/app/seo-metadata';
// Add this import at the top
import AdBanner from '@/components/AdBanner'

import {
  Search, GraduationCap, BookOpen,
  ArrowRight, MapPin, School, Users, Lock, Eye,
  CheckCircle, MessageSquare, BarChart3, Shield, Sparkles, X
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (searchQuery.length < 2) { setSuggestions([]); setShowDropdown(false); return; }
    const timer = setTimeout(async () => {
      setLoadingSuggestions(true); setError('');
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/schools/search?q=${encodeURIComponent(searchQuery)}`);
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        setSuggestions(data.schools || []);
        setShowDropdown(true);
      } catch {
        setError('Error searching schools'); setSuggestions([]);
      } finally { setLoadingSuggestions(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSchool = (school: any) => {
    setShowDropdown(false);
    setSearchQuery('');
    router.push(`/school/${school.id}`);
  };

  // ── Feature cards with image slots ──────────────────────────────────────
  // To add your screenshot: put the image in /public/screenshots/ and update the `img` field below.
  // Example: img: '/screenshots/students.png'
  // Leave img as null/empty to show the placeholder until you're ready.
  const features = [
    {
      num: '01',
      icon: <Users size={20} color="#C9963A" />,
      bg: 'rgba(201,150,58,.12)',
      title: 'Students & Classes',
      desc: 'Manage enrolment, class rosters, student profiles, and parent contacts from one dashboard.',
      img: '/screenshots/students.png',       // ← replace with your screenshot
      imgAlt: 'Students & Classes screenshot',
    },
    {
      num: '02',
      icon: <CheckCircle size={20} color="#4ADE80" />,
      bg: 'rgba(74,222,128,.1)',
      title: 'Attendance Tracking',
      desc: 'Take daily attendance with one tap. Auto SMS sent to parents when a child is absent.',
      img: '/screenshots/attendance.png',     // ← replace with your screenshot
      imgAlt: 'Attendance Tracking screenshot',
    },
    {
      num: '03',
      icon: <BookOpen size={20} color="#60A5FA" />,
      bg: 'rgba(96,165,250,.1)',
      title: 'Exam Results',
      desc: 'Enter scores, auto-calculate grades, and generate professional PDF report cards.',
      img: '/screenshots/results.png',        // ← replace with your screenshot
      imgAlt: 'Exam Results screenshot',
    },
    {
      num: '04',
      icon: <MessageSquare size={20} color="#FBBF24" />,
      bg: 'rgba(251,191,36,.1)',
      title: 'SMS to Parents',
      desc: 'Send fee reminders, attendance alerts, and updates directly to parents via SMS.',
      img: '/screenshots/sms.png',            // ← replace with your screenshot
      imgAlt: 'SMS to Parents screenshot',
    },
    {
      num: '05',
      icon: <BarChart3 size={20} color="#A78BFA" />,
      bg: 'rgba(167,139,250,.1)',
      title: 'Fee Management',
      desc: 'Track payments, outstanding balances, and generate fee reports for each term.',
      img: '/screenshots/fees.png',           // ← replace with your screenshot
      imgAlt: 'Fee Management screenshot',
    },
    {
      num: '06',
      icon: <Shield size={20} color="#34D399" />,
      bg: 'rgba(52,211,153,.1)',
      title: 'Secure & Private',
      desc: 'Your school data is encrypted and isolated. Each school only sees their own data.',
      img: '/screenshots/secure.png',         // ← replace with your screenshot
      imgAlt: 'Secure & Private screenshot',
    },
  ];

  return (
    <div>
    <JsonLd />
    <div style={{ minHeight:'100vh', width:'100%', overflowX:'hidden', background:'#060D1F', fontFamily:"'DM Sans', sans-serif", color:'#fff' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes shimmer   { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes spin      { to{transform:rotate(360deg)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        .gold { background:linear-gradient(90deg,#C9963A 0%,#F5D070 45%,#C9963A 60%,#E8B85A 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 5s linear infinite; }
        .display { font-family:'Cormorant Garamond',serif; }

        /* NAV */
        .nav { position:fixed;top:0;left:0;right:0;z-index:100;padding:1.1rem 1.5rem;transition:all .35s; }
        .nav.scrolled { background:rgba(6,13,31,.95);backdrop-filter:blur(24px);border-bottom:1px solid rgba(201,150,58,.12);padding:.75rem 1.5rem; }
        .nav-inner { max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between; }
        .nav-brand { display:flex;align-items:center;gap:.6rem;text-decoration:none; }
        .nav-logo { width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#C9963A,#E8B85A);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(201,150,58,.35); }
        .nav-links { display:flex;align-items:center;gap:1.75rem; }
        .nav-link { color:rgba(255,255,255,.5);font-size:.85rem;font-weight:500;text-decoration:none;transition:color .2s; }
        .nav-link:hover { color:#fff; }
        .nav-login { display:flex;align-items:center;gap:.4rem;background:rgba(201,150,58,.1);border:1px solid rgba(201,150,58,.3);color:#C9963A;font-weight:600;font-size:.82rem;padding:.5rem 1.1rem;border-radius:8px;text-decoration:none;transition:all .2s; }
        .nav-login:hover { background:rgba(201,150,58,.18); }
        @media(max-width:600px){ .nav-links{display:none;} }

        /* HERO */
        .hero { min-height:100svh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:7rem 1.25rem 4rem;text-align:center;position:relative;overflow:hidden; }
        .hero::before { content:'';position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 70% 50% at 50% -5%,rgba(201,150,58,.18) 0%,transparent 55%),radial-gradient(ellipse 40% 55% at 90% 80%,rgba(26,58,106,.45) 0%,transparent 55%); }
        .hero-grid { position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(201,150,58,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(201,150,58,.03) 1px,transparent 1px);background-size:70px 70px;mask-image:radial-gradient(ellipse 85% 75% at 50% 40%,black 0%,transparent 80%); }
        .hero-inner { position:relative;z-index:1;width:100%;max-width:760px;margin:0 auto; }
        .hero-badge { display:inline-flex;align-items:center;gap:.4rem;background:rgba(201,150,58,.08);border:1px solid rgba(201,150,58,.2);color:rgba(245,208,112,.85);font-size:.68rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;padding:.38rem .95rem;border-radius:999px;margin-bottom:1.75rem;animation:fadeIn .8s ease both; }
        .hero-h1 { font-family:'Cormorant Garamond',serif;font-size:clamp(3rem,10vw,7rem);font-weight:700;line-height:.95;letter-spacing:-.025em;margin-bottom:1.5rem;animation:fadeUp .8s .1s ease both; }
        .hero-sub { font-size:clamp(.88rem,2vw,1.05rem);color:rgba(255,255,255,.42);line-height:1.85;margin-bottom:2.25rem;max-width:440px;margin-left:auto;margin-right:auto;animation:fadeUp .8s .2s ease both; }

        /* SEARCH */
        .search-section { width:100%;max-width:560px;margin:0 auto;animation:fadeUp .8s .3s ease both;position:relative;z-index:50; }
        .search-field-wrap { position:relative; }
        .search-field { width:100%;padding:1rem 3.25rem 1rem 3.25rem;font-family:'DM Sans',sans-serif;font-size:.95rem;background:#0D1630;border:1.5px solid rgba(201,150,58,.35);border-radius:14px;color:#fff;outline:none;box-shadow:0 8px 40px rgba(0,0,0,.5);transition:all .3s; }
        .search-field::placeholder { color:rgba(255,255,255,.28); }
        .search-field:focus { border-color:rgba(201,150,58,.7);box-shadow:0 0 0 4px rgba(201,150,58,.1),0 8px 40px rgba(0,0,0,.5); }
        .search-left { position:absolute;left:1.1rem;top:50%;transform:translateY(-50%);color:rgba(255,255,255,.35);pointer-events:none; }
        .search-right { position:absolute;right:1rem;top:50%;transform:translateY(-50%);background:rgba(255,255,255,.08);border:none;color:rgba(255,255,255,.4);width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s; }
        .search-right:hover { background:rgba(255,255,255,.16);color:#fff; }
        .dropdown { position:absolute;top:calc(100% + 6px);left:0;right:0;background:#0A1628;border:1.5px solid rgba(201,150,58,.3);border-radius:16px;box-shadow:0 30px 80px rgba(0,0,0,.9),0 0 0 1px rgba(0,0,0,.5);overflow:hidden;animation:slideDown .2s ease both;z-index:9999;display:flex;flex-direction:column;max-height:340px; }
        .dropdown-scroll { overflow-y:auto;flex:1; }
        .dropdown-scroll::-webkit-scrollbar { width:4px; }
        .dropdown-scroll::-webkit-scrollbar-thumb { background:rgba(201,150,58,.3);border-radius:4px; }
        .dropdown-footer { border-top:1px solid rgba(201,150,58,.15);padding:.75rem 1.1rem;background:#0A1628;flex-shrink:0; }
        .create-school-btn { display:flex;align-items:center;justify-content:space-between;width:100%;padding:.65rem .85rem;background:linear-gradient(135deg,rgba(201,150,58,.12),rgba(201,150,58,.08));border:1px solid rgba(201,150,58,.25);border-radius:10px;cursor:pointer;text-decoration:none;transition:all .2s; }
        .create-school-btn:hover { background:linear-gradient(135deg,rgba(201,150,58,.2),rgba(201,150,58,.14));border-color:rgba(201,150,58,.45); }
        .dropdown-head { padding:.6rem 1.1rem;background:rgba(201,150,58,.1);border-bottom:1px solid rgba(201,150,58,.15);display:flex;align-items:center;gap:.4rem; }
        .dropdown-head span { font-size:.66rem;font-weight:700;color:#C9963A;text-transform:uppercase;letter-spacing:.1em; }
        .suggestion { width:100%;padding:.9rem 1.1rem;display:flex;align-items:center;gap:.85rem;text-align:left;background:#0A1628;border:none;cursor:pointer;transition:background .15s;font-family:'DM Sans',sans-serif;border-bottom:1px solid rgba(255,255,255,.05); }
        .suggestion:last-child { border-bottom:none; }
        .suggestion:hover { background:#0F1E35; }
        .sug-logo { width:44px;height:44px;border-radius:11px;background:#0D1D35;border:1px solid rgba(201,150,58,.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden; }
        .sug-name { font-weight:700;color:#fff;font-size:.92rem;margin-bottom:.15rem; }
        .sug-url { font-size:.72rem;color:#C9963A;font-weight:600; }
        .sug-addr { font-size:.7rem;color:rgba(255,255,255,.35);display:flex;align-items:center;gap:3px;margin-top:.1rem; }
        .drop-empty { padding:2rem 1.25rem;text-align:center;background:#0A1628; }
        .drop-loading { padding:1.75rem;text-align:center;background:#0A1628; }

        /* CTA BUTTONS */
        .hero-ctas { display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center;margin-top:1.75rem;animation:fadeUp .8s .45s ease both;position:relative;z-index:1; }
        .btn-gold { display:inline-flex;align-items:center;gap:.5rem;background:linear-gradient(135deg,#C9963A,#E8B85A);color:#0B1D3A;font-weight:700;font-size:.88rem;padding:.82rem 1.8rem;border-radius:11px;text-decoration:none;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;box-shadow:0 6px 24px rgba(201,150,58,.32);transition:all .25s;white-space:nowrap; }
        .btn-gold:hover { transform:translateY(-2px);box-shadow:0 10px 32px rgba(201,150,58,.48); }
        .btn-outline { display:inline-flex;align-items:center;gap:.5rem;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.13);color:rgba(255,255,255,.72);font-weight:500;font-size:.88rem;padding:.82rem 1.6rem;border-radius:11px;text-decoration:none;transition:all .25s;white-space:nowrap; }
        .btn-outline:hover { background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.24); }

        /* PILLS */
        .hero-pills { display:flex;flex-wrap:wrap;justify-content:center;gap:.55rem;margin-top:1.5rem;animation:fadeUp .8s .55s ease both; }
        .pill { display:inline-flex;align-items:center;gap:.32rem;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);color:rgba(255,255,255,.38);font-size:.73rem;padding:.3rem .85rem;border-radius:999px; }

        /* STATS */
        .stats { background:rgba(255,255,255,.02);border-top:1px solid rgba(255,255,255,.04);border-bottom:1px solid rgba(255,255,255,.04);padding:3rem 1.5rem; }
        .stats-inner { max-width:860px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;text-align:center; }
        .stat-num { font-family:'Cormorant Garamond',serif;font-size:clamp(1.9rem,4vw,2.8rem);font-weight:700;color:#C9963A;line-height:1; }
        .stat-label { color:rgba(255,255,255,.28);font-size:.68rem;font-weight:600;text-transform:uppercase;letter-spacing:.1em;margin-top:.35rem; }
        @media(max-width:540px){ .stats-inner{grid-template-columns:1fr 1fr;} }

        /* SECTION HELPERS */
        .section-eye { font-size:.68rem;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#C9963A;display:block;text-align:center;margin-bottom:.75rem; }
        .section-h { font-family:'Cormorant Garamond',serif;font-size:clamp(2rem,5vw,3.5rem);font-weight:700;text-align:center;line-height:1.05;margin-bottom:.6rem; }
        .section-s { color:rgba(255,255,255,.32);font-size:.92rem;text-align:center;line-height:1.75; }

        /* ── FEATURES WITH SCREENSHOTS ── */
        .features { padding:6rem 1.5rem;position:relative; }
        .features-grid { max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem; }

        .feat-card {
          background:#0C1525;
          border:1px solid rgba(255,255,255,.07);
          border-radius:20px;
          overflow:hidden;
          display:flex;
          flex-direction:column;
          transition:transform .3s,border-color .3s,box-shadow .3s;
          position:relative;
        }
        .feat-card:hover {
          transform:translateY(-4px);
          border-color:rgba(201,150,58,.25);
          box-shadow:0 20px 50px rgba(0,0,0,.5);
        }

        /* Screenshot area */
        .feat-img-wrap {
          width:100%;
          aspect-ratio:16/9;
          background:#080F1E;
          border-bottom:1px solid rgba(255,255,255,.05);
          overflow:hidden;
          position:relative;
          flex-shrink:0;
        }
        .feat-img-wrap img {
          width:100%;
          height:100%;
          object-fit:cover;
          object-position:top;
          display:block;
          transition:transform .4s ease;
        }
        .feat-card:hover .feat-img-wrap img { transform:scale(1.03); }

        /* Placeholder when no screenshot yet */
        .feat-placeholder {
          width:100%;
          height:100%;
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          gap:.6rem;
          background:linear-gradient(135deg,#080F1E,#0D1A2E);
        }
        .feat-placeholder-icon {
          width:48px;height:48px;border-radius:13px;
          display:flex;align-items:center;justify-content:center;
          border:1px dashed rgba(201,150,58,.3);
        }
        .feat-placeholder p {
          color:rgba(255,255,255,.18);
          font-size:.72rem;
          font-weight:500;
          text-align:center;
          padding:0 1rem;
          line-height:1.5;
        }

        /* Card body */
        .feat-body { padding:1.4rem 1.5rem 1.6rem; }
        .feat-num { font-family:'Cormorant Garamond',serif;font-size:2.8rem;font-weight:700;color:rgba(201,150,58,.1);position:absolute;top:.5rem;right:1rem;line-height:1;pointer-events:none; }
        .feat-icon-wrap { width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:.85rem; }
        .feat-title { font-family:'Cormorant Garamond',serif;font-size:1.15rem;font-weight:700;color:#fff;margin-bottom:.4rem; }
        .feat-desc { color:rgba(255,255,255,.35);font-size:.82rem;line-height:1.72; }

        @media(max-width:900px) { .features-grid{grid-template-columns:repeat(2,1fr);} }
        @media(max-width:560px) { .features-grid{grid-template-columns:1fr;} }

        /* PORTALS */
        .portals { padding:6rem 1.5rem;background:rgba(255,255,255,.015); }
        .portals-grid { max-width:1060px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:1.1rem; }
        .portal { border-radius:20px;padding:2.25rem 1.75rem;display:flex;flex-direction:column;position:relative;overflow:hidden;transition:transform .3s;border:1px solid rgba(255,255,255,.07); }
        .portal:hover { transform:translateY(-4px); }
        .portal-admin { background:linear-gradient(145deg,#0C1A35,#091225);border-color:rgba(201,150,58,.22); }
        .portal-other { background:linear-gradient(145deg,#080F1E,#060C18); }
        .portal-glow { position:absolute;top:-70px;right:-70px;width:200px;height:200px;border-radius:50%;pointer-events:none; }
        .portal-icon { width:50px;height:50px;border-radius:13px;display:flex;align-items:center;justify-content:center;margin-bottom:1.4rem; }
        .portal-title { font-family:'Cormorant Garamond',serif;font-size:1.35rem;font-weight:700;margin-bottom:.45rem; }
        .portal-desc { font-size:.84rem;line-height:1.72;flex:1;margin-bottom:1.75rem;color:rgba(255,255,255,.36); }
        .pcta-gold { display:inline-flex;align-items:center;gap:.4rem;background:linear-gradient(135deg,#C9963A,#E8B85A);color:#0B1D3A;font-weight:700;font-size:.84rem;padding:.75rem 1.4rem;border-radius:10px;text-decoration:none;box-shadow:0 4px 16px rgba(201,150,58,.28);transition:all .2s; }
        .pcta-gold:hover { transform:translateY(-1px); }
        .pcta-dark { display:inline-flex;align-items:center;gap:.4rem;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.72);font-weight:600;font-size:.84rem;padding:.75rem 1.4rem;border-radius:10px;text-decoration:none;transition:all .2s; }
        .pcta-dark:hover { background:rgba(255,255,255,.11); }
        @media(max-width:780px){ .portals-grid{grid-template-columns:1fr;max-width:400px;} }

        /* CTA BANNER */
        .cta-section { padding:7rem 1.5rem;text-align:center;position:relative;overflow:hidden; }
        .cta-section::before { content:'';position:absolute;inset:0;background:radial-gradient(ellipse 55% 55% at 50% 50%,rgba(201,150,58,.07) 0%,transparent 65%);pointer-events:none; }
        .cta-h { font-family:'Cormorant Garamond',serif;font-size:clamp(2.4rem,7vw,5rem);font-weight:700;line-height:1.0;margin-bottom:1.1rem; }
        .cta-sub { color:rgba(255,255,255,.35);font-size:.95rem;line-height:1.8;margin-bottom:2.75rem;max-width:420px;margin-left:auto;margin-right:auto; }

        /* FOOTER */
        .footer { background:#030810;border-top:1px solid rgba(255,255,255,.04);padding:4rem 1.5rem 2rem; }
        .footer-grid { max-width:1100px;margin:0 auto;display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:3rem;margin-bottom:3rem; }
        .footer-link { color:rgba(255,255,255,.25);text-decoration:none;font-size:.83rem;display:block;margin-bottom:.5rem;transition:color .2s; }
        .footer-link:hover { color:#C9963A; }
        .footer-head { color:rgba(255,255,255,.38);font-weight:700;font-size:.68rem;text-transform:uppercase;letter-spacing:.12em;margin-bottom:.9rem; }
        .footer-bottom { max-width:1100px;margin:0 auto;border-top:1px solid rgba(255,255,255,.04);padding-top:1.4rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.5rem; }
        @media(max-width:680px){ .footer-grid{grid-template-columns:1fr 1fr;gap:2rem;} }
        @media(max-width:380px){ .footer-grid{grid-template-columns:1fr;} }
        @media(max-width:480px){ .search-field{font-size:.88rem;} .hero-ctas{gap:.6rem;} .btn-gold,.btn-outline{font-size:.82rem;padding:.75rem 1.25rem;} }
      `}</style>

      {/* NAV */}
      <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-inner">
          <Link href="/" className="nav-brand">
            <div className="nav-logo" style={{ overflow:'hidden', padding:0 }}>
              <img src="/logo.png" alt="klas.ng" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:10 }} />
            </div>
            <span className="display" style={{ color:'#fff', fontWeight:700, fontSize:'1rem' }}>klas.ng</span>
          </Link>
          <div className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#portals"  className="nav-link">Portals</a>
          </div>
          <Link href="/school-login" className="nav-login">
            <Lock size={12} /> Login
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-grid" />
        <div className="hero-inner">
          <div className="hero-badge"><Sparkles size={10} /> Built for Modern Schools</div>
          <h1 className="hero-h1">Run Your<br />School <span className="gold">Smarter</span></h1>
          <p className="hero-sub">Attendance, fees, SMS to parents, exam results — Everything your school needs to run smoothly — in one simple platform.</p>

          <div className="search-section" ref={searchWrapRef}>
            <div className="search-field-wrap">
              <Search size={17} className="search-left" />
              <input ref={inputRef} type="text" value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
                placeholder="Find your school by name or subdomain…"
                className="search-field" />
              {searchQuery && (
                <button className="search-right" onClick={() => { setSearchQuery(''); setSuggestions([]); setShowDropdown(false); }}>
                  <X size={13} />
                </button>
              )}
              {showDropdown && searchQuery.length >= 2 && (
                <div className="dropdown">
                  <div className="dropdown-head">
                    <Search size={11} color="#C9963A" /><span>Search Results</span>
                  </div>
                  <div className="dropdown-scroll">
                    {loadingSuggestions ? (
                      <div className="drop-loading">
                        <div style={{ width:22, height:22, borderRadius:'50%', border:'2.5px solid rgba(201,150,58,.2)', borderTopColor:'#C9963A', animation:'spin .8s linear infinite', margin:'0 auto .65rem' }} />
                        <p style={{ color:'rgba(255,255,255,.35)', fontSize:'.85rem' }}>Searching…</p>
                      </div>
                    ) : error ? (
                      <div className="drop-empty" style={{ color:'#F87171' }}>{error}</div>
                    ) : suggestions.length === 0 ? (
                      <div className="drop-empty">
                        <p style={{ color:'rgba(255,255,255,.4)', fontSize:'.88rem' }}>No schools found for "<strong style={{ color:'#fff' }}>{searchQuery}</strong>"</p>
                      </div>
                    ) : (
                      suggestions.map((school: any) => (
                        <button key={school.id} onClick={() => handleSelectSchool(school)} className="suggestion">
                          <div className="sug-logo">
                            {school.logoUrl ? <img src={school.logoUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <School size={18} color="#C9963A" />}
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <p className="sug-name">{school.name}</p>
                            {school.subdomain && <p className="sug-url">{school.subdomain}.klas.ng</p>}
                            {school.address && <p className="sug-addr"><MapPin size={10} />{school.address}</p>}
                          </div>
                          <ArrowRight size={15} color="rgba(255,255,255,.25)" style={{ flexShrink:0 }} />
                        </button>
                      ))
                    )}
                  </div>
                  <div className="dropdown-footer">
                    <Link href="/register" className="create-school-btn" onClick={() => setShowDropdown(false)}>
                      <div style={{ display:'flex', alignItems:'center', gap:'.6rem' }}>
                        <div style={{ width:30, height:30, borderRadius:8, background:'linear-gradient(135deg,#C9963A,#E8B85A)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <School size={14} color="#0B1D3A" />
                        </div>
                        <div>
                          <p style={{ color:'#C9963A', fontWeight:700, fontSize:'.84rem', margin:0 }}>Create Your School</p>
                          <p style={{ color:'rgba(255,255,255,.35)', fontSize:'.72rem', margin:0 }}>Register free — takes less than 5 minutes</p>
                        </div>
                      </div>
                      <ArrowRight size={15} color="#C9963A" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="hero-ctas">
            <Link href="/school-login"  className="btn-gold"><Lock size={14} /> Admin Login</Link>
            <Link href="/teacher-login" className="btn-outline"><GraduationCap size={14} /> Teacher Login</Link>
            <Link href="/parent/view"   className="btn-outline"><Eye size={14} /> Parent Portal</Link>
          </div>

          <div style={{ marginTop:'1rem', animation:'fadeUp .8s .5s ease both', display:'flex', justifyContent:'center' }}>
            <Link href="/register" style={{ display:'inline-flex', alignItems:'center', gap:'.75rem', background:'rgba(255,255,255,.03)', border:'1px dashed rgba(201,150,58,.35)', borderRadius:'14px', padding:'.75rem 1.5rem', textDecoration:'none', transition:'all .25s' }}
              onMouseOver={e => { (e.currentTarget as HTMLElement).style.background='rgba(201,150,58,.07)'; (e.currentTarget as HTMLElement).style.borderColor='rgba(201,150,58,.6)'; }}
              onMouseOut={e =>  { (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,.03)'; (e.currentTarget as HTMLElement).style.borderColor='rgba(201,150,58,.35)'; }}>
              <div style={{ width:32, height:32, borderRadius:9, background:'linear-gradient(135deg,#C9963A,#E8B85A)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 4px 12px rgba(201,150,58,.3)' }}>
                <School size={15} color="#0B1D3A" />
              </div>
              <div style={{ textAlign:'left' }}>
                <p style={{ color:'#C9963A', fontWeight:700, fontSize:'.88rem', margin:0, lineHeight:1.2 }}>Create Your School</p>
                <p style={{ color:'rgba(255,255,255,.35)', fontSize:'.73rem', margin:0 }}>Free 14-day trial · No credit card needed</p>
              </div>
              <ArrowRight size={15} color="rgba(201,150,58,.6)" />
            </Link>
          </div>

          <div className="hero-pills">
            {['Free 14-day trial','No credit card','SMS notifications','Instant setup'].map(p => (
              <span key={p} className="pill"><span style={{ color:'#C9963A', fontSize:'.6rem' }}>✓</span>{p}</span>
            ))}
          </div>
          <div style={{ marginTop:'1.5rem' }}><InstallButton /></div>
        </div>
      </section>

      {/* STATS */}
      <div className="stats">
        <div className="stats-inner">
          {[{num:'500+',label:'Schools'},{num:'50K+',label:'Students'},{num:'98%',label:'Uptime'},{num:'24/7',label:'Support'}].map(s => (
            <div key={s.label}>
              <div className="stat-num">{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

       <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem' }}>
        <AdBanner adSlot="3117282804" />
      </div>

      {/* ── FEATURES WITH SCREENSHOTS ── */}
      <section className="features" id="features">
        <span className="section-eye">What We Offer</span>
        <h2 className="section-h display" style={{ marginBottom:'.6rem' }}>Everything in <span className="gold">One Place</span></h2>
        <p className="section-s" style={{ marginBottom:'3.5rem' }}>Built specifically for Nigerian schools — no complexity, just results.</p>

        <div className="features-grid">
          {features.map(({ num, icon, bg, title, desc, img, imgAlt }) => (
            <div key={title} className="feat-card">
              <div className="feat-num">{num}</div>

              {/* Screenshot / placeholder */}
              <div className="feat-img-wrap">
                {img ? (
                  <img src={img} alt={imgAlt} />
                ) : (
                  <div className="feat-placeholder">
                    <div className="feat-placeholder-icon" style={{ background: bg }}>
                      {icon}
                    </div>
                    <p>Screenshot coming soon<br/>Add image to /public/screenshots/</p>
                  </div>
                )}
              </div>

              {/* Card body */}
              <div className="feat-body">
                <div className="feat-icon-wrap" style={{ background: bg }}>{icon}</div>
                <h3 className="feat-title">{title}</h3>
                <p className="feat-desc">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>


       <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem 1.5rem' }}>
        <AdBanner adSlot="3117282804" adFormat="horizontal" />
      </div>

      {/* PORTALS */}
      <section className="portals" id="portals">
        <span className="section-eye">Access Portals</span>
        <h2 className="section-h display" style={{ marginBottom:'.6rem' }}>Your Role, <span className="gold">Your Portal</span></h2>
        <p className="section-s" style={{ marginBottom:'3.5rem' }}>Secure, role-based access for every member of your school.</p>
        <div className="portals-grid">
          <div className="portal portal-admin">
            <div className="portal-glow" style={{ background:'radial-gradient(circle,rgba(201,150,58,.15) 0%,transparent 70%)' }} />
            <div className="portal-icon" style={{ background:'rgba(201,150,58,.12)', border:'1px solid rgba(201,150,58,.2)' }}><School size={22} color="#C9963A" /></div>
            <p className="portal-title display" style={{ color:'#fff' }}>School Admin</p>
            <p className="portal-desc">Full control — students, fees, results, SMS, and detailed reports for your entire school.</p>
            <Link href="/school-login" className="pcta-gold"><Lock size={12} /> Admin Login <ArrowRight size={12} /></Link>
          </div>
          <div className="portal portal-other">
            <div className="portal-glow" style={{ background:'radial-gradient(circle,rgba(96,165,250,.12) 0%,transparent 70%)' }} />
            <div className="portal-icon" style={{ background:'rgba(96,165,250,.1)', border:'1px solid rgba(96,165,250,.12)' }}><GraduationCap size={22} color="#60A5FA" /></div>
            <p className="portal-title display" style={{ color:'#fff' }}>Teachers</p>
            <p className="portal-desc">Take attendance, enter exam scores, manage assignments, and track your students daily.</p>
            <Link href="/teacher-login" className="pcta-dark"><Lock size={12} /> Teacher Login <ArrowRight size={12} /></Link>
          </div>
          <div className="portal portal-other">
            <div className="portal-glow" style={{ background:'radial-gradient(circle,rgba(52,211,153,.1) 0%,transparent 70%)' }} />
            <div className="portal-icon" style={{ background:'rgba(52,211,153,.1)', border:'1px solid rgba(52,211,153,.12)' }}><Users size={22} color="#34D399" /></div>
            <p className="portal-title display" style={{ color:'#fff' }}>Parents</p>
            <p className="portal-desc">View your child's attendance, fees, results, and report cards instantly.</p>
            <Link href="/parent/login" className="pcta-dark"><Eye size={12} /> Parent Portal <ArrowRight size={12} /></Link>
          </div>
        </div>
      </section>

         <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem 1.5rem' }}>
        <AdBanner adSlot="3117282804" adFormat="rectangle" />
      </div>

      {/* CTA */}
      <section className="cta-section">
        <div style={{ position:'relative', zIndex:1 }}>
          <span className="section-eye" style={{ marginBottom:'1.25rem', display:'block' }}>Get Started</span>
          <h2 className="cta-h display">Transform Your<br /><span className="gold">School Today</span></h2>
          <p className="cta-sub">Join hundreds of Nigerian schools already running smarter with klas.ng</p>
          <Link href="/register" className="btn-gold" style={{ fontSize:'.95rem', padding:'1rem 2.5rem', boxShadow:'0 8px 36px rgba(201,150,58,.38)' }}>
            Start Free Today <ArrowRight size={17} />
          </Link>
          <p style={{ color:'rgba(255,255,255,.2)', fontSize:'.78rem', marginTop:'1.25rem' }}>No setup fees · No long contracts · Cancel anytime</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'.6rem', marginBottom:'.9rem' }}>
              <div style={{ width:30, height:30, borderRadius:8, background:'linear-gradient(135deg,#C9963A,#E8B85A)', display:'flex', alignItems:'center', justifyContent:'center' }}><School size={14} color="#0B1D3A" /></div>
              <span className="display" style={{ color:'#fff', fontWeight:700, fontSize:'1rem' }}>klas.ng</span>
            </div>
            <p style={{ color:'rgba(255,255,255,.2)', fontSize:'.82rem', lineHeight:1.75, maxWidth:250 }}>Modern school management for Nigerian schools. Simple, affordable, effective.</p>
          </div>
          <div>
            <p className="footer-head">Platform</p>
            <Link href="/register"      className="footer-link">Register School</Link>
            <Link href="/school-login"  className="footer-link">Admin Login</Link>
            <Link href="/teacher-login" className="footer-link">Teacher Login</Link>
            <Link href="/parent/login"  className="footer-link">Parent Portal</Link>
          </div>
          <div>
            <p className="footer-head">Company</p>
            <Link href="/about"   className="footer-link">About Us</Link>
            <Link href="/contact" className="footer-link">Contact</Link>
          </div>
          <div>
            <p className="footer-head">Legal</p>
            <Link href="/privacy" className="footer-link">Privacy Policy</Link>
            <Link href="/terms"   className="footer-link">Terms of Service</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p style={{ color:'rgba(255,255,255,.16)', fontSize:'.78rem' }}>© {new Date().getFullYear()} Klas School Management Platform</p>
          <p style={{ color:'rgba(255,255,255,.12)', fontSize:'.76rem' }}>Built with ❤️ for education in Africa</p>
        </div>
      </footer>
    </div>
      </div>
  );
}

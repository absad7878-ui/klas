// apps/web/app/s/[slug]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import SchoolProfileClient from './SchoolProfileClient';

export default function SchoolSubdomainPage() {
  const { slug } = useParams<{ slug: string }>();
  const [school, setSchool] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    fetch(`${API}/public/school/${slug}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => { setSchool(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B1D3A' }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid rgba(201,150,58,.2)', borderTopColor: '#C9963A', animation: 'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return <SchoolProfileClient school={school} subdomain={slug} />;
}

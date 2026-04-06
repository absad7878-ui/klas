// apps/web/app/sitemap.ts
// Next.js dynamic sitemap — auto-updates lastmod date
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base    = 'https://www.klas.ng';
  const today   = new Date().toISOString();

  return [
    { url: `${base}/`,              lastModified: today, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${base}/register`,      lastModified: today, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/school-login`,  lastModified: today, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/teacher-login`, lastModified: today, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/parent/login`,  lastModified: today, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/about`,         lastModified: today, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/contact`,       lastModified: today, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/privacy`,       lastModified: today, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${base}/terms`,         lastModified: today, changeFrequency: 'yearly',  priority: 0.3 },
  ];
}
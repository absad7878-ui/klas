// apps/web/app/robots.ts
// Next.js dynamic robots.txt
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow:     ['/', '/register', '/school-login', '/teacher-login', '/parent/login', '/about', '/contact', '/privacy', '/terms'],
        disallow:  ['/dashboard/', '/teacher/', '/parent/dashboard', '/parent/student/', '/api/'],
      },
    ],
    sitemap: 'https://www.klas.ng/sitemap.xml',
  };
}
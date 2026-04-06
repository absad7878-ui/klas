// apps/web/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.klas.ng'),

  title: {
    default:  'Klas — Affordable School Management System in Nigeria',
    template: '%s | Klas School Management',
  },

  description: 'Klas.ng is a simple and affordable school management system for Nigerian schools. Manage students, attendance, fees, exam results, and SMS notifications — all in one platform.',

  keywords: [
    'school management system Nigeria',
    'school software Nigeria',
    'affordable school SaaS Nigeria',
    'student management system',
    'school fees management Nigeria',
    'attendance tracking Nigeria',
    'school SMS Nigeria',
    'report card software Nigeria',
    'private school software Nigeria',
    'klas.ng',
  ],

  authors: [{ name: 'Klas', url: 'https://www.klas.ng' }],
  creator:  'Klas School Management Platform',
  publisher: 'Klas',

  openGraph: {
    type:        'website',
    locale:      'en_NG',
    url:         'https://www.klas.ng',
    siteName:    'Klas School Management',
    title:       'Klas — Affordable School Management System in Nigeria',
    description: 'Manage students, attendance, fees, and exam results for your Nigerian school — all in one simple platform. Start free for 14 days.',
    images: [
      {
        url:    '/og-image.png',  // Create a 1200×630px image and put in /public/
        width:  1200,
        height: 630,
        alt:    'Klas School Management Platform',
      },
    ],
  },

  twitter: {
    card:        'summary_large_image',
    title:       'Klas — School Management System for Nigerian Schools',
    description: 'Attendance, fees, SMS, exam results — everything your school needs in one platform.',
    images:      ['/og-image.png'],
    creator:     '@klasng',
  },

  robots: {
    index:          true,
    follow:         true,
    googleBot: {
      index:             true,
      follow:            true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet':       -1,
    },
  },

  alternates: {
    canonical: 'https://www.klas.ng',
  },

  icons: {
    icon:        '/favicon.ico',
    shortcut:    '/favicon-16x16.png',
    apple:       '/apple-touch-icon.png',
  },

  manifest: '/manifest.json',

  verification: {
    google: '3qudodu5A36_zU8EAipgoQiWUpT-FuHFt7vQWylx_lA', // replace after adding site to Google Search Console
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}

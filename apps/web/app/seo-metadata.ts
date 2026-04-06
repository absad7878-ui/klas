// apps/web/app/seo-metadata.ts
// Import and use these in each page file
// Usage: export { metadata } from '@/app/seo-metadata' — or copy per page

import type { Metadata } from 'next';

// ── Homepage ──────────────────────────────────────────────────────────────────
export const homepageMetadata: Metadata = {
  title:       'School Management System in Nigeria — Klas.ng',
  description: 'Klas.ng helps Nigerian schools manage students, attendance, fees, and exam results — all in one platform. Start your free 14-day trial today.',
  alternates:  { canonical: 'https://www.klas.ng' },
  openGraph: {
    title:       'School Management System in Nigeria — Klas.ng',
    description: 'Attendance, fees, SMS, report cards — everything your school needs. ₦20 per student per month.',
    url:         'https://www.klas.ng',
    images:      [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

// ── Register page ─────────────────────────────────────────────────────────────
export const registerMetadata: Metadata = {
  title:       'Register Your School — Klas | Free 14-Day Trial',
  description: 'Create your school account on Klas.ng in minutes. Free 14-day trial, no credit card required. School management made simple for Nigerian schools.',
  alternates:  { canonical: 'https://www.klas.ng/register' },
  openGraph: {
    title:       'Register Your School on Klas — Free Trial',
    description: 'Set up your school in minutes. Manage students, fees, attendance, and report cards.',
    url:         'https://www.klas.ng/register',
  },
};

// ── Admin Login ───────────────────────────────────────────────────────────────
export const adminLoginMetadata: Metadata = {
  title:       'Admin Login — Klas School Management',
  description: 'Log in to your Klas school admin dashboard. Manage students, teachers, fees, attendance, and exam results.',
  alternates:  { canonical: 'https://www.klas.ng/school-login' },
  robots:      { index: false }, // login pages shouldn't be indexed
};

// ── Teacher Login ─────────────────────────────────────────────────────────────
export const teacherLoginMetadata: Metadata = {
  title:       'Teacher Login — Klas School Management',
  description: 'Teachers log in here to take attendance, enter exam scores, and post assignments.',
  alternates:  { canonical: 'https://www.klas.ng/teacher-login' },
  robots:      { index: false },
};

// ── Parent Login ──────────────────────────────────────────────────────────────
export const parentLoginMetadata: Metadata = {
  title:       'Parent Portal Login — Klas',
  description: 'Parents log in to view their child\'s attendance, fees, results, and report cards.',
  alternates:  { canonical: 'https://www.klas.ng/parent/login' },
  robots:      { index: false },
};

// ── About ─────────────────────────────────────────────────────────────────────
export const aboutMetadata: Metadata = {
  title:       'About Klas — School Management Built for Nigeria',
  description: 'Learn about Klas.ng — the affordable, simple school management platform built specifically for Nigerian private and public schools.',
  alternates:  { canonical: 'https://www.klas.ng/about' },
};

// ── Contact ───────────────────────────────────────────────────────────────────
export const contactMetadata: Metadata = {
  title:       'Contact Klas — We\'re Here to Help',
  description: 'Get in touch with the Klas team. We support Nigerian schools with setup, training, and ongoing help.',
  alternates:  { canonical: 'https://www.klas.ng/contact' },
};

// ── Privacy ───────────────────────────────────────────────────────────────────
export const privacyMetadata: Metadata = {
  title:       'Privacy Policy — Klas School Management',
  description: 'Read the Klas.ng privacy policy. We protect your school and student data.',
  alternates:  { canonical: 'https://www.klas.ng/privacy' },
};

// ── Terms ─────────────────────────────────────────────────────────────────────
export const termsMetadata: Metadata = {
  title:       'Terms of Service — Klas School Management',
  description: 'Read the Klas.ng terms of service.',
  alternates:  { canonical: 'https://www.klas.ng/terms' },
};
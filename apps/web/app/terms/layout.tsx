import { termsMetadata } from '@/app/seo-metadata';

export const metadata = termsMetadata;

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
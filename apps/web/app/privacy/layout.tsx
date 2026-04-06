import { privacyMetadata } from '@/app/seo-metadata';

export const metadata = privacyMetadata;

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
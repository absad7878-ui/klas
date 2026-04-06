import { contactMetadata } from '@/app/seo-metadata';

export const metadata = contactMetadata;

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
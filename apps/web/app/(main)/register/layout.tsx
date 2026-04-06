import { registerMetadata } from '@/app/seo-metadata';

export const metadata = registerMetadata;

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
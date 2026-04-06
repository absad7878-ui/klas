import { adminLoginMetadata } from '@/app/seo-metadata';

export const metadata = adminLoginMetadata;

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
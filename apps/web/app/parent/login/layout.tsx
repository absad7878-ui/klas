import { parentLoginMetadata } from '@/app/seo-metadata';

export const metadata = parentLoginMetadata;

export default function ParentLoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
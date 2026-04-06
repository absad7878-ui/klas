import { teacherLoginMetadata } from '@/app/seo-metadata';

export const metadata = teacherLoginMetadata;

export default function TeacherLoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
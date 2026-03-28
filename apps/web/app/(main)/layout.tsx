// apps/web/app/(main)/register/layout.tsx
import type { ReactNode } from 'react';

// Simple layout – can wrap children with shared UI (header, footer, etc.)
export default function RegisterLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Optional: shared header for registration flow */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold">School Registration</h1>
        </div>
      </header>

      {/* Main content (your page.tsx will render here) */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
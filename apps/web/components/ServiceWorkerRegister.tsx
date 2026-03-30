'use client';
// apps/web/components/ServiceWorkerRegister.tsx
// Registers firebase-messaging-sw.js — the ONLY service worker needed.
// Do NOT register a separate sw.js — it conflicts with Firebase messaging.

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker
      .getRegistrations()
      .then(async (registrations) => {
        // Unregister any old sw.js registrations that conflict
        for (const reg of registrations) {
          if (reg.active?.scriptURL?.includes('/sw.js')) {
            console.log('[SW] Removing old sw.js conflict...');
            await reg.unregister();
          }
        }

        // Register the correct Firebase messaging service worker
        return navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/',
        });
      })
      .then((reg) => {
        if (reg) console.log('[SW] firebase-messaging-sw.js registered:', reg.scope);
      })
      .catch((err) => console.error('[SW] Registration error:', err));
  }, []);

  return null;
}

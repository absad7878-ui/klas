// apps/web/app/lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey:            'AIzaSyAjWXwWOuKtaPzZI4YuZUJGpM89Ju49ah4',
  authDomain:        'klas-ng.firebaseapp.com',
  projectId:         'klas-ng',
  storageBucket:     'klas-ng.appspot.com',
  messagingSenderId: '587356351861',
  appId:             '1:587356351861:web:f315b5e50d59875756f73c',
};

// Init Firebase only once
export const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);

// ── Request permission + get FCM token + save to backend ─────────────────────
export async function requestNotificationPermission(
  role:     string,
  apiUrl:   string,
  token:    string,
  schoolId?: string,
): Promise<boolean> {
  try {
    if (typeof window === 'undefined') return false;
    if (!('Notification' in window))   return false;

    // 1. Request browser permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('[FCM] Permission denied');
      return false;
    }

    // 2. Wait for the Firebase service worker specifically
    const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    });
    await navigator.serviceWorker.ready;

    // 3. Get FCM token using our service worker
    const messaging = getMessaging(app);
    const fcmToken  = await getToken(messaging, {
      vapidKey:                    process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration:   swReg,
    });

    if (!fcmToken) {
      console.error('[FCM] No token returned');
      return false;
    }

    console.log('[FCM] Token obtained:', fcmToken.slice(0, 20) + '…');

    // 4. Save to backend
    const res = await fetch(`${apiUrl}/announcements/subscribe`, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ fcmToken, role, schoolId }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('[FCM] Backend save failed:', err);
      return false;
    }

    console.log('[FCM] Subscription saved to backend ✓');
    return true;
  } catch (err) {
    console.error('[FCM] requestNotificationPermission error:', err);
    return false;
  }
}

// ── Foreground message handler (when app is open) ─────────────────────────────
export function onForegroundMessage(callback: (payload: any) => void) {
  if (typeof window === 'undefined') return () => {};
  try {
    const messaging = getMessaging(app);
    return onMessage(messaging, callback);
  } catch {
    return () => {};
  }
}
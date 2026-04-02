// apps/web/app/lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, deleteToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey:            'AIzaSyAjWXwWOuKtaPzZI4YuZUJGpM89Ju49ah4',
  authDomain:        'klas-ng.firebaseapp.com',
  projectId:         'klas-ng',
  storageBucket:     'klas-ng.appspot.com',
  messagingSenderId: '587356351861',
  appId:             '1:587356351861:web:f315b5e50d59875756f73c',
};

export const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);

// ── Check if a valid FCM token exists (without prompting user) ────────────────
// Returns the token string if valid, null if unsubscribed or expired
export async function checkExistingToken(): Promise<string | null> {
  try {
    if (typeof window === 'undefined') return null;
    if (!('Notification' in window)) return null;
    if (Notification.permission !== 'granted') return null;

    const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
    await navigator.serviceWorker.ready;

    const messaging = getMessaging(app);

    // getToken returns empty string if token was deleted/revoked
    const fcmToken = await getToken(messaging, {
      vapidKey:                  process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: swReg,
    });

    return fcmToken || null;
  } catch {
    // Token doesn't exist or service worker failed
    return null;
  }
}

// ── Request permission + get FCM token + save to backend ─────────────────────
export async function requestNotificationPermission(
  role:      string,
  apiUrl:    string,
  token:     string,
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

    // 2. Register Firebase service worker
    const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
    await navigator.serviceWorker.ready;

    // 3. Get FCM token
    const messaging = getMessaging(app);
    const fcmToken  = await getToken(messaging, {
      vapidKey:                  process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: swReg,
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

    console.log('[FCM] Subscription saved ✓');
    return true;
  } catch (err) {
    console.error('[FCM] requestNotificationPermission error:', err);
    return false;
  }
}

// ── Foreground message handler ─────────────────────────────────────────────────
export function onForegroundMessage(callback: (payload: any) => void) {
  if (typeof window === 'undefined') return () => {};
  try {
    const messaging = getMessaging(app);
    return onMessage(messaging, callback);
  } catch {
    return () => {};
  }
}
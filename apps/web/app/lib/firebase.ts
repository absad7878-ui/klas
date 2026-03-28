import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey:            'AIzaSyAjWXwWOuKtaPzZI4YuZUJGpM89Ju49ah4',
  authDomain:        'klas-ng.firebaseapp.com',
  projectId:         'klas-ng',
  messagingSenderId: '587356351861',
  appId:             '1:587356351861:web:f315b5e50d59875756f73c',
};

const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);

export async function requestNotificationPermission(
  role:      string,
  apiUrl:    string,
  token:     string,
  schoolId?: string,
): Promise<boolean> {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;

const registration = await navigator.serviceWorker.register('/sw.js');
const messaging = getMessaging(app);
const fcmToken  = await getToken(messaging, {
  vapidKey: 'BKughGBzNV2OvItmHynNecN3pGPXWvhS4xdwK7TYMyT2IVT3MInBDlZuobS3zaWqB_NQi0IaGX-T5fl9ly48080',
  serviceWorkerRegistration: registration,
});

    if (!fcmToken) return false;

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    await fetch(`${apiUrl}/announcements/subscribe`, {
      method:  'POST',
      headers,
      body:    JSON.stringify({ fcmToken, role, schoolId }),
    });

    return true;
  } catch (err) {
    console.error('Push permission error:', err);
    return false;
  }
}

export function onForegroundMessage(callback: (payload: any) => void) {
  const messaging = getMessaging(app);
  return onMessage(messaging, callback);
}
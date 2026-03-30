importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// ── Firebase config ───────────────────────────────────────────────────────────
firebase.initializeApp({
  apiKey:            'AIzaSyAjWXwWOuKtaPzZI4YuZUJGpM89Ju49ah4',
  authDomain:        'klas-ng.firebaseapp.com',
  projectId:         'klas-ng',
  messagingSenderId: '587356351861',
  appId:             '1:587356351861:web:f315b5e50d59875756f73c',
});

const messaging = firebase.messaging();

// ── Background messages (when app is closed or in background) ─────────────────
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload);

  const title = payload.notification?.title || payload.data?.title || 'Klas Notification';
  const body  = payload.notification?.body  || payload.data?.body  || '';

  self.registration.showNotification(title, {
    body,
    icon:  '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data:  payload.data,
    tag:   'klas-notification', // prevents duplicate notifications
    renotify: true,
  });
});



// ── Notification click → open URL ─────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      // Otherwise open new window
      return clients.openWindow(url);
    })
  );
});

// ── Cache / Offline ───────────────────────────────────────────────────────────
const CACHE_NAME    = 'klas-v3';
const OFFLINE_URL   = '/offline.html';
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

self.addEventListener('install', (event) => {
  console.log('[SW] Installing firebase-messaging-sw.js');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating firebase-messaging-sw.js');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/api/')) return;
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return res;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => cached || caches.match(OFFLINE_URL))
      )
  );
});
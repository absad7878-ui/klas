importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// ── Firebase ──────────────────────────────────────────────────────────────────
firebase.initializeApp({
  apiKey:            'AIzaSyAjWXwWOuKtaPzZI4YuZUJGpM89Ju49ah4',
  authDomain:        'klas-ng.firebaseapp.com',
  projectId:         'klas-ng',
  messagingSenderId: '587356351861',
  appId:             '1:587356351861:web:f315b5e50d59875756f73c',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon:  '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data:  payload.data,
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.openWindow(url));
});

// ── Cache / Offline ───────────────────────────────────────────────────────────
const CACHE_NAME  = 'klas-v2';
const OFFLINE_URL = '/offline.html';
const STATIC_ASSETS = ['/', '/offline.html', '/manifest.json', '/icons/icon-192x192.png', '/icons/icon-512x512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/api/')) return;
  if (!event.request.url.startsWith('http')) return;
  event.respondWith(
    fetch(event.request)
      .then((res) => { const clone = res.clone(); caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)); return res; })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match(OFFLINE_URL)))
  );
});
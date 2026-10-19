// TutorNest Conservative Service Worker (PWA Installability & Online First)
const CACHE_NAME = 'tutornest-v1';
const CORE_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. NEVER cache or intercept API calls, verification documents, or non-GET requests
  if (
    event.request.method !== 'GET' ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/uploads') ||
    url.hostname.includes('razorpay.com')
  ) {
    return;
  }

  // 2. Network-first strategy for all pages: always fetch live data online
  event.respondWith(
    fetch(event.request).catch(async () => {
      // Fallback to cached shell or root only if completely offline
      const cached = await caches.match(event.request);
      if (cached) return cached;
      if (event.request.mode === 'navigate') {
        const rootCached = await caches.match('/');
        if (rootCached) return rootCached;
      }
      return new Response('You are currently offline. Please reconnect to mobile data or Wi-Fi to use TutorNest.', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({ 'Content-Type': 'text/plain; charset=utf-8' })
      });
    })
  );
});

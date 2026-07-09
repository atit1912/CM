const CACHE_NAME = 'cctv-monitor-shell-v1';
const SHELL_FILES = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first สำหรับทุก request (ข้อมูลจริงต้องสดเสมอ) — cache ไว้ใช้ตอนเน็ตหลุด/เปิดครั้งแรกช้า
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  // อย่า cache request ไปยัง Google Apps Script (ข้อมูลต้อง real-time)
  if (e.request.url.includes('script.google.com')) return;

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

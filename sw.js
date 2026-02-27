// Service Worker - オフライン対応 & キャッシュ管理
const CACHE_NAME = 'muscle-planner-v6';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './data/exercises.js',
  './data/programs.js',
  './data/illustrations.js',
  './modules/profile.js',
  './modules/generator.js',
  './modules/recorder.js',
  './modules/adjuster.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

// インストール時にアセットをキャッシュ
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 古いキャッシュを削除
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ネットワーク優先、失敗時にキャッシュ
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

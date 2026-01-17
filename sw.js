const CACHE_NAME = 'pca-glass-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  // 外部ライブラリ（これらをキャッシュしないとオフラインで動きません）
  'https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js',
  'https://unpkg.com/vue@3/dist/vue.global.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;500;700;900&family=Noto+Sans+JP:wght@300;500;700&display=swap'
];

// インストール時：キャッシュを確保
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching all assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// リクエスト時：キャッシュがあればそれを返す（オフライン対応）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // キャッシュにあればそれを返す、なければネットワークへ
      return response || fetch(event.request);
    })
  );
});

// 更新時：古いキャッシュを削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
});
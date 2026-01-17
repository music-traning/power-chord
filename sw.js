const CACHE_NAME = 'pca-glass-v5';
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

// インストール時：即座に有効化
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching all assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting()) // 即座に有効化
  );
});

// [iOS PWA Fix] Network First戦略 - 常に最新を取得しようとする
self.addEventListener('fetch', (event) => {
  // index.htmlは常にネットワーク優先
  if (event.request.url.includes('index.html') || event.request.url.endsWith('/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // 成功したら、キャッシュも更新
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clonedResponse);
          });
          return response;
        })
        .catch(() => {
          // ネットワークエラー時のみキャッシュを返す
          return caches.match(event.request);
        })
    );
  } else {
    // その他のリソースはキャッシュ優先
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});

// 更新時：古いキャッシュを削除し、即座にコントロールを取得
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Deleting old cache:', key);
          return caches.delete(key);
        }
      }));
    }).then(() => self.clients.claim()) // 即座にコントロール
  );
});
// ===================================================
// 勝中 連絡帳 - Service Worker (v1.4)
// PWA（ホーム画面に追加）を成立させるための最小構成。
// 画面の骨組み（HTML/JS/CSS/アイコン等）だけを軽くキャッシュし、
// 表示を少し速くする。会員データ・投稿内容・通知は毎回必ず
// 最新を取りに行く必要があるため、GAS（script.google.com）への
// 通信とOneSignal関連は、一切キャッシュせずそのまま素通しする。
// ===================================================
var CACHE_NAME = 'katsuchu-renrakucho-v1.4';
var PRECACHE_URLS = [
  './',
  './index.html',
  './register.html',
  './welcome.html',
  './config.json',
  './manifest.json',
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(PRECACHE_URLS).catch(function(err) {
        // 1つでも読み込みに失敗すると全体が失敗するため、
        // 失敗しても致命的にならないよう握りつぶす（次回起動時に再試行される）
        console.warn('一部ファイルの事前キャッシュに失敗しました:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(name) { return name !== CACHE_NAME; })
             .map(function(name) { return caches.delete(name); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  var url = event.request.url;

  // GASへのAPI通信・OneSignal関連は、キャッシュせず必ずネットワークから取得する
  // （会員データ・投稿・通知の許可状態は、常に最新でなければならないため）
  if (url.indexOf('script.google.com') !== -1 ||
      url.indexOf('onesignal.com') !== -1 ||
      url.indexOf('cdn.onesignal.com') !== -1) {
    return; // ここで何もしなければ、ブラウザが通常通り通信する
  }

  // それ以外の静的ファイルは、キャッシュ優先。無ければネットワークから取得して次回用に保存する
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) return cached;
      return fetch(event.request).then(function(response) {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        var responseClone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseClone);
        });
        return response;
      }).catch(function() {
        // オフライン等で取得できなかった場合、キャッシュにも無ければそのまま失敗させる
        return cached;
      });
    })
  );
});

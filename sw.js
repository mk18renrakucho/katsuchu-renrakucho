// Firebase Cloud Messaging（FCMプッシュ通知）の処理をこのService Workerに統合。
// これにより、PWAキャッシュ用のsw.jsと通知用のfirebase-messaging-sw.jsが
// 同じ範囲（ルート）で競合する問題を解消する（1つのファイルで両方を担う）。
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDHTAfFAKYy5qBE8fGx7tq7nY2X1dOGjG0",
  authDomain: "katsuchu-82b50.firebaseapp.com",
  projectId: "katsuchu-82b50",
  storageBucket: "katsuchu-82b50.firebasestorage.app",
  messagingSenderId: "933868129628",
  appId: "1:933868129628:web:493881226f832777e00599"
});

var messaging = firebase.messaging();

// 画面を開いていない時（バックグラウンド）に通知を受け取った場合の表示処理
messaging.onBackgroundMessage(function(payload) {
  var title = (payload.notification && payload.notification.title) || '勝中連絡帳';
  var options = {
    body: (payload.notification && payload.notification.body) || '',
    icon: 'icons/icon-192.png',
    badge: 'icons/icon-192.png'
  };
  self.registration.showNotification(title, options);
});

// 通知をタップした時、既に開いているタブがあればそこにフォーカス、
// 無ければ新しいタブでサイトを開く
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) {
        return clients.openWindow('https://mk18renrakucho.github.io/katsuchu-renrakucho/');
      }
    })
  );
});

// ===================================================
// 勝中 連絡帳 - Service Worker (v1.5)
// PWA（ホーム画面に追加）を成立させるための最小構成。
// 画面の骨組み（HTML/JS/CSS/アイコン等）だけを軽くキャッシュし、
// 表示を少し速くする。会員データ・投稿内容・通知は毎回必ず
// 最新を取りに行く必要があるため、GAS（script.google.com）への
// 通信とFirebase関連は、一切キャッシュせずそのまま素通しする。
// ===================================================
var CACHE_NAME = 'katsuchu-renrakucho-v1.5';
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

  if (url.indexOf('script.google.com') !== -1 ||
      url.indexOf('googleapis.com') !== -1 ||
      url.indexOf('gstatic.com') !== -1) {
    return;
  }

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
        return cached;
      });
    })
  );
});

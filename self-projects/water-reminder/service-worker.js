/*
 * お水ごくごく — service-worker.js
 *
 *  - push イベントで必ず showNotification を呼ぶ（サイレントプッシュはブラウザ側のペナルティ対象）
 *  - notificationclick でアプリを開く（既に開いていればそのタブをフォーカス）
 *  - オフラインキャッシュは最小限（アプリシェルのみ）
 */

importScripts('messages.js');

var CACHE_NAME = 'water-reminder-v1';
var APP_SHELL = [
  './',
  'index.html',
  'style.css',
  'app.js',
  'messages.js',
  'manifest.json',
  'icons/icon.svg',
  'icons/badge.svg'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) { return cache.addAll(APP_SHELL); })
      .then(function () { return self.skipWaiting(); })
      .catch(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        return k === CACHE_NAME ? null : caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

// network-first（更新を取りこぼさない）、失敗したらキャッシュ
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  if (new URL(event.request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(function (res) {
        var copy = res.clone();
        caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, copy); });
        return res;
      })
      .catch(function () {
        return caches.match(event.request).then(function (cached) {
          return cached || caches.match('index.html');
        });
      })
  );
});

self.addEventListener('push', function (event) {
  var payload = {};
  if (event.data) {
    try {
      payload = event.data.json();
    } catch (e) {
      payload = { body: event.data.text() };
    }
  }

  // サーバーが文言を載せてこなかった場合は、端末のローカル時刻で選ぶ
  var body = payload.body || self.wrPickMessage(new Date().getHours());

  var options = {
    body: body,
    icon: 'icons/icon.svg',
    badge: 'icons/badge.svg',
    tag: payload.tag || 'water-reminder',
    renotify: true,
    requireInteraction: false,
    data: { url: payload.url || './' },
    actions: [{ action: 'drank', title: '飲んだ！' }]
  };

  event.waitUntil(
    self.registration.showNotification(payload.title || 'お水ごくごく', options)
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  var target = new URL(
    (event.notification.data && event.notification.data.url) || './',
    self.location.href
  ).href;

  // 「飲んだ！」アクションからはクエリ付きで開き、アプリ側で加算する
  if (event.action === 'drank') target += (target.indexOf('?') === -1 ? '?' : '&') + 'drank=200';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].url.indexOf(self.location.origin) === 0 && 'focus' in list[i]) {
          list[i].postMessage({ type: 'notification-click', action: event.action });
          return list[i].focus();
        }
      }
      return self.clients.openWindow(target);
    })
  );
});

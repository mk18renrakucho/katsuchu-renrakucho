// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDHTAfFAKYy5qBE8fGx7tq7nY2X1dOGjG0",
  authDomain: "katsuchu-82b50.firebaseapp.com",
  projectId: "katsuchu-82b50",
  storageBucket: "katsuchu-82b50.firebasestorage.app",
  messagingSenderId: "933868129628",
  appId: "1:933868129628:web:493881226f832777e00599"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const title = payload.notification.title;
  const options = {
    body: payload.notification.body,
    icon: '/katsuchu-renrakucho/icon-192.png' // 既存のアイコンがあればパスを合わせてください
  };
  self.registration.showNotification(title, options);
});

importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

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
  self.registration.showNotification(
    payload.notification.title || '勝中 連絡帳',
    {
      body: payload.notification.body || '新しいお知らせがあります',
      icon: './icons/icon-192.png'
    }
  );
});

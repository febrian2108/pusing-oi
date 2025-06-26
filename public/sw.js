// Service Worker untuk StoryApps
const CACHE_NAME = 'storyapps-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/styles/styles.css',
  '/src/app.js',
  '/src/public/icons/icon-192x192.png',
  '/src/public/icons/icon-512x512.png'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Service Worker: Cache failed', error);
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // Return offline page if available
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});

// Push Notification Event
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  console.log('Push data:', event.data);
  
  let notification = {
    title: 'StoryApps',
    options: {
      body: 'Ada pembaruan baru di StoryApps!',
      icon: '/src/public/icons/icon-192x192.png',
      badge: '/src/public/icons/badge-96x96.png',
      vibrate: [100, 50, 100],
      data: { url: '/' },
      actions: [
        { action: 'open', title: 'Buka App', icon: '/src/public/icons/icon-192x192.png' },
        { action: 'close', title: 'Tutup' },
      ],
      requireInteraction: true,
      tag: 'story-notification'
    },
  };

  if (event.data) {
    try {
      const dataJson = event.data.json();
      console.log('Parsed JSON data:', dataJson);
      if (dataJson.title) {
        notification.title = dataJson.title;
      }
      if (dataJson.body) {
        notification.options.body = dataJson.body;
      }
      if (dataJson.options) {
        notification.options = { ...notification.options, ...dataJson.options };
      }
    } catch (e) {
      console.log('JSON parsing failed, trying as text:', e);
      try {
        const dataText = event.data.text();
        console.log('Parsed text data:', dataText);
        if (dataText) {
          notification.options.body = dataText;
        }
      } catch (textError) {
        console.error('Error parsing push data as text:', textError);
        notification.options.body = 'Notifikasi baru dari StoryApps';
      }
    }
  }
  
  console.log('Final notification:', notification);

  event.waitUntil(
    self.registration.showNotification(notification.title, notification.options)
      .then(() => {
        console.log('Notification shown successfully');
      })
      .catch((error) => {
        console.error('Error showing notification:', error);
      })
  );
});

// Notification Click Event
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  const urlToOpen = event.notification.data && event.notification.data.url
    ? event.notification.data.url
    : '/';
    
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin)) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background Sync
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered');
  if (event.tag === 'background-sync') {
    event.waitUntil(
      console.log('Performing background sync...')
    );
  }
});

// Handle service worker updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});


// Service Worker for ElderCare Mobile App
const CACHE_NAME = 'eldercare-v1.0.0';
const urlsToCache = [
    '/mobile-app/',
    '/mobile-app/index.html',
    '/mobile-app/mobile-styles.css',
    '/mobile-app/mobile-app.js',
    '/mobile-app/manifest.json',
    '/mobile-app/icon-192.png',
    '/mobile-app/icon-512.png'
];

// Install event - cache resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // Clone the request
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(response => {
                    // Check if valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone the response
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
            })
            .catch(() => {
                // Return offline page if available
                return caches.match('/mobile-app/offline.html');
            })
    );
});

// Push notification event
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : '새로운 알림이 있습니다.',
        icon: '/mobile-app/icon-192.png',
        badge: '/mobile-app/icon-72.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: '확인',
                icon: '/mobile-app/icon-72.png'
            },
            {
                action: 'close',
                title: '닫기',
                icon: '/mobile-app/icon-72.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('ElderCare 알림', options)
    );
});

// Notification click event
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/mobile-app/')
        );
    }
});

// Background sync event
self.addEventListener('sync', event => {
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

async function syncData() {
    // Sync data with server when online
    console.log('Syncing data with server...');
    // Implementation here
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', event => {
    if (event.tag === 'update-status') {
        event.waitUntil(updateStatus());
    }
});

async function updateStatus() {
    // Update status from server
    console.log('Updating status from server...');
    // Implementation here
}

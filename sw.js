const CACHE_NAME = 'nsolotshicapp-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://placehold.co/192x192/2563eb/FFFFFF?text=NS',
  'https://placehold.co/512x512/2563eb/FFFFFF?text=NS'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  // Ne pas mettre en cache les requêtes vers l'API
  if (event.request.url.includes('/api/') || event.request.url.includes('/macros/')) {
    return fetch(event.request);
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Retourner le cache si disponible, sinon faire une requête réseau
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(function(networkResponse) {
          // Ne mettre en cache que les requêtes réussies et de type basic
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          
          // Cloner la réponse car elle ne peut être utilisée qu'une fois
          const responseToCache = networkResponse.clone();
          
          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, responseToCache);
            });
          
          return networkResponse;
        });
      })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Gérer les messages pour mettre à jour l'UI
self.addEventListener('message', function(event) {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

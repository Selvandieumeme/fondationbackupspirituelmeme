const CACHE_NAME = 'cool-cache';

const PRECACHE_ASSETS = [
  '/index.html',
  '/manifest.json',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  // Ajoute plis fichye si ou vle
];

// 1. Enstale epi mete fichye yo nan kach
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(PRECACHE_ASSETS);
    self.skipWaiting(); // Byen bon pratik
  })());
});

// 2. Aktivasyon pou pran kontwòl imedyatman
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// 3. Repons sou demann HTTP
self.addEventListener('fetch', event => {
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(event.request);

    if (cachedResponse) {
      return cachedResponse; // Si fichye a nan cache, itilize l
    } else {
      try {
        const networkResponse = await fetch(event.request);
        return networkResponse;
      } catch (error) {
        return new Response('Offline and resource not cached', {
          status: 503,
          statusText: 'Offline',
        });
      }
    }
  })());
});


self.addEventListener('sync', event => {
  if (event.tag === 'sync-user-actions') {
    event.waitUntil(syncUserActions());
  }
});

async function syncUserActions() {
  const actions = await getSavedActions(); // sòti nan IndexedDB ou lòt lokal kote ou mete yo
  for (const action of actions) {
    try {
      await fetch('/api/sync', {
        method: 'POST',
        body: JSON.stringify(action),
        headers: { 'Content-Type': 'application/json' }
      });
      await deleteSavedAction(action.id);
    } catch (error) {
      console.log('Toujou pa gen rezo, eseye pita');
    }
  }
}


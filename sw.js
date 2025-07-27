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



// Enpòte bibliyotèk idb si w ap sèvi ak li (obligatwa pou IndexedDB)
importScripts('https://cdn.jsdelivr.net/npm/idb@7/build/iife/index-min.js');
const { openDB } = window.idb;

// Fonksyon pou ouvri IndexedDB la
async function getDB() {
  return await openDB('user-actions-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('actions')) {
        db.createObjectStore('actions', { autoIncrement: true });
      }
    },
  });
}

// Fonksyon pou revoe tout aksyon yo sou sèvè
self.addEventListener('sync', function (event) {
  if (event.tag === 'sync-user-actions') {
    event.waitUntil(syncUserActions());
  }
});

async function syncUserActions() {
  const db = await getDB();
  const tx = db.transaction('actions', 'readwrite');
  const store = tx.objectStore('actions');
  const allActions = await store.getAll();

  for (const action of allActions) {
    try {
      // Voye done ou a sou sèvè (ajiste URL la ak metòd si sa nesesè)
      await fetch('/save-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action),
      });
    } catch (err) {
      console.error('Pa ka voye aksyon:', err);
      return; // Sispann si gen echèk
    }
  }

  // Si tout bagay pase byen, efase tout aksyon yo
  await store.clear();
  await tx.done;
}

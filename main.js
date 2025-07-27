<script>
  async function sendAction(action) {
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        body: JSON.stringify(action),
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Network issue');
    } catch (error) {
      // Rezo down: mete aksyon nan lokal epi enskri background sync
      await saveActionLocally(action); // LocalStorage ou IndexedDB
      const reg = await navigator.serviceWorker.ready;
      await reg.sync.register('sync-user-actions');
    }
  }

  // Egzanp: ou ka rele fonksyon an konsa
  document.querySelector('#btn-vote').addEventListener('click', () => {
    const action = {
      type: 'vote',
      artisteId: '123',
      userId: 'ABC',
      timestamp: Date.now()
    };
    sendAction(action);
  });
</script>

async function saveActionLocally(action) {
  const db = await openDB('sync-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('actions')) {
        db.createObjectStore('actions', { keyPath: 'id', autoIncrement: true });
      }
    }
  });
  const tx = db.transaction('actions', 'readwrite');
  await tx.store.add(action);
}

async function getSavedActions() {
  const db = await openDB('sync-db', 1);
  return await db.getAll('actions');
}

async function deleteSavedAction(id) {
  const db = await openDB('sync-db', 1);
  await db.delete('actions', id);
}


const CACHE_NAME = "fobas-laboratoire-chimique-v1";

const APP_SHELL = [
    "./",
    "./simulationchimicfobas.html",
    "./simulationchimicfobas.css",
    "./simulationchimicfobas.js",
    "./manifest.webmanifest"
   "./fobaschimique192.png",
"./fobaschimique512.png"
];


/* ============================================================
   INSTALLATION
   ============================================================ */

self.addEventListener("install", event => {

    event.waitUntil(

        caches
            .open(CACHE_NAME)
            .then(cache => {

                return cache.addAll(APP_SHELL);

            })
            .then(() => {

                return self.skipWaiting();

            })

    );

});


/* ============================================================
   ACTIVATION
   ============================================================ */

self.addEventListener("activate", event => {

    event.waitUntil(

        caches
            .keys()
            .then(cacheNames => {

                return Promise.all(

                    cacheNames
                        .filter(cacheName => {

                            return (
                                cacheName.startsWith(
                                    "fobas-laboratoire-chimique-"
                                ) &&
                                cacheName !== CACHE_NAME
                            );

                        })
                        .map(cacheName => {

                            return caches.delete(cacheName);

                        })

                );

            })
            .then(() => {

                return self.clients.claim();

            })

    );

});


/* ============================================================
   FETCH
   ------------------------------------------------------------
   Priorité :
   1. Réseau
   2. Cache
   ============================================================ */

self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(

        fetch(event.request)
            .then(response => {

                if (
                    !response ||
                    response.status !== 200 ||
                    response.type === "opaque"
                ) {
                    return response;
                }

                const responseClone = response.clone();

                caches
                    .open(CACHE_NAME)
                    .then(cache => {

                        cache.put(
                            event.request,
                            responseClone
                        );

                    });

                return response;

            })
            .catch(() => {

                return caches
                    .match(event.request)
                    .then(cachedResponse => {

                        return (
                            cachedResponse ||
                            caches.match(
                                "./simulationchimicfobas.html"
                            )
                        );

                    });

            })

    );

});
/* =========================================================
   FOBAS WORD PWA
   SERVICE WORKER
   Offline-First Engine
   ========================================================= */

const FOBAS_WORD_CACHE = "fobas-word-cache-v1";


const FOBAS_WORD_FILES = [

    "/campusword2007simulation.html",

    "/manifest-fobas-word.json",

    "/css/",

    "/js/"

];



/* =========================================================
   INSTALLATION
   ========================================================= */

self.addEventListener("install", event => {

    console.log(
        "FOBAS WORD Service Worker Installation..."
    );


    event.waitUntil(

        caches.open(FOBAS_WORD_CACHE)

        .then(cache => {

            return cache.addAll(
                FOBAS_WORD_FILES
            );

        })

    );


    self.skipWaiting();

});



/* =========================================================
   ACTIVATION
   ========================================================= */

self.addEventListener("activate", event => {


    console.log(
        "FOBAS WORD Service Worker Active"
    );


    event.waitUntil(

        caches.keys()

        .then(cacheNames => {

            return Promise.all(

                cacheNames.map(cache => {


                    if(cache !== FOBAS_WORD_CACHE){

                        return caches.delete(cache);

                    }


                })

            );

        })

    );


    self.clients.claim();

});



/* =========================================================
   FETCH STRATEGY
   CACHE FIRST - NETWORK FALLBACK
   ========================================================= */

self.addEventListener("fetch", event => {


    event.respondWith(

        caches.match(event.request)

        .then(cachedResponse => {


            if(cachedResponse){

                return cachedResponse;

            }



            return fetch(event.request)

            .then(networkResponse => {


                return caches.open(
                    FOBAS_WORD_CACHE
                )

                .then(cache => {


                    cache.put(

                        event.request,

                        networkResponse.clone()

                    );


                    return networkResponse;


                });


            })

            .catch(() => {


                return caches.match(
                    "/campusword2007simulation.html"
                );


            });


        })

    );


});
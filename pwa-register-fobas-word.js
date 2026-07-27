/* =========================================================
   FOBAS WORD PWA
   PWA REGISTER ENGINE
   Service Worker Connector
   ========================================================= */


(function FOBAS_WORD_PWA_REGISTER(){


    "use strict";



    /* =====================================================
       VERIFY BROWSER SUPPORT
       ===================================================== */


    if (!("serviceWorker" in navigator)) {


        console.warn(
            "FOBAS WORD PWA pa sipòte sou navigatè sa a."
        );


        return;


    }



    /* =====================================================
       REGISTER SERVICE WORKER
       ===================================================== */


    window.addEventListener(
        "load",
        function(){



            navigator.serviceWorker.register(

                "/service-worker-fobas-word.js",

                {
                    scope: "/"
                }

            )


            .then(function(registration){


                console.log(
                    "FOBAS WORD PWA Service Worker aktive:",
                    registration.scope
                );



                if(
                    registration.waiting
                ){

                    console.log(
                        "FOBAS WORD nouvo vèsyon pare."
                    );

                }



            })


            .catch(function(error){


                console.error(

                    "FOBAS WORD PWA erè enskripsyon:",

                    error

                );


            });



        }

    );



})();
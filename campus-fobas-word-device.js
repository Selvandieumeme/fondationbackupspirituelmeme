/* =========================================================
   FOBAS WORD
   DEVICE IDENTIFICATION ENGINE
   BLOK 2
   ========================================================= */


(function FOBAS_WORD_DEVICE_ENGINE(){


    "use strict";


    const DEVICE_KEY = "FOBAS_WORD_DEVICE_ID";



    function generateDeviceID(){


        const time =
            Date.now().toString(36);


        const random =
            Math.random()
            .toString(36)
            .substring(2,10);



        return (

            "FW-" +
            time +
            "-" +
            random

        ).toUpperCase();


    }



    function getDeviceID(){


        let deviceID =
            localStorage.getItem(
                DEVICE_KEY
            );


        if(!deviceID){


            deviceID =
                generateDeviceID();


            localStorage.setItem(

                DEVICE_KEY,

                deviceID

            );


        }


        return deviceID;


    }



    document.addEventListener(

        "cwFobasWordInstallRequest",

        function(){


            const deviceID =
                getDeviceID();



            console.log(

                "FOBAS WORD DEVICE ID:",

                deviceID

            );



            window.dispatchEvent(

                new CustomEvent(

                    "cwFobasWordDeviceReady",

                    {

                        detail: {

                            deviceID: deviceID

                        }

                    }

                )

            );


        }

    );



})();
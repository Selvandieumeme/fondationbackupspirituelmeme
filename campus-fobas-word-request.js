/* =========================================================
   FOBAS WORD
   REQUEST ENGINE
   CONFIRM INSTALL REQUEST
   ========================================================= */


(function FOBAS_WORD_REQUEST_ENGINE(){


    "use strict";



    const API_URL =

    "https://api.fondationbackupspirituel.com/api/fobas-word/request";



    const DEVICE_KEY =

    "FOBAS_WORD_DEVICE_ID";





    function getDeviceID(){



        let deviceID =

        localStorage.getItem(

            DEVICE_KEY

        );



        if(!deviceID){



            deviceID =


            "FW-" +

            Date.now()

            .toString(36)

            +

            "-" +

            Math.random()

            .toString(36)

            .substring(2,10);



            localStorage.setItem(

                DEVICE_KEY,

                deviceID

            );


        }



        return deviceID;



    }






    function createRequestID(){



        return (

            "FW-REQ-" +

            Date.now()

            .toString(36)

            +

            "-" +

            Math.random()

            .toString(36)

            .substring(2,8)

        )

        .toUpperCase();



    }








    document.addEventListener(


        "click",


        function(event){



            if(

                event.target.id !==

                "cwConfirmFobasWordRequest"

            ){


                return;


            }





            const requestData = {



                requestId:

                createRequestID(),



                application:

                "FOBAS WORD",



                deviceId:

                getDeviceID(),



                amount:

                "1500 HTG",



                adminName:

                "M. MEME Selvandieu",



                natcash:

                "+50943706706",



                whatsapp:

                "+50943706706",



                status:

                "PENDING",



                createdAt:

                new Date()

                .toISOString()



            };






            fetch(

                API_URL,

                {



                    method:

                    "POST",



                    headers:{


                        "Content-Type":

                        "application/json"


                    },



                    body:

                    JSON.stringify(

                        requestData

                    )



                }

            )



            .then(function(response){



                return response.json();



            })



            .then(function(result){



                console.log(

                    "FOBAS WORD REQUEST:",

                    result

                );





                localStorage.setItem(


                    "FOBAS_WORD_LAST_REQUEST",


                    JSON.stringify(

                        requestData

                    )

                );





                alert(

                    "Demann FOBAS WORD ou a voye avèk siksè. Voye prèv peman an sou WhatsApp."

                );



            })



            .catch(function(error){



                console.error(

                    "FOBAS WORD REQUEST ERROR:",

                    error

                );




                alert(

                    "Erè pandan voye demann FOBAS WORD la."

                );



            });



        }


    );





})();
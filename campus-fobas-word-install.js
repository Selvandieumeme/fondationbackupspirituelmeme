/* =========================================================
   FOBAS WORD
   DIRECT INSTALL WINDOW ENGINE
   ONE CLICK MODAL SYSTEM
   ========================================================= */


(function FOBAS_WORD_INSTALL_ENGINE(){

    "use strict";


    const INSTALL_BUTTON_ID =
        "cwInstallFobasWordBtn";


    const DEVICE_KEY =
        "FOBAS_WORD_DEVICE_ID";



    function createDeviceID(){


        return (

            "FW-" +

            Date.now().toString(36)

            + "-" +

            Math.random()
            .toString(36)
            .substring(2,10)

        ).toUpperCase();


    }



    function getDeviceID(){


        let id =
        localStorage.getItem(
            DEVICE_KEY
        );


        if(!id){


            id =
            createDeviceID();


            localStorage.setItem(

                DEVICE_KEY,

                id

            );


        }


        return id;


    }



    function openInstallWindow(){


        const deviceID =
        getDeviceID();



        const old =
        document.getElementById(
            "cwFobasWordInstallModal"
        );


        if(old){

            old.remove();

        }



        const modal =
        document.createElement("div");


        modal.id =
        "cwFobasWordInstallModal";



        modal.innerHTML = `

        <div class="cwFobasWordOverlay">


            <div class="cwFobasWordInstallBox">


                <h2>
                    FOBAS WORD
                </h2>


                <h3>
                    Demann Enstalasyon
                </h3>



                <div class="cwFobasWordInfo">


                    <p>
                    <strong>ID Aparèy:</strong><br>
                    ${deviceID}
                    </p>


                    <p>
                    <strong>Aplikasyon:</strong><br>
                    FOBAS WORD
                    </p>


                    <p>
                    <strong>Frè Enstalasyon:</strong><br>
                    1500 HTG
                    </p>


                </div>



                <div class="cwPaymentInfo">


                    <h4>
                    Enfòmasyon Peman
                    </h4>


                    <p>
                    <strong>
                    Non Admin:
                    </strong><br>
                    M. MEME Selvandieu
                    </p>


                    <p>
                    <strong>
                    NatCash:
                    </strong><br>
                    +50943706706
                    </p>


                    <p>
                    <strong>
                    Voye prèv peman pa WhatsApp:
                    </strong><br>
                    +50943706706
                    </p>


                </div>



                <button
                id="cwConfirmFobasWordRequest">

                Konfime Demann

                </button>



                <button
                id="cwCloseFobasWordRequest">

                Fèmen

                </button>



            </div>


        </div>

        `;



        document.body.appendChild(modal);



        document

        .getElementById(
            "cwCloseFobasWordRequest"
        )

        .onclick = function(){


            modal.remove();


        };








document

.getElementById(
    "cwConfirmFobasWordRequest"
)

.onclick = function(){


    const requestData = {


        requestId:

        "FW-REQ-" +

        Date.now()

        .toString(36)

        .toUpperCase(),



        application:

        "FOBAS WORD",



        deviceId:

        deviceID,



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

        "https://api.fondationbackupspirituel.com/api/fobas-word/request",

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


};















        




    document.addEventListener(

        "DOMContentLoaded",

        function(){


            const button =
            document.getElementById(
                INSTALL_BUTTON_ID
            );



            if(!button){

                console.warn(
                    "Bouton FOBAS WORD pa jwenn."
                );

                return;

            }



            button.addEventListener(

                "click",

                function(){


                    openInstallWindow();


                }

            );


        }

    );



})();
/* =========================================================
   FOBAS WORD
   INSTALLATION REQUEST WINDOW ENGINE
   BLOK 3
   ========================================================= */


(function FOBAS_WORD_INSTALL_REQUEST_ENGINE(){


    "use strict";


    const ADMIN_NAME =
        "M. MEME Selvandieu";


    const NATCHASH_NUMBER =
        "+50943706706";


    const INSTALL_PRICE =
        "1500 HTG";



    function createInstallWindow(deviceID){


        const existing =
            document.getElementById(
                "cwFobasWordInstallModal"
            );


        if(existing){

            existing.remove();

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
                    FOBAS WORD PWA
                    </p>


                    <p>
                    <strong>Frè Enstalasyon:</strong><br>
                    ${INSTALL_PRICE}
                    </p>



                </div>



                <hr>



                <div class="cwPaymentInfo">


                    <h4>
                    Enfòmasyon Peman
                    </h4>


                    <p>
                    <strong>Non Admin:</strong><br>
                    ${ADMIN_NAME}
                    </p>


                    <p>
                    <strong>NatCash:</strong><br>
                    ${NATCHASH_NUMBER}
                    </p>


                    <p>
                    <strong>
                    Voye prèv peman pa WhatsApp:
                    </strong>
                    <br>
                    ${NATCHASH_NUMBER}
                    </p>


                </div>



                <div class="cwInstallWarning">


                    Tanpri mete:
                    <br>
                    - ID Aparèy ou
                    <br>
                    - Non ou
                    <br>
                    - Prèv peman an


                </div>



                <button
                id="cwConfirmFobasWordRequest">

                    Konfime Demann Enstalasyon

                </button>



                <button
                id="cwCloseFobasWordRequest">

                    Fèmen

                </button>



            </div>


        </div>

        `;



        document.body.appendChild(modal);



        bindInstallEvents(
            deviceID
        );



    }





    function bindInstallEvents(deviceID){



        const confirmBtn =
        document.getElementById(
            "cwConfirmFobasWordRequest"
        );



        const closeBtn =
        document.getElementById(
            "cwCloseFobasWordRequest"
        );



        if(confirmBtn){


            confirmBtn.onclick =
            function(){



                const requestData = {


                    application:
                    "FOBAS WORD",


                    deviceID:
                    deviceID,


                    paymentAmount:
                    INSTALL_PRICE,


                    adminName:
                    ADMIN_NAME,


                    natcash:
                    NATCHASH_NUMBER,


                    status:
                    "PENDING",


                    createdAt:
                    new Date()
                    .toISOString()


                };



                localStorage.setItem(

                    "FOBAS_WORD_INSTALL_REQUEST",

                    JSON.stringify(
                        requestData
                    )

                );



                alert(

                    "Demann FOBAS WORD ou anrejistre. Tanpri voye prèv peman an sou WhatsApp."

                );



                console.log(

                    "FOBAS WORD REQUEST:",
                    requestData

                );



            };


        }





        if(closeBtn){


            closeBtn.onclick =
            function(){


                const modal =
                document.getElementById(
                    "cwFobasWordInstallModal"
                );


                if(modal){

                    modal.remove();

                }


            };


        }


    }





    document.addEventListener(


        "cwFobasWordDeviceReady",


        function(event){


            const deviceID =
            event.detail.deviceID;



            createInstallWindow(
                deviceID
            );


        }


    );



})();
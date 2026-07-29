/* =========================================================
   FOBAS WORD
   DOWNLOAD ACCESS ENGINE
   ========================================================= */


(function FOBAS_WORD_DOWNLOAD_ENGINE(){


"use strict";





const API_BASE_URL =

"https://api.fondationbackupspirituel.com";





const DOWNLOAD_ACCESS_ROUTE =

"/api/fobas-word/download-access/";







const PWA_URL =

"https://fondationbackupspirituel.com/campusword2007simulation.html";









const requestInput =

document.getElementById(

"requestId"

);





const verifyButton =

document.getElementById(

"verifyAccessBtn"

);





const messageBox =

document.getElementById(

"message"

);





const downloadButton =

document.getElementById(

"downloadBtn"

);









function showMessage(message){


    messageBox.textContent = message;


}









function enableDownload(){



    downloadButton.href = PWA_URL;


    downloadButton.style.display = "block";



}









function disableDownload(){



    downloadButton.href="#";


    downloadButton.style.display="none";



}









async function verifyAccess(){



    const requestId =

    requestInput.value.trim();





    if(!requestId){



        showMessage(

            "Tanpri antre Request ID ou."

        );


        disableDownload();


        return;


    }







    showMessage(

        "Verifikasyon aksè ap fèt..."

    );


    disableDownload();







    try{



        const response =

        await fetch(


            API_BASE_URL +

            DOWNLOAD_ACCESS_ROUTE +

            encodeURIComponent(

                requestId

            )



        );








        const result =

        await response.json();









        if(


            result.success &&

            result.access === true

        ){



            showMessage(

                "Aksè FOBAS WORD valide. Ou kapab ouvri aplikasyon an."

            );



            enableDownload();



        }

        else{



            showMessage(

                result.message ||

                "Aksè FOBAS WORD pa disponib."

            );



            disableDownload();



        }








    }

    catch(error){



        console.error(

            "FOBAS WORD DOWNLOAD ACCESS ERROR:",

            error

        );





        showMessage(

            "Erè koneksyon ak server FOBAS la."

        );



        disableDownload();



    }



}









verifyButton.addEventListener(


    "click",


    verifyAccess



);








requestInput.addEventListener(


    "keydown",


    function(event){



        if(event.key === "Enter"){



            verifyAccess();



        }



    }



);






})();
/* =========================================================
   FOBAS WORD
   ON BUTTON INSTALL ACCESS ENGINE
   ========================================================= */


(function(){


"use strict";



const onButton = document.getElementById(
    "cwOnFobasWordBtn"
);



if(!onButton){

    return;

}





onButton.addEventListener(
"click",
function(){


    const deviceId = prompt(
        "Antre Device ID FOBAS WORD ou a:"
    );



    if(deviceId === null){

        return;

    }




    if(deviceId.trim() === ""){


        alert(
            "Tanpri antre Device ID ou a."
        );

        return;

    }






    fetch(

        "https://api.fondationbackupspirituel.com/api/fobas-word/download-access/device/" 
        + 
        encodeURIComponent(deviceId.trim())

    )


    .then(response => response.json())


    .then(result => {



        if(

            result.access === true

            &&

            result.status === "APPROVED"

        ){



            const confirmDownload = confirm(

                "FOBAS WORD APPROUVÉ.\n\nVotre accès est activé.\nCliquez sur OK pour lancer FOBAS WORD."

            );




            if(confirmDownload){


                window.location.href =

                result.downloadUrl;



            }




            return;


        }







        if(result.status === "PENDING"){



            alert(

                "Votre demande FOBAS WORD est encore en attente d'approbation."

            );


            return;


        }








        if(result.status === "REJECTED"){



            alert(

                "Votre demande FOBAS WORD a été rejetée."

            );


            return;


        }







        alert(

            result.message ||

            "Aucune autorisation FOBAS WORD trouvée."

        );





    })




    .catch(error => {



        console.error(

            "FOBAS WORD ACCESS ERROR:",

            error

        );



        alert(

            "Erreur de connexion au serveur FOBAS."

        );



    });




});



})();



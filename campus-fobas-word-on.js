/* =========================================================
   FOBAS WORD
   ON BUTTON ENGINE
   DEVICE ID PROMPT
   ========================================================= */


(function(){


"use strict";





const onButton =

document.getElementById(

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







        const cleanDeviceId =

        deviceId.trim();







        if(cleanDeviceId === ""){



            alert(

                "Tanpri antre Device ID ou a."

            );


            return;


        }







        console.log(

            "FOBAS WORD DEVICE ID:",

            cleanDeviceId

        );






        alert(

            "Device ID resevwa avèk siksè."

        );





    }


);






})();



































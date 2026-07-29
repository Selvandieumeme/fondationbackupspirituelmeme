/* =========================================================
   FOBAS WORD ADMIN
   REQUEST MANAGEMENT ENGINE
   BACKEND READY VERSION
   ========================================================= */


(function FOBAS_WORD_ADMIN_ENGINE(){


"use strict";



/* =========================================================
   API CONFIGURATION
   ========================================================= */


const API_BASE_URL =

"https://api.fondationbackupspirituel.com";





const REQUESTS_ENDPOINT =

API_BASE_URL +

"/api/fobas-word/admin/requests";





const UPDATE_STATUS_ENDPOINT =

API_BASE_URL +

"/api/fobas-word/admin/request/status";







/* =========================================================
   DOM ELEMENTS
   ========================================================= */


const requestContainer =

document.getElementById(
    "requestContainer"
);



const searchInput =

document.getElementById(
    "search"
);



const statusFilter =

document.getElementById(
    "statusFilter"
);






let requests = [];








/* =========================================================
   LOAD REQUESTS FROM BACKEND
   ========================================================= */


async function loadRequests(){


    try{


        const response =

        await fetch(

            REQUESTS_ENDPOINT,

            {

                method:"GET",

                headers:{

                    "Content-Type":
                    "application/json"

                }

            }

        );




        if(!response.ok){


            throw new Error(

                "HTTP ERROR " +

                response.status

            );


        }





        const data =

        await response.json();






        requests =

        data.requests ||

        [];






        renderRequests();





    }

    catch(error){



        console.error(

            "FOBAS WORD ADMIN LOAD ERROR:",

            error

        );



        requestContainer.innerHTML =


        `

        <div class="empty">

        Erè pandan chajman request FOBAS WORD yo.

        </div>

        `;


    }



}









/* =========================================================
   RENDER REQUEST CARDS
   ========================================================= */


function renderRequests(){



    let searchValue =


    searchInput.value

    .toLowerCase();






    let selectedStatus =


    statusFilter.value;








    let filteredRequests =


    requests.filter(function(request){





        let matchSearch =


        request.requestId

        .toLowerCase()

        .includes(searchValue);






        let matchStatus =


        selectedStatus === "ALL"

        ||

        request.status === selectedStatus;






        return (

            matchSearch

            &&

            matchStatus

        );



    });







    requestContainer.innerHTML = "";






    if(filteredRequests.length === 0){


        requestContainer.innerHTML =


        `

        <div class="empty">

        Aucun request FOBAS WORD

        </div>

        `;


        return;


    }








    filteredRequests.forEach(function(request){





        const statusClass =


        request.status

        .toLowerCase();







        requestContainer.innerHTML +=


        `

        <div class="request-card">


            <h2>

            💻 ${request.application}

            </h2>




            <div class="field">

            <span class="label">
            Request ID:
            </span>

            ${request.requestId}

            </div>





            <div class="field">

            <span class="label">
            Device ID:
            </span>

            ${request.deviceId}

            </div>





            <div class="field">

            <span class="label">
            Amount:
            </span>

            ${request.amount}

            </div>





            <div class="field">

            <span class="label">
            Admin Name:
            </span>

            ${request.adminName}

            </div>





            <div class="field">

            <span class="label">
            Natcash:
            </span>

            ${request.natcash}

            </div>





            <div class="field">

            <span class="label">
            WhatsApp:
            </span>

            ${request.whatsapp}

            </div>





            <div class="field">

            <span class="label">
            Status:
            </span>


            <span class="status ${statusClass}">

            ${request.status}

            </span>


            </div>





            <div class="field">

            <span class="label">
            Download Access:
            </span>

            ${request.downloadAccess}

            </div>





            <div class="field">

            <span class="label">
            Created At:
            </span>


            ${

            new Date(
                request.createdAt
            )

            .toLocaleString()

            }


            </div>






            <div class="actions">


                <button

                class="approve"

                data-id="${request.requestId}">

                APPROVE

                </button>





                <button

                class="reject"

                data-id="${request.requestId}">

                REJECT

                </button>




            </div>





        </div>

        `;



    });



}









/* =========================================================
   UPDATE STATUS
   ========================================================= */


async function updateRequestStatus(

requestId,

status

){



    try{



        const response =


        await fetch(

            UPDATE_STATUS_ENDPOINT,

            {


                method:"PUT",


                headers:{


                    "Content-Type":

                    "application/json"


                },


                body:

                JSON.stringify({


                    requestId,

                    status


                })


            }


        );






        if(!response.ok){


            throw new Error(

                "UPDATE ERROR " +

                response.status

            );


        }






        await loadRequests();





    }


    catch(error){



        console.error(

            "FOBAS WORD STATUS UPDATE ERROR:",

            error

        );



        alert(

        "Erè pandan chanjman status request la."

        );


    }



}









/* =========================================================
   EVENTS
   ========================================================= */


searchInput.addEventListener(

"input",

renderRequests

);





statusFilter.addEventListener(

"change",

renderRequests

);






document.addEventListener(

"click",

function(event){





    if(

        event.target.classList.contains(

            "approve"

        )

    ){



        updateRequestStatus(

            event.target.dataset.id,

            "APPROVED"

        );



    }







    if(

        event.target.classList.contains(

            "reject"

        )

    ){



        updateRequestStatus(

            event.target.dataset.id,

            "REJECTED"

        );



    }





});









/* =========================================================
   START ENGINE
   ========================================================= */


loadRequests();





})();
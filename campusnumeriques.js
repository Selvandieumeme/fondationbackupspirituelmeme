// =====================================
// FOBAS DIGITAL AGENTS ACADEMY
// CampusNumérique
// Version 1 - Core System
// =====================================

// =====================================
// CONFIGURATION API
// =====================================

const API_BASE_URL =
  "https://api.fondationbackupspirituel.com";

// =====================================
// HELPERS
// =====================================

const $ = (selector) =>
  document.querySelector(selector);

const $$ = (selector) =>
  document.querySelectorAll(selector);













// =====================================
// MICROSOFT WORD 2007 FORMATION
// COURSE DATA ENGINE
// =====================================

const microsoftWordCourse = {

    title:
    "Formation Microsoft Word 2007",

    chapters:[

        {

            id:"chapitre1",

            unlocked:true,


            title:
            "Chapitre 1 - Découverte générale de Microsoft Word 2007",


            theory:[

                {

                    title:
                    "Qu’est-ce que Microsoft Word 2007 ?",


                    content:
                    "Microsoft Word 2007 est un logiciel de traitement de texte (Word Processing Software) développé par Microsoft permettant de créer, modifier, mettre en forme, enregistrer et imprimer des documents professionnels."

                },


                {

                    title:
                    "Rôle d’un logiciel de traitement de texte (Word Processing Software)",


                    content:
                    "Un logiciel de traitement de texte permet de produire des documents numériques, organiser les informations, appliquer une mise en forme professionnelle et faciliter la communication écrite."

                },


                {

                    title:
                    "Présentation générale de l’environnement Word 2007 (Word 2007 Interface)",


                    content:
                    "L’environnement Word 2007 est composé de plusieurs éléments principaux : la barre de titre (Title Bar), le bouton Office (Office Button), la barre d’accès rapide (Quick Access Toolbar), le ruban (Ribbon), la zone de travail (Document Area), les règles (Rulers) et la barre d’état (Status Bar)."

                }

            ],



            practice:[

                {

                    title:
                    "Pratique : Découvrir l’environnement Word 2007 (Word 2007 Interface)",


                    steps:[

                        "Identifier la barre de titre (Title Bar).",

                        "Identifier le bouton Office (Office Button).",

                        "Identifier le ruban (Ribbon).",

                        "Identifier les onglets (Tabs).",

                        "Identifier la zone de travail du document (Document Area).",

                        "Créer un nouveau document (New Document)."

                    ]

                }

            ],



            exercises:[

                "Identifier les principaux éléments de l’interface Word 2007.",

                "Expliquer le rôle du bouton Office (Office Button).",

                "Créer un premier document Word 2007."

            ],



            homework:

            "Créer un document présentant les différents éléments découverts dans Microsoft Word 2007.",



            evaluation:[

                "Décrire l’environnement général de Word 2007.",

                "Identifier les principaux composants de l’interface.",

                "Créer et enregistrer un premier document."

            ],



            objective:[

                "Comprendre l’environnement général de Microsoft Word 2007.",

                "Identifier les différentes parties de l’interface.",

                "Être capable de créer un premier document."

            ]

        },





{
        id:"chapitre2",
        unlocked:false,
        title:"Chapitre 2 - Maîtrise de l’onglet Home (Accueil) de Microsoft Word 2007",

        // tout kontni Chapitre 2 la isit la

    }

   
    ]

};

















// =====================================
// MICROSOFT WORD 2007 FORMATION
// PROGRESS ENGINE
// LOCAL STORAGE
// =====================================

const MicrosoftWordProgressEngine = {


    key:
    "microsoftWordFormationProgress",



    get(){

        const data =

        localStorage.getItem(

            this.key

        );


        if(!data){

            return {

                completedChapters:[],

                unlockedChapters:[

                    "chapitre1"

                ]

            };

        }


        return JSON.parse(data);

    },



    save(data){

        localStorage.setItem(

            this.key,

            JSON.stringify(data)

        );

    },





// =====================================
// COMPLETE CHAPTER
// =====================================

completeChapter(chapterId){


    const progress =

    this.get();



    if(

        !progress.completedChapters.includes(

            chapterId

        )

    ){

        progress.completedChapters.push(

            chapterId

        );

    }



    this.save(

        progress

    );


}



};














// =====================================
// MICROSOFT WORD 2007 FORMATION
// CHAPTER UNLOCK ENGINE
// FAZ 3.3 - ISOLATED VERSION
// =====================================


const WordChapterUnlockEngine = {


    checkProgress:function(){


        const completedChapter =

        localStorage.getItem(
            "wordChapter1Completed"
        );



        if(completedChapter === "true"){


            localStorage.setItem(

                "wordChapter2Unlocked",

                "true"

            );


        }


    },





    isUnlocked:function(chapterId){



        if(chapterId === "chapitre1"){


            return true;


        }




        if(chapterId === "chapitre2"){


            return (

                localStorage.getItem(
                    "wordChapter2Unlocked"
                )
                ===
                "true"

            );


        }




        return false;



    }



};



// INITIALISATION AUTOMATIK

WordChapterUnlockEngine.checkProgress();


















// =====================================
// MICROSOFT WORD 2007 FORMATION
// CHAPTER COMPLETION ENGINE
// FAZ 3.4 - ISOLATED VERSION
// =====================================


const WordChapterCompletionEngine = {


    completeChapter:function(chapterId){



        if(!chapterId){

            return;

        }





        localStorage.setItem(

            "word_" + chapterId + "_completed",

            "true"

        );





        if(

            chapterId === "chapitre1"

        ){


            localStorage.setItem(

                "wordChapter1Completed",

                "true"

            );


            localStorage.setItem(

                "wordChapter2Unlocked",

                "true"

            );


        }





        if(

            typeof WordChapterUnlockEngine !== "undefined"

        ){


            WordChapterUnlockEngine.checkProgress();


        }



    }

};























// =====================================
// MICROSOFT WORD 2007 FORMATION
// PROGRESS SYNC ENGINE
// CONNECT PROGRESS TO COURSE DATA
// =====================================

function syncMicrosoftWordProgress(){


    const progress =

    MicrosoftWordProgressEngine.get();



    microsoftWordCourse.chapters.forEach(

        chapter => {


            if(

                progress.unlockedChapters.includes(

                    chapter.id

                )

            ){

                chapter.unlocked = true;

            }


        }

    );


}

























// =====================================
// MICROSOFT WORD 2007 FORMATION
// COURSE RENDERER ENGINE
// =====================================


function renderMicrosoftWordCourse(){


    const campusContent =

    document.getElementById(
        "campusContent"
    );



    if(!campusContent){

        return;

    }




    if(typeof microsoftWordCourse === "undefined"){

        return;

    }




syncMicrosoftWordProgress();



    let chaptersHTML = "";




const progress =

MicrosoftWordProgressEngine.get();



    microsoftWordCourse.chapters.forEach(

        chapter => {





            const unlocked =

progress.unlockedChapters.includes(

    chapter.id

);




chaptersHTML += `

<button

class="wordChapterBtn"

data-chapter="${chapter.id}"

${!unlocked ? "disabled" : ""}>


${!unlocked ? "🔒" : "📘"} ${chapter.title}


</button>

`;
        }

    );







    campusContent.innerHTML = `


    <div class="microsoft-word-course">


        <h1>

            📘 ${microsoftWordCourse.title}

        </h1>



        <div class="word-chapters-container">


            ${chaptersHTML}


        </div>



        <button
            id="launchMicrosoftWordSimulationBtn"
            class="cwLaunchWordSimulationBtn">


            🚀 Ouvrir Microsoft Word Simulation


        </button>



    </div>


`;







document.querySelectorAll(

    ".wordChapterBtn"

).forEach(


    button => {



        button.addEventListener(

            "click",

            ()=>{



                const chapterId =

                button.dataset.chapter;



// =====================================
// CHAPTER 1 IA ACTIVATION
// =====================================

if(chapterId === "chapitre1"){

    setTimeout(()=>{

        renderChapter1ProfessorIA();


        speakProfessorIA(

            "Bonjour et bienvenue dans le Chapitre 1 de la formation Microsoft Word deux mille sept. Je suis Ranise MOISE, votre professeure. Nous allons apprendre ensemble, étape par étape."

        );


    },50);

}







                const chapter =

                microsoftWordCourse.chapters.find(

                    item =>

                    item.id === chapterId

                );





                if(!chapter){

                    return;

                }





                let theoryHTML = "";





                chapter.theory.forEach(

                    lesson => {


                        theoryHTML += `


                        <div class="word-theory-card">


                            <h4>

                                📘 ${lesson.title}

                            </h4>


                            <p>

                                ${lesson.content}

                            </p>


                        </div>


                        `;


                    }

                );







                let practiceHTML = "";





                chapter.practice.forEach(

                    activity => {



                        let stepsHTML = "";





                        activity.steps.forEach(

                            step => {



                                stepsHTML += `


                                <li>

                                    ${step}

                                </li>


                                `;


                            }

                        );





                        practiceHTML += `


                        <div class="word-practice-card">


                            <h4>

                                🖥️ ${activity.title}

                            </h4>


                            <ol>

                                ${stepsHTML}

                            </ol>


                        </div>


                        `;


                    }

                );








                let exercisesHTML = "";





                chapter.exercises.forEach(

                    exercise => {



                        exercisesHTML += `


                        <li>

                            ${exercise}

                        </li>


                        `;


                    }

                );








                let evaluationHTML = "";





                chapter.evaluation.forEach(

                    item => {



                        evaluationHTML += `


                        <li>

                            ${item}

                        </li>


                        `;


                    }

                );








                campusContent.innerHTML = `



                <div class="microsoft-word-course">


                    <button

                    id="backToWordChaptersBtn"
                    class="wordBackBtn">


                        ⬅️ Retour aux chapitres


                    </button>





                    <h1>

                        📘 ${chapter.title}

                    </h1>





                    <div class="word-section">


                        <h3>

                            📚 Théorie

                        </h3>


                        ${theoryHTML}


                    </div>






                    <div class="word-section">


                        <h3>

                            🖥️ Pratique

                        </h3>


                        ${practiceHTML}


                    </div>






                    <div class="word-section">


                        <h3>

                            ✏️ Exercices

                        </h3>


                        <ul>

                            ${exercisesHTML}

                        </ul>


                    </div>







                    <div class="word-section">


                        <h3>

                            🏠 Devoir

                        </h3>


                        <p>

                            ${chapter.homework}

                        </p>


                    </div>







                    <div class="word-section">


                        <h3>

                            🎓 Évaluation

                        </h3>


                        <ul>

                            ${evaluationHTML}

                        </ul>


                    </div>




                </div>



                `;





                const backButton =

                document.getElementById(

                    "backToWordChaptersBtn"

                );




                if(backButton){


                    backButton.addEventListener(

                        "click",

                        ()=>{


                            renderMicrosoftWordCourse();


                        }

                    );


                }



            }


        );


    }

);







const launchButton =

document.getElementById(

    "launchMicrosoftWordSimulationBtn"

);




if(launchButton){


    launchButton.addEventListener(

        "click",

        ()=>{


            campusContent.innerHTML = `


                <iframe


                src="https://www.fondationbackupspirituel.com/campusword2007simulation"


                style="

                width:100%;

                height:900px;

                border:none;

                border-radius:12px;

                "


                title="Microsoft Word Simulation">


                </iframe>



            `;


        }

    );


}


}














// =====================================
// MICROSOFT WORD 2007 FORMATION
// COURSE INTEGRATION ENGINE
// =====================================


function initializeMicrosoftWordFormation(){


    const button =

    document.getElementById(
        "openMicrosoftWordBtn"
    );



    if(!button){

        return;

    }






    button.addEventListener(

        "click",

        function(){



            const campusContent =

            document.getElementById(
                "campusContent"
            );



            if(!campusContent){

                return;

            }



            renderMicrosoftWordCourse();



        }

    );


}







// =====================================
// AUTO INITIALIZATION
// =====================================


document.addEventListener(

    "DOMContentLoaded",

    function(){


        initializeMicrosoftWordFormation();


    }

);











// =====================================
// MICROSOFT WORD 2007 FORMATION
// PROGRESS VALIDATION ENGINE
// AUTO UNLOCK NEXT CHAPTER
// =====================================


const MicrosoftWordValidationEngine = {


    completeChapter(chapterId){


        const progress =

        MicrosoftWordProgressEngine.get();



        if(

            !progress.completedChapters.includes(

                chapterId

            )

        ){

            progress.completedChapters.push(

                chapterId

            );

        }





        const currentIndex =

        microsoftWordCourse.chapters.findIndex(

            chapter =>

            chapter.id === chapterId

        );





        if(

            currentIndex !== -1 &&

            microsoftWordCourse.chapters[currentIndex + 1]

        ){


            const nextChapter =

            microsoftWordCourse.chapters[

                currentIndex + 1

            ];




            if(

                !progress.unlockedChapters.includes(

                    nextChapter.id

                )

            ){


                progress.unlockedChapters.push(

                    nextChapter.id

                );


            }


        }





        MicrosoftWordProgressEngine.save(

            progress

        );



    }


};














































































// =====================================
// LANGUES
// =====================================

let currentLanguage =
  localStorage.getItem(
    "campusLanguage"
  ) || "fr";

const translations = {

  fr: {

    welcome:
      "Bienvenue sur CampusNumérique",

    subtitle:
      "Plateforme Académique Intelligente",

    notifications:
      "Notifications",

    logout:
      "Déconnexion"
  },

  en: {

    welcome:
      "Welcome to CampusNumérique",

    subtitle:
      "Intelligent Academic Platform",

    notifications:
      "Notifications",

    logout:
      "Logout"
  },

  es: {

    welcome:
      "Bienvenido a CampusNumérique",

    subtitle:
      "Plataforma Académica Inteligente",

    notifications:
      "Notificaciones",

    logout:
      "Cerrar sesión"
  }
};

// =====================================
// LANGUAGE SYSTEM
// =====================================

function setLanguage(lang) {

  currentLanguage = lang;

  localStorage.setItem(
    "campusLanguage",
    lang
  );

  translatePage();
}

function translatePage() {

  const t =
    translations[currentLanguage];

  $("#welcomeText").textContent =
    t.welcome;

  $("#campusSubtitle").textContent =
    t.subtitle;

  $("#notificationBtn").textContent =
    t.notifications;

  $("#logoutBtn").textContent =
    t.logout;
}

function initializeLanguageSystem() {

  $$("[data-lang]")
    .forEach((btn) => {

      btn.addEventListener(
        "click",
        () => {

          setLanguage(
            btn.dataset.lang
          );

        }
      );

    });

  translatePage();
}

// =====================================
// SESSION UTILISATEUR
// =====================================
async function loadCurrentUser() {

    const userData =
        localStorage.getItem(
            "campusUser"
        );

    if (!userData) {

        window.location.href =
            "/campusloginnumeriques.html";

        return null;
    }

    const user =
        JSON.parse(
            userData
        );

    loadProfile(user);

    return user;
}

// =====================================
// REFRESH USER
// =====================================

async function refreshUserData() {

  return await loadCurrentUser();

}

// =====================================
// PROFIL
// =====================================

function loadProfile(user) {

  if (!user) return;

  $("#userFullName").textContent =
    user.nomComplet || "";

  $("#userRole").textContent =
    user.role || "";

  if (
    user.photoProfil &&
    $("#profilePhoto")
  ) {

    $("#profilePhoto").src =
      user.photoProfil;
  }
}

// =====================================
// LOGOUT
// =====================================

function logoutUser() {

  localStorage.removeItem(
    "campusToken"
  );

  localStorage.removeItem(
    "campusUser"
  );

  window.location.href =
    "/campusfobasnumeriques.html";
}

// =====================================
// SIDEBAR MENUS
// =====================================

const roleMenus = {

  etudiant: [

    {
      label: "Mes Formations",
      page: "formationsPage"
    },

    {
      label: "Ma Progression",
      page: "progressionPage"
    },

    {
      label: "Mes Examens",
      page: "examensPage"
    },

    {
      label: "Mes Certificats",
      page: "certificatsPage"
    },

    {
      label: "Professeur IA",
      page: "professeurIAPage"
    },

    {
      label: "Laboratoires",
      page: "laboratoiresPage"
    },

    {
      label: "Mon Profil",
      page: "profilPage"
    }

  ],

  professeur: [

    {
      label: "Mes Étudiants",
      page: "etudiantsPage"
    },

    {
      label: "Mes Classes",
      page: "classesPage"
    },

    {
      label: "Rapports",
      page: "rapportsPage"
    },

    {
      label: "Mon Profil",
      page: "profilPage"
    }

  ],

  directeur: [

    {
      label: "Institution",
      page: "institutionsPage"
    },

    {
      label: "Professeurs",
      page: "professeursPage"
    },

    {
      label: "Étudiants",
      page: "etudiantsPage"
    },

    {
      label: "Rapports",
      page: "rapportsPage"
    },

    {
      label: "Profil",
      page: "profilPage"
    }

  ],

  agent: [

    {
      label: "Parrainage",
      page: "parrainagePage"
    },

    {
      label: "Revenus",
      page: "revenusPage"
    },

    {
      label: "Institutions",
      page: "institutionsPage"
    },

    {
      label: "Profil",
      page: "profilPage"
    }

  ]
};

// =====================================
// BUILD SIDEBAR
// =====================================

function buildSidebar(role) {

  const sidebar =
    $("#campusSidebar");

  if (!sidebar) return;

  sidebar.innerHTML = "";

  roleMenus[role]
    ?.forEach((item) => {

      const button =
        document.createElement(
          "button"
        );

      button.textContent =
        item.label;

      button.addEventListener(
        "click",
        () => {

          openPage(
            item.page
          );

        }
      );

      sidebar.appendChild(
        button
      );
    });
}

// =====================================
// BUILD ROLE
// =====================================

function buildStudentMenu() {
  buildSidebar("etudiant");
}

function buildTeacherMenu() {
  buildSidebar("professeur");
}

function buildDirectorMenu() {
  buildSidebar("directeur");
}

function buildAgentMenu() {
  buildSidebar("agent");
}

async function buildRoleInterface() {

    const user =
        JSON.parse(
            localStorage.getItem(
                "campusUser"
            )
        );

    if (!user) return;

    switch (user.role) {

        case "etudiant":

            buildStudentMenu();

            await loadStudentProgress();

            break;

        case "professeur":

            buildTeacherMenu();

            await loadTeacherStats();

            break;

        case "directeur":

            buildDirectorMenu();

            await loadDirectorStats();

            break;

        case "agent":

            buildAgentMenu();

            await loadAgentProgress();

            break;
    }
}
// =====================================
// PAGES INTERNES
// =====================================

const campusPages = [

  "formationsPage",
  "progressionPage",
  "examensPage",
  "certificatsPage",
  "professeurIAPage",
  "laboratoiresPage",
  "profilPage",
  "institutionsPage",
  "revenusPage",
  "parrainagePage",
  "etudiantsPage",
  "classesPage",
  "professeursPage",
  "rapportsPage"

];

function openPage(pageId) {

  campusPages.forEach(
    (id) => {

      const section =
        document.getElementById(id);

      if (section) {

        section.hidden = true;
      }
    }
  );

  const page =
    document.getElementById(
      pageId
    );

  if (page) {

    page.hidden = false;
  }
}

// =====================================
// EVENTS
// =====================================

function initializeEvents() {

  $("#logoutBtn")
    ?.addEventListener(
      "click",
      logoutUser
    );
}

// =====================================
// INITIALISATION
// =====================================

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    initializeLanguageSystem();

    initializeEvents();

    const user =
      await loadCurrentUser();

    if (!user) return;

    await buildRoleInterface();

  }
);











// =====================================
// LANGUAGE EVENTS
// =====================================

function initializeLanguageButtons() {

    document
        .querySelectorAll(
            "[data-lang]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const lang =
                        button.dataset.lang;

                    setLanguage(lang);

                }
            );

        });
}







// =====================================
// INTERNAL PAGES
// =====================================

const internalPages = [

    "formationsPage",
    "progressionPage",
    "examensPage",
    "certificatsPage",
    "professeurIAPage",
    "laboratoiresPage",
    "profilPage",
    "institutionsPage",
    "revenusPage",
    "parrainagePage",
    "etudiantsPage",
    "classesPage",
    "professeursPage",
    "rapportsPage"

];

function openPage(pageId) {

    internalPages.forEach(id => {

        const page =
            document.getElementById(id);

        if (page) {
            page.hidden = true;
        }

    });

    const target =
        document.getElementById(
            pageId
        );

    if (target) {
        target.hidden = false;
    }
}





// =====================================
// DASHBOARD WIDGETS
// =====================================




// =====================================
// MICROSOFT WORD FORMATION MODULE
// =====================================

function loadMicrosoftWordFormation(){

    const formations =
        document.getElementById(
            "formationsWidget"
        );


    if(!formations){

        return;

    }



    formations.innerHTML += `

        <div class="formation-card">

            <h3>
                📘 Microsoft Word
            </h3>


            <p>
                Formation complète sur
                le traitement de texte
                Microsoft Word 2007.
            </p>


            <button
                id="openMicrosoftWordBtn">

                Commencer la formation

            </button>


        </div>

    `;



    const button =
        document.getElementById(
            "openMicrosoftWordBtn"
        );



    if(button){


button.addEventListener(
    "click",
    ()=>{


renderMicrosoftWordCourse();
     


    }
);


}

}

























async function loadWidgets() {

    const formations =
        document.getElementById(
            "formationsWidget"
        );

    const examens =
        document.getElementById(
            "examensWidget"
        );

    const certificats =
        document.getElementById(
            "certificatsWidget"
        );

    const ai =
        document.getElementById(
            "aiWidget"
        );

    const notifications =
        document.getElementById(
            "notificationsWidget"
        );


  

    if (formations){

    formations.innerHTML =
        "<h3>Formations</h3>";

    loadMicrosoftWordFormation();

};

  
    if (examens)
        examens.innerHTML =
            "<h3>Examens</h3>";





    if (certificats)
        certificats.innerHTML =
            "<h3>Certificats</h3>";



if (ai)

    ai.innerHTML = `


        <div class="ai-professor-card">


            <img

            src="ranise-moise-smile.png"

            alt="Ranise MOISE Professeure IA">


            <h3>
                👩‍🏫 Ranise MOISE
            </h3>


            <p>
                Professeure CampusNumérique FOBAS
            </p>


        </div>


    `;



    if (notifications)
        notifications.innerHTML =
            "<h3>Notifications</h3>";
}

async function updateWidgets() {

    await loadWidgets();

}






document.addEventListener(
    "DOMContentLoaded",
    async () => {

        translatePage();

        initializeLanguageButtons();

        const user =
            await loadCurrentUser();

        if (!user) return;

        buildSidebar(user.role);

        await loadWidgets();

    }
);







// =====================================
// NOTIFICATIONS
// =====================================

async function loadNotifications() {

    try {

        const token =
            localStorage.getItem(
                "campusToken"
            );

        const response =
            await fetch(
                `${API_BASE_URL}/campus/notifications`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        if (!response.ok) return;

        const notifications =
            await response.json();

        const widget =
            document.getElementById(
                "notificationsWidget"
            );

        const modal =
            document.getElementById(
                "notificationModal"
            );

        if (!widget) return;

        widget.innerHTML = `
            <h3>
                Notifications
            </h3>

            <p>
                ${notifications.length}
                notification(s)
            </p>
        `;

        if (modal) {

            modal.innerHTML =
                notifications
                    .map(item => `
                        <div class="notification-item">

                            <h4>
                                ${item.title || ""}
                            </h4>

                            <p>
                                ${item.message || ""}
                            </p>

                        </div>
                    `)
                    .join("");

        }

    } catch (error) {

        console.error(
            "Notifications Error",
            error
        );

    }
}

async function markNotificationRead(
    notificationId
) {

    try {

        const token =
            localStorage.getItem(
                "campusToken"
            );

        await fetch(
            `${API_BASE_URL}/campus/notifications/${notificationId}/read`,
            {
                method: "PATCH",
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

    } catch (error) {

        console.error(error);

    }
}







// =====================================
// CAMPUS NEWS
// =====================================

async function loadCampusNews() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/campus/news`
            );

        if (!response.ok) return;

        const news =
            await response.json();

        const container =
            document.getElementById(
                "newsContainer"
            );

        if (!container) return;

        container.innerHTML =
            news.map(item => `
                <article class="news-card">

                    <h3>
                        ${item.title || ""}
                    </h3>

                    <p>
                        ${item.description || ""}
                    </p>

                </article>
            `).join("");

    } catch (error) {

        console.error(
            "Campus News Error",
            error
        );

    }
}







// =====================================
// CAMPUS ADS
// =====================================

async function loadCampusAds() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/campus/ads`
            );

        if (!response.ok) return;

        const ads =
            await response.json();

        const container =
            document.getElementById(
                "adsContainer"
            );

        if (!container) return;

        container.innerHTML =
            ads.map(ad => `
                <div class="campus-ad">

                    <h3>
                        ${ad.title || ""}
                    </h3>

                    <p>
                        ${ad.description || ""}
                    </p>

                </div>
            `).join("");

    } catch (error) {

        console.error(
            "Ads Error",
            error
        );

    }
}








// =====================================
// RANKINGS
// =====================================

async function loadTopInstitutions() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/campus/rankings/institutions`
            );

        if (!response.ok) return;

        const data =
            await response.json();

        const container =
            document.getElementById(
                "topInstitutions"
            );

        if (!container) return;

        container.innerHTML =
            data.map(item => `
                <div>
                    ${item.nomInstitution}
                </div>
            `).join("");

    } catch (error) {

        console.error(error);

    }
}

async function loadTopStudents() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/campus/rankings/students`
            );

        if (!response.ok) return;

        const data =
            await response.json();

        const container =
            document.getElementById(
                "topStudents"
            );

        if (!container) return;

        container.innerHTML =
            data.map(item => `
                <div>
                    ${item.nomComplet}
                </div>
            `).join("");

    } catch (error) {

        console.error(error);

    }
}

async function loadTopAgents() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/campus/rankings/agents`
            );

        if (!response.ok) return;

        const data =
            await response.json();

        const container =
            document.getElementById(
                "topAgents"
            );

        if (!container) return;

        container.innerHTML =
            data.map(item => `
                <div>
                    ${item.nomComplet}
                </div>
            `).join("");

    } catch (error) {

        console.error(error);

    }
}

async function loadTopTeachers() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/campus/rankings/teachers`
            );

        if (!response.ok) return;

        const data =
            await response.json();

        const container =
            document.getElementById(
                "topTeachers"
            );

        if (!container) return;

        container.innerHTML =
            data.map(item => `
                <div>
                    ${item.nomComplet}
                </div>
            `).join("");

    } catch (error) {

        console.error(error);

    }
}

async function loadRankings() {

    await Promise.all([
        loadTopInstitutions(),
        loadTopStudents(),
        loadTopAgents(),
        loadTopTeachers()
    ]);
}








// =====================================
// PROGRESSIONS
// =====================================

async function loadStudentProgress() {

    const card =
        document.getElementById(
            "studentProgressionCard"
        );

    if (!card) return;

    const user =
        JSON.parse(
            localStorage.getItem(
                "campusUser"
            )
        );

    card.innerHTML = `

        <div class="progress-card">

            <h3>
                📚 Espace Étudiant
            </h3>

            <p>
                <strong>Nom :</strong>
                ${user.nomComplet || "-"}
            </p>

            <p>
                📚 Formations suivies : 0
            </p>

            <p>
                📝 Examens réalisés : 0
            </p>

            <p>
                🏆 Certificats obtenus : 0
            </p>

            <p>
                📈 Progression globale : 0%
            </p>

        </div>
    `;
}


async function loadAgentProgress() {

    const card =
        document.getElementById(
            "agentProgressionCard"
        );

    if (!card) return;

    const user =
        JSON.parse(
            localStorage.getItem(
                "campusUser"
            )
        );

    card.innerHTML = `

        <div class="progress-card">

            <h3>
                🤝 Espace Agent
            </h3>

            <p>
                <strong>Nom :</strong>
                ${user.nomComplet || "-"}
            </p>

            <p>
                🏫 Institutions affiliées : 0
            </p>

            <p>
                🤝 Parrainages : 0
            </p>

            <p>
                💰 Revenus : 0 HTG
            </p>

            <p>
                📈 Performance : 0%
            </p>

        </div>
    `;
}

async function loadTeacherStats() {

    const card =
        document.getElementById(
            "teacherProgressionCard"
        );

    if (!card) return;

    const user =
        JSON.parse(
            localStorage.getItem(
                "campusUser"
            )
        );

    const listeEtudiantsProfHtml =
        (user.listeEtudiantsProf || [])
        .map(etudiant => `
            <li>
                ${etudiant.nomComplet}
                <br>
                Parcours :
                ${etudiant.parcoursAcademique || "-"}
                <br>
                Niveau :
                ${etudiant.niveauEtude || "-"}
            </li>
        `)
        .join("");

    card.innerHTML = `

        <div class="progress-card">

            <h3>
                👨‍🏫 Espace Professeur
            </h3>

            <p>
                <strong>Nom :</strong>
                ${user.nomComplet || "-"}
            </p>

            <p>
                📖 Domaine :
                ${user.domaineEnseignement || "-"}
            </p>

            <p>
                ⭐ Niveau :
                ${user.niveauExperience || "-"}
            </p>

            <p>
                👨‍🎓 Nombre étudiants :
                ${user.nombreEtudiantsProf || 0}
            </p>

            <p>
                📝 Examens créés :
                ${user.nombreExamensCrees || 0}
            </p>

            <div>

                <strong>
                    Liste Étudiants
                </strong>

                <ul>

                    ${listeEtudiantsProfHtml}

                </ul>

            </div>

        </div>

    `;
}




async function loadDirectorStats() {

    const user =
        JSON.parse(
            localStorage.getItem(
                "campusUser"
            )
        );

    const card =
        document.getElementById(
            "directorProgressionCard"
        );

    if (!card || !user) return;


  const listeEtudiantsHtml =
    (user.listeEtudiants || [])
    .map(etudiant => `
        <li>
            ${etudiant.nomComplet}
            <br>
            Parcours :
            ${etudiant.parcoursAcademique || ""}
            <br>
            Professeur :
            ${etudiant.nomProfesseur || ""}
        </li>
    `)
    .join("");

    card.innerHTML = `

        <h3>
            🏢 Espace Directeur
        </h3>

        <p>
            Institution :
            ${user.nomInstitution || "-"}
        </p>

        <p>
            👨‍🏫 Professeurs :
            ${user.nombreProfesseurs || 0}
        </p>

        <p>
            🎓 Étudiants :
            ${user.nombreEtudiants || 0}
        </p>

        <p>
            🌍 Pays :
            ${user.pays || "-"}
        </p>

        <p>
    🏙️ Ville :
    ${user.ville || "-"}
</p>

<div class="director-actions">

    <button
        id="addProfesseurBtn">

        ➕ Ajouter Professeur

    </button>

</div>

<div>

    <strong>
        Liste Professeurs
    </strong>

    <ul>

${(user.professeurs || [])
.map(
    professeur => `
    <li>
        ${professeur}

        <button
            class="delete-prof-btn"
            data-prof="${professeur}">
            🗑️
        </button>

    </li>
    `
)
.join("")}

    </ul>

</div>



<div>

    <strong>
        Liste Étudiants
    </strong>

    <ul>

        ${listeEtudiantsHtml}

        
            </ul>

        </div>

    `;

const addBtn =
    document.getElementById(
        "addProfesseurBtn"
    );

if (addBtn) {

    addBtn.addEventListener(
        "click",
        addProfesseur
    );

}

}




// event bouton supprimer
document
    .querySelectorAll(
        ".delete-prof-btn"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            async () => {

                const nomProfesseur =
                    button.dataset.prof;

                const confirmation =
                    confirm(
                        `Supprimer ${nomProfesseur} ?`
                    );

                if (!confirmation) return;

                await removeProfesseur(
                    nomProfesseur
                );

            }
        );

    });







async function addProfesseur() {

    const user =
        JSON.parse(
            localStorage.getItem(
                "campusUser"
            )
        );

    const nomProfesseur =
        prompt(
            "Nom du professeur"
        );

    if (!nomProfesseur) return;

    const response =
        await fetch(
            `${API_BASE_URL}/academiques/directeur/add-professeur`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    directeurId:
                        user._id,

                    nomProfesseur

                })
            }
        );

    if (response.ok) {

        location.reload();

    }
}








async function removeProfesseur(
    nomProfesseur
) {

    const user =
        JSON.parse(
            localStorage.getItem(
                "campusUser"
            )
        );

    const response =
        await fetch(
            `${API_BASE_URL}/academiques/directeur/remove-professeur`,
            {
                method: "DELETE",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    directeurId:
                        user._id,

                    nomProfesseur

                })
            }
        );

    if (response.ok) {

        location.reload();

    }
}













document.addEventListener(
    "DOMContentLoaded",
    async () => {

        translatePage();

        initializeLanguageButtons();

        const user =
            await loadCurrentUser();

        if (!user) return;

        buildSidebar(user.role);

        await buildRoleInterface();

        await loadWidgets();

        await loadNotifications();

        await loadCampusNews();

        await loadCampusAds();

        await loadRankings();

    }
);





















// =====================================
// CHAPITRE 1 - PROFESSEURE IA ASSISTANT
// ISOLATED MODULE
// =====================================

function renderChapter1ProfessorIA(){


    const campusContent =

    document.getElementById(
        "campusContent"
    );


    if(!campusContent){

        return;

    }



    const existingIA =

    document.getElementById(
        "chapter1ProfessorIA"
    );


    if(existingIA){

        return;

    }



    const iaBox =

    document.createElement(
        "div"
    );


    iaBox.id =
    "chapter1ProfessorIA";



    iaBox.innerHTML = `


        <div class="chapter1-ia-card">


            <img

            src="ranise-moise-smile.png"

            alt="Ranise MOISE Professeure IA">



            <h3>
                👩‍🏫 Ranise MOISE
            </h3>


            <p>
                Professeure CampusNumérique FOBAS
            </p>


            <p>
                Bienvenue dans le Chapitre 1 de la formation Microsoft Word 2007.
            </p>


        </div>


    `;



    campusContent.prepend(

        iaBox

    );


}
















// =====================================
// RANISE MOISE
// FRENCH VOICE ENGINE
// =====================================

function speakProfessorIA(message){

    if(!window.speechSynthesis){
        return;
    }

    const speechEngine = window.speechSynthesis;

    speechEngine.cancel();

    const speech = new SpeechSynthesisUtterance();

    speech.text = message;
    speech.lang = "fr-FR";
    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;

    function speakNow(){

        const voices = speechEngine.getVoices();

        const voice = voices.find(v=>v.lang && v.lang.startsWith("fr"));


if(voice){
    speech.voice = voice;
}


raniseStartTalking();


speech.onend = ()=>{

    raniseStopTalking();

};


speech.onerror = ()=>{

    raniseStopTalking();

};


speechEngine.speak(speech);

    }



    if(speechEngine.getVoices().length > 0){

        setTimeout(speakNow,150);

    }else{

        speechEngine.onvoiceschanged = ()=>{

            setTimeout(speakNow,150);

        };

    }

}











// =====================================
// RANISE MOISE AVATAR TALKING ENGINE
// =====================================

let raniseTalkingTimer = null;

function raniseStartTalking(){

    const img = document.querySelector(
        'img[alt="Ranise MOISE Professeure IA"]'
    );

    if(!img){
        return;
    }


    let speaking = false;


    clearInterval(raniseTalkingTimer);


    raniseTalkingTimer = setInterval(()=>{


        speaking = !speaking;


        if(speaking){

            img.src = "ranise-moise-speaking-smile.png";

        }else{

            img.src = "ranise-moise-smile.png";

        }


    },180);


}



function raniseStopTalking(){

    clearInterval(raniseTalkingTimer);


    const img = document.querySelector(
        'img[alt="Ranise MOISE Professeure IA"]'
    );


    if(img){

        img.src = "ranise-moise-smile.png";

    }

}
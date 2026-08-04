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




const chapter1AudioText =

"Bienvenue dans votre première formation Microsoft Word 2007. " +
"Je suis Ranise Moise, votre professeure IA de CampusNumérique FOBAS. " +
"Je vais vous accompagner étape par étape pour maîtriser le traitement de texte.";


const chapter1Audio = {

    volume: 1,

    onplay: ()=>{

        raniseStartTalking();

    },

    onended: ()=>{

        raniseStopTalking();

    },

    onerror: ()=>{

        raniseStopTalking();

    }

};



setTimeout(()=>{

    speakProfessorIAWithMaryTTS(
        chapter1AudioText
    );




// =====================================
// RANISE IA
// START FIRST THEORY LESSON
// AFTER WELCOME AUDIO
// =====================================

if(
    typeof RaniseMoiseTheoryTeachingEngine !==
    "undefined" &&
    typeof RaniseMoiseTheoryTeachingEngine.teachFirstLesson ===
    "function"
){

    await RaniseMoiseTheoryTeachingEngine
        .teachFirstLesson();

}







},200);

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
// TALK TO AI PROFESSOR
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


            <div class="chapter1-ia-topbar">

                <div class="chapter1-ia-title">

                    <span class="chapter1-ia-icon">
                        👩‍🏫
                    </span>

                    <div>

                        <h3>
                            Ranise MOISE
                        </h3>

                        <span>
                            Professeure IA
                        </span>

                    </div>

                </div>



                <button
                    type="button"
                    id="talkToAIProfessorBtn"
                    class="talk-to-ai-professor-btn"
                    aria-expanded="false"
                    aria-controls="talkToAIProfessorPanel"
                >

                    🎤 Talk

                </button>

            </div>



            <img

                id="chapterProfessorAvatar"

                src="ranise-moise-smile.png"

                alt="Ranise MOISE Professeure IA"

                class="chapter-professor-avatar"

            >



            <p class="chapter1-ia-role">

                Professeure CampusNumérique FOBAS

            </p>



            <p class="chapter1-ia-welcome">

                Bienvenue dans le Chapitre 1 de la formation Microsoft Word 2007.

            </p>



            <div
                id="talkToAIProfessorPanel"
                class="talk-to-ai-professor-panel"
                hidden
            >


                <div class="talk-ai-header">

                    <strong>
                        🎓 Talk to AI Professor
                    </strong>

                    <button
                        type="button"
                        id="closeTalkToAIProfessorBtn"
                        class="talk-ai-close-btn"
                        aria-label="Close"
                    >

                        ✕

                    </button>

                </div>




<div
    id="talkAIConversation"
    class="talk-ai-conversation"
    aria-live="polite"
>

    <div class="talk-ai-message professor-message">

        <strong>
            Professor:
        </strong>

       <span>
    Bonjour, je suis Ranise MOISE, votre Professeure IA CampusNumérique.

    Je suis ravie de vous accueillir dans votre espace d’apprentissage dédié à Microsoft Word 2007.

    Ma mission est de vous accompagner tout au long de votre formation, étape par étape, en vous expliquant les concepts importants, en répondant à vos questions et en vous aidant à développer vos compétences en bureautique.

    Vous pouvez me demander des explications détaillées, des exemples pratiques, des conseils ou de l’aide pour réussir vos exercices.

    Je m’adapte à votre niveau afin de vous proposer un accompagnement personnalisé et de vous permettre de progresser avec confiance.

    Mon objectif est de vous aider à maîtriser Microsoft Word 2007 et à devenir plus autonome dans l’utilisation des outils informatiques.

    Bienvenue dans votre formation avec CampusNumérique. Je suis prête à vous accompagner. Commençons ensemble.
</span>    

    </div>

</div>





                <div class="talk-ai-input-row">


                    <textarea

                        id="talkAIProfessorInput"

                        class="talk-ai-input"

                        rows="1"

                        placeholder="Type your question..."

                        autocomplete="off"

                    ></textarea>



                    <button
                        type="button"
                        id="talkAISendBtn"
                        class="talk-ai-send-btn"
                        aria-label="Send"
                    >

                        ➤

                    </button>


                </div>



                <div class="talk-ai-actions">


                    <button
                        type="button"
                        id="talkAISpeakBtn"
                        class="talk-ai-action-btn"
                    >

                        🎤 Speak

                    </button>



                    <button
                        type="button"
                        id="talkAIProfessorVoiceBtn"
                        class="talk-ai-action-btn"
                    >

                        🔊 Professor

                    </button>


                </div>



                <div
                    id="talkAIStatus"
                    class="talk-ai-status"
                >

                    Ready

                </div>


            </div>


        </div>

    `;



    campusContent.prepend(

        iaBox

    );



    initializeTalkToAIProfessor();

}









// =====================================
// TALK TO AI PROFESSOR
// INITIALIZATION
// MARYTTS CAMILLE FRENCH VOICE COMPATIBLE
// =====================================

function initializeTalkToAIProfessor(){


    const talkButton =
        document.getElementById(
            "talkToAIProfessorBtn"
        );


    const closeButton =
        document.getElementById(
            "closeTalkToAIProfessorBtn"
        );


    const sendButton =
        document.getElementById(
            "talkAISendBtn"
        );


    const speakButton =
        document.getElementById(
            "talkAISpeakBtn"
        );


    const professorVoiceButton =
        document.getElementById(
            "talkAIProfessorVoiceBtn"
        );


    const input =
        document.getElementById(
            "talkAIProfessorInput"
        );



    if(
        !talkButton ||
        !closeButton ||
        !sendButton ||
        !input
    ){

        return;

    }



    talkButton.onclick = function(){


        const panel =
            document.getElementById(
                "talkToAIProfessorPanel"
            );


        if(!panel){

            return;

        }


        const isOpen =
            !panel.hidden;


        panel.hidden =
            isOpen;


        talkButton.setAttribute(
            "aria-expanded",
            String(!isOpen)
        );


        if(!isOpen){

            setTimeout(()=>{

                input.focus();

            },100);

        }

    };



    closeButton.onclick = function(){


        const panel =
            document.getElementById(
                "talkToAIProfessorPanel"
            );


        if(panel){

            panel.hidden = true;

        }


        talkButton.setAttribute(
            "aria-expanded",
            "false"
        );

    };



    sendButton.onclick = function(){

        talkToAIProfessorSend();

    };



    input.addEventListener(
        "keydown",
        function(event){

            if(
                event.key === "Enter" &&
                !event.shiftKey
            ){

                event.preventDefault();

                talkToAIProfessorSend();

            }

        }
    );



    if(speakButton){

        speakButton.onclick = function(){

            talkToAIProfessorStartListening();

        };

    }



    if(professorVoiceButton){

        professorVoiceButton.onclick =
            async function(){

                const lastProfessorMessage =
                    window.campusLastProfessorResponse;



                if(
                    lastProfessorMessage &&
                    typeof speakProfessorIAWithMaryTTS ===
                    "function"
                ){

                    await speakProfessorIAWithMaryTTS(
                        lastProfessorMessage
                    );

                }

            };

    }

}







// =====================================
// TALK TO AI PROFESSOR
// SEND TEXT
// =====================================

async function talkToAIProfessorSend(){


    const input =
        document.getElementById(
            "talkAIProfessorInput"
        );


    if(!input){

        return;

    }



    const message =
        input.value.trim();


    if(!message){

        return;

    }



    input.value = "";



    talkToAIProfessorAddMessage(
        "student",
        message
    );



    talkToAIProfessorSetStatus(
        "Professor is thinking..."
    );



    try{


        const response =
            await requestCampusAIProfessor(
                message
            );



        if(
            !response ||
            !response.trim()
        ){

            throw new Error(
                "EMPTY_AI_RESPONSE"
            );

        }



        window.campusLastProfessorResponse =
            response;



        talkToAIProfessorAddMessage(
            "professor",
            response
        );



        talkToAIProfessorSetStatus(
            "Professor ready"
        );




if(
    typeof speakProfessorIAWithMaryTTS ===
    "function"
){

    await speakProfessorIAWithMaryTTS(
        response
    );

}







    }catch(error){


        console.error(
            "Talk to AI Professor:",
            error
        );



const fallback =
    "Je suis prête à vous aider à apprendre Microsoft Word 2007. Veuillez vérifier que le service Professeur IA est connecté, puis posez votre question.";



        

        talkToAIProfessorAddMessage(
            "professor",
            fallback
        );


        talkToAIProfessorSetStatus(
            "AI connection unavailable"
        );

    }

}







// =====================================
// TALK TO AI PROFESSOR
// MESSAGE RENDERER
// =====================================

function talkToAIProfessorAddMessage(
    sender,
    message
){


    const conversation =
        document.getElementById(
            "talkAIConversation"
        );


    if(!conversation){

        return;

    }



    const messageBox =
        document.createElement(
            "div"
        );


    messageBox.className =
        sender === "student"
        ? "talk-ai-message student-message"
        : "talk-ai-message professor-message";



    const label =
        sender === "student"
        ? "You:"
        : "Professor:";



    const strong =
        document.createElement(
            "strong"
        );


    strong.textContent =
        label;



    const text =
        document.createElement(
            "span"
        );


    text.textContent =
        message;



    messageBox.appendChild(
        strong
    );


    messageBox.appendChild(
        text
    );



    conversation.appendChild(
        messageBox
    );



    conversation.scrollTop =
        conversation.scrollHeight;

}







// =====================================
// TALK TO AI PROFESSOR
// STATUS
// =====================================

function talkToAIProfessorSetStatus(
    message
){


    const status =
        document.getElementById(
            "talkAIStatus"
        );


    if(status){

        status.textContent =
            message;

    }

}







// =====================================
// TALK TO AI PROFESSOR
// MICROPHONE / SPEECH TO TEXT
// =====================================

let campusProfessorRecognition = null;



function talkToAIProfessorStartListening(){


    const input =
        document.getElementById(
            "talkAIProfessorInput"
        );


    const speakButton =
        document.getElementById(
            "talkAISpeakBtn"
        );


    if(!input){

        return;

    }



    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;



    if(!SpeechRecognition){

        talkToAIProfessorSetStatus(
            "Speech recognition is not supported on this browser."
        );

        return;

    }



    if(campusProfessorRecognition){

        try{

            campusProfessorRecognition.stop();

        }catch(error){}

    }



    campusProfessorRecognition =
        new SpeechRecognition();



    campusProfessorRecognition.lang =
        "fr-FR";


    campusProfessorRecognition.continuous =
        false;


    campusProfessorRecognition.interimResults =
        false;


    campusProfessorRecognition.maxAlternatives =
        1;



    if(speakButton){

        speakButton.textContent =
            "🎤 Listening...";

    }



    talkToAIProfessorSetStatus(
        "Listening..."
    );



    campusProfessorRecognition.onresult =
        function(event){


            const transcript =
                event.results[0][0].transcript;


            input.value =
                transcript;



            talkToAIProfessorSetStatus(
                "Message received"
            );


        };



    campusProfessorRecognition.onerror =
        function(event){


            talkToAIProfessorSetStatus(
                "Microphone error: " +
                event.error
            );


        };



    campusProfessorRecognition.onend =
        function(){


            if(speakButton){

                speakButton.textContent =
                    "🎤 Speak";

            }


        };



    try{

        campusProfessorRecognition.start();

    }catch(error){

        talkToAIProfessorSetStatus(
            "Microphone could not start."
        );

    }

}







// =====================================
// CAMPUS AI PROFESSOR
// FOBAS GROQ BRIDGE
// =====================================

window.CampusAIProfessor = {

    async ask(data) {

        const response = await fetch(
            'https://api.fondationbackupspirituel.com/api/ai-professor',
            {

                method: 'POST',

                headers: {

                    'Content-Type':
                        'application/json'

                },

                body: JSON.stringify({

                    message:
                        data.message,

                    course:
                        data.course,

                    chapter:
                        data.chapter,

                    language:
                        data.language

                })

            }
        );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(

                result.error ||
                'AI Professor request failed.'

            );

        }


        return result.text;

    }

};




















// =====================================
// CAMPUS AI PROFESSOR
// REQUEST BRIDGE
// CONNECTS TALK UI TO GROQ BRIDGE
// ISOLATED MODULE
// =====================================

async function requestCampusAIProfessor(message){

    if(
        !message ||
        typeof message !== "string" ||
        !message.trim()
    ){

        throw new Error(
            "AI_MESSAGE_EMPTY"
        );

    }


    if(
        !window.CampusAIProfessor ||
        typeof window.CampusAIProfessor.ask !== "function"
    ){

        throw new Error(
            "CAMPUS_AI_PROFESSOR_BRIDGE_NOT_AVAILABLE"
        );

    }


    const response =
        await window.CampusAIProfessor.ask({

            message:
                message.trim(),

            course:
                "Microsoft Word 2007",

            chapter:
                "Chapitre 1",

            language:
                "fr-FR"

        });


    if(
        !response ||
        typeof response !== "string" ||
        !response.trim()
    ){

        throw new Error(
            "AI_EMPTY_RESPONSE"
        );

    }


    return response.trim();

}



































// =====================================
// CAMPUS AI PROFESSOR
// MARYTTS CAMILLE FRENCH VOICE BRIDGE
// CONNECTS GROQ TEXT TO MARYTTS
// FULLY COMPATIBLE WITH
// /api/ranise/voice
// =====================================

let raniseProfessorAudio = null;



async function speakProfessorIAWithMaryTTS(text){

    console.log(
        "=== MARYTTS FRONTEND START ==="
    );


    if(
        !text ||
        typeof text !== "string" ||
        !text.trim()
    ){

        console.error(
            "MARYTTS ERROR: EMPTY TEXT"
        );

        return;

    }



    try{

        console.log(
            "MARYTTS: SENDING TEXT TO BACKEND"
        );



        const response =
            await fetch(

                "https://api.fondationbackupspirituel.com/api/ranise/voice",

                {

                    method:"POST",

                    headers:{

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            text:
                                text.trim()

                        })

                }
            );



        console.log(

            "MARYTTS RESPONSE:",

            response.status

        );



        if(!response.ok){

            const errorText =
                await response.text();

            console.error(
                "MARYTTS BACKEND ERROR:",
                errorText
            );

            throw new Error(
                "MARYTTS_REQUEST_FAILED"
            );

        }



        const result =
            await response.json();



        if(

            !result ||
            typeof result.audio !== "string" ||
            !result.audio

        ){

            throw new Error(
                "MARYTTS_AUDIO_MISSING"
            );

        }



        const mimeType =
            result.mimeType ||
            "audio/wav";



        const binaryString =
            atob(
                result.audio
            );



        const bytes =
            new Uint8Array(
                binaryString.length
            );



        for(

            let i = 0;

            i < binaryString.length;

            i++

        ){

            bytes[i] =
                binaryString.charCodeAt(i);

        }



        const audioBlob =
            new Blob(

                [bytes],

                {

                    type:
                        mimeType

                }

            );



        const audioUrl =
            URL.createObjectURL(
                audioBlob
            );



        if(
            raniseProfessorAudio
        ){

            try{

                raniseProfessorAudio.pause();

                raniseProfessorAudio.currentTime =
                    0;

            }catch(error){}

        }



        raniseProfessorAudio =
            new Audio(
                audioUrl
            );



        raniseProfessorAudio.volume = 1;



        raniseProfessorAudio.onplay =
            function(){

                console.log(
                    "MARYTTS AUDIO PLAYING"
                );

                if(

                    typeof raniseStartTalking ===
                    "function"

                ){

                    raniseStartTalking();

                }

            };



        raniseProfessorAudio.onended =
            function(){

                console.log(
                    "MARYTTS AUDIO ENDED"
                );

                if(

                    typeof raniseStopTalking ===
                    "function"

                ){

                    raniseStopTalking();

                }

                URL.revokeObjectURL(
                    audioUrl
                );

            };



        raniseProfessorAudio.onerror =
            function(){

                console.error(
                    "MARYTTS AUDIO ERROR"
                );

                if(

                    typeof raniseStopTalking ===
                    "function"

                ){

                    raniseStopTalking();

                }

                URL.revokeObjectURL(
                    audioUrl
                );

            };



        await raniseProfessorAudio.play();



        console.log(
            "=== MARYTTS SUCCESS ==="
        );



    }catch(error){

        console.error(
            "MARYTTS FRONTEND ERROR:",
            error
        );



        if(

            typeof raniseStopTalking ===
            "function"

        ){

            raniseStopTalking();

        }



        if(

            typeof talkToAIProfessorSetStatus ===
            "function"

        ){

            talkToAIProfessorSetStatus(

                "French voice unavailable."

            );

        }

    }

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



speech.onstart = ()=>{

    raniseStartTalking();

};



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



const img = document.getElementById(
    "chapterProfessorAvatar"
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


    },300);


}



function raniseStopTalking(){

    clearInterval(raniseTalkingTimer);



const img = document.getElementById(
    "chapterProfessorAvatar"
);






    if(img){

        img.src = "ranise-moise-smile.png";

    }

}







































// =====================================
// RANISE MOISE IA PROFESSOR
// PEDAGOGICAL ENGINE
// BLOCK 1 - COURSE READER
// READ-ONLY / ISOLATED
// MICROSOFT WORD 2007 - CHAPITRE 1
// =====================================


const RaniseMoisePedagogicalEngine = {


    // =====================================
    // GET CHAPTER
    // READ ONLY
    // =====================================

    getChapter:function(chapterId){


        if(
            typeof microsoftWordCourse ===
            "undefined"
        ){

            return null;

        }



        if(
            !microsoftWordCourse.chapters ||
            !Array.isArray(
                microsoftWordCourse.chapters
            )
        ){

            return null;

        }



        return microsoftWordCourse.chapters.find(

            chapter =>

            chapter.id === chapterId

        ) || null;


    },





    // =====================================
    // GET CHAPTER 1
    // =====================================

    getChapter1:function(){


        return this.getChapter(
            "chapitre1"
        );


    },





    // =====================================
    // VERIFY CHAPTER STRUCTURE
    // READ ONLY
    // =====================================

    verifyChapter:function(chapter){


        if(!chapter){

            return false;

        }



        if(
            typeof chapter.id !==
            "string"
        ){

            return false;

        }



        if(
            typeof chapter.title !==
            "string"
        ){

            return false;

        }



        if(
            !Array.isArray(
                chapter.theory
            )
        ){

            return false;

        }



        if(
            !Array.isArray(
                chapter.practice
            )
        ){

            return false;

        }



        if(
            !Array.isArray(
                chapter.exercises
            )
        ){

            return false;

        }



        if(
            typeof chapter.homework !==
            "string"
        ){

            return false;

        }



        if(
            !Array.isArray(
                chapter.evaluation
            )
        ){

            return false;

        }



        if(
            !Array.isArray(
                chapter.objective
            )
        ){

            return false;

        }



        return true;


    },





    // =====================================
    // READ CHAPTER 1 PEDAGOGICAL DATA
    // READ ONLY
    // =====================================

    readChapter1:function(){


        const chapter =
            this.getChapter1();



        if(
            !this.verifyChapter(
                chapter
            )
        ){

            return null;

        }



        return {

            id:
                chapter.id,

            title:
                chapter.title,

            theory:
                chapter.theory,

            practice:
                chapter.practice,

            exercises:
                chapter.exercises,

            homework:
                chapter.homework,

            evaluation:
                chapter.evaluation,

            objective:
                chapter.objective

        };


    },


};





// =====================================
// RANISE MOISE IA PROFESSOR
// BLOCK 1 VERIFICATION
// =====================================

(function(){

    const chapter1 =
        RaniseMoisePedagogicalEngine
            .getChapter1();



    if(
        RaniseMoisePedagogicalEngine
            .verifyChapter(
                chapter1
            )
    ){

        console.log(
            "RANISE PEDAGOGICAL ENGINE: CHAPITRE 1 READY"
        );

    }else{

        console.error(
            "RANISE PEDAGOGICAL ENGINE: CHAPITRE 1 NOT AVAILABLE"
        );

    }

})();












// =====================================
// RANISE MOISE IA PROFESSOR
// PEDAGOGICAL ENGINE
// BLOCK 2 - LESSON STRUCTURE
// READ-ONLY / ISOLATED
// MICROSOFT WORD 2007 - CHAPITRE 1
// COMPATIBLE WITH BLOCK 1
// =====================================


const RaniseMoiseLessonEngine = {


    // =====================================
    // GET CHAPTER 1 PEDAGOGICAL DATA
    // READ ONLY
    // =====================================

    getChapter1Data:function(){


        if(
            typeof RaniseMoisePedagogicalEngine ===
            "undefined"
        ){

            return null;

        }



        return RaniseMoisePedagogicalEngine
            .readChapter1();


    },





    // =====================================
    // COUNT THEORY LESSONS
    // READ ONLY
    // =====================================

    getTheoryCount:function(){


        const chapter =
            this.getChapter1Data();



        if(!chapter){

            return 0;

        }



        return chapter.theory.length;


    },





    // =====================================
    // COUNT PRACTICAL ACTIVITIES
    // READ ONLY
    // =====================================

    getPracticeCount:function(){


        const chapter =
            this.getChapter1Data();



        if(!chapter){

            return 0;

        }



        return chapter.practice.length;


    },





    // =====================================
    // COUNT EXERCISES
    // READ ONLY
    // =====================================

    getExerciseCount:function(){


        const chapter =
            this.getChapter1Data();



        if(!chapter){

            return 0;

        }



        return chapter.exercises.length;


    },





    // =====================================
    // BUILD LESSON MAP
    // READ ONLY
    // =====================================

    buildChapter1Map:function(){


        const chapter =
            this.getChapter1Data();



        if(!chapter){

            return null;

        }



        return {

            chapterId:
                chapter.id,

            title:
                chapter.title,

            objectives:
                chapter.objective,

            theory:
                chapter.theory,

            practice:
                chapter.practice,

            exercises:
                chapter.exercises,

            homework:
                chapter.homework,

            evaluation:
                chapter.evaluation,

            theoryCount:
                chapter.theory.length,

            practiceCount:
                chapter.practice.length,

            exerciseCount:
                chapter.exercises.length

        };


    },


};






















// =====================================
// RANISE MOISE IA PROFESSOR
// PEDAGOGICAL ENGINE
// BLOCK 3 - THEORY LESSON ENGINE
// READ-ONLY / ISOLATED
// MICROSOFT WORD 2007 - CHAPITRE 1
// COMPATIBLE WITH BLOCK 1 + BLOCK 2
// =====================================


const RaniseMoiseTheoryEngine = {


    // =====================================
    // GET THEORY DATA
    // READ ONLY
    // =====================================

    getTheory:function(){


        if(
            typeof RaniseMoiseLessonEngine ===
            "undefined"
        ){

            return [];

        }



        const chapter =
            RaniseMoiseLessonEngine
                .getChapter1Data();



        if(
            !chapter ||
            !Array.isArray(
                chapter.theory
            )
        ){

            return [];

        }



        return chapter.theory;

    },





    // =====================================
    // GET THEORY LESSON
    // READ ONLY
    // =====================================

    getLesson:function(index){


        const theory =
            this.getTheory();



        if(
            !Number.isInteger(index) ||
            index < 0 ||
            index >= theory.length
        ){

            return null;

        }



        const lesson =
            theory[index];



        if(
            !lesson ||
            typeof lesson.title !==
            "string" ||
            typeof lesson.content !==
            "string"
        ){

            return null;

        }



        return {

            index:
                index,

            title:
                lesson.title,

            content:
                lesson.content

        };

    },





    // =====================================
    // GET FIRST THEORY LESSON
    // READ ONLY
    // =====================================

    getFirstLesson:function(){


        return this.getLesson(0);

    },





    // =====================================
    // CREATE CURRENT LESSON STATE
    // READ ONLY
    // =====================================

    createLessonState:function(index){


        const lesson =
            this.getLesson(index);



        if(!lesson){

            return null;

        }



        return {

            chapterId:
                "chapitre1",

            section:
                "theory",

            lessonIndex:
                lesson.index,

            lessonTitle:
                lesson.title,

            lessonContent:
                lesson.content,

            status:
                "ready"

        };

    },





    // =====================================
    // PREPARE FIRST THEORY LESSON
    // READ ONLY
    // =====================================

    prepareFirstLesson:function(){


        const lesson =
            this.getFirstLesson();



        if(!lesson){

            return null;

        }



        return this.createLessonState(
            lesson.index
        );

    }


};





// =====================================
// RANISE MOISE IA PROFESSOR
// BLOCK 3 VERIFICATION
// =====================================

(function(){


    const firstLesson =
        RaniseMoiseTheoryEngine
            .prepareFirstLesson();



    if(firstLesson){


        console.log(
            "RANISE THEORY ENGINE: FIRST LESSON READY"
        );


        console.log(
            "RANISE THEORY LESSON:",
            firstLesson.lessonTitle
        );


    }else{


        console.error(
            "RANISE THEORY ENGINE: FIRST LESSON NOT AVAILABLE"
        );


    }


})();














// =====================================
// RANISE MOISE IA PROFESSOR
// PEDAGOGICAL ENGINE
// BLOCK 4 - THEORY TEACHING ENGINE
// READ-ONLY / ISOLATED
// MICROSOFT WORD 2007 - CHAPITRE 1
// COMPATIBLE WITH BLOCK 3
// MARYTTS ONLY
// =====================================


const RaniseMoiseTheoryTeachingEngine = {


    // =====================================
    // GET FIRST THEORY LESSON
    // READ ONLY
    // =====================================

    getFirstLesson:function(){


        if(
            typeof RaniseMoiseTheoryEngine ===
            "undefined"
        ){

            return null;

        }



        return RaniseMoiseTheoryEngine
            .getFirstLesson();


    },





    // =====================================
    // BUILD PEDAGOGICAL EXPLANATION
    // READ ONLY
    // =====================================

    buildExplanation:function(lesson){


        if(!lesson){

            return null;

        }



        if(
            typeof lesson.title !==
            "string" ||
            typeof lesson.content !==
            "string"
        ){

            return null;

        }



        const explanation =

            "Commençons cette première notion. " +

            "Le sujet que nous allons étudier est : " +

            lesson.title +

            ". " +

            "Voici l’idée essentielle à comprendre : " +

            lesson.content;



        return explanation;


    },





    // =====================================
    // TEACH FIRST THEORY LESSON
    // READ ONLY
    // =====================================

    teachFirstLesson:async function(){


        const lesson =
            this.getFirstLesson();



        if(!lesson){

            console.error(
                "RANISE THEORY TEACHING ENGINE: FIRST LESSON NOT AVAILABLE"
            );

            return false;

        }



        const explanation =
            this.buildExplanation(
                lesson
            );



        if(
            !explanation
        ){

            console.error(
                "RANISE THEORY TEACHING ENGINE: EXPLANATION NOT AVAILABLE"
            );

            return false;

        }



        console.log(
            "RANISE THEORY TEACHING ENGINE: TEACHING FIRST LESSON",
            lesson.title
        );



        if(
            typeof speakProfessorIACamille !==
            "function"
        ){

            console.error(
                "RANISE THEORY TEACHING ENGINE: MARYTTS FUNCTION NOT AVAILABLE"
            );

            return false;

        }



        try{


            if(
                typeof raniseStartTalking ===
                "function"
            ){

                raniseStartTalking();

            }



            await speakProfessorIACamille(
                explanation
            );



            return true;



        }catch(error){


            console.error(
                "RANISE THEORY TEACHING ENGINE: MARYTTS ERROR",
                error
            );


            return false;


        }


    }


};





// =====================================
// RANISE MOISE IA PROFESSOR
// BLOCK 4 VERIFICATION
// =====================================

(function(){


    const lesson =
        RaniseMoiseTheoryTeachingEngine
            .getFirstLesson();



    if(lesson){

        console.log(
            "RANISE THEORY TEACHING ENGINE: FIRST LESSON READY TO TEACH"
        );

    }else{

        console.error(
            "RANISE THEORY TEACHING ENGINE: FIRST LESSON NOT AVAILABLE"
        );

    }


})();
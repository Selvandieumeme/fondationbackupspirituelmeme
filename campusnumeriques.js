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



setTimeout(async ()=>{

    await speakProfessorIAWithMaryTTS(
        chapter1AudioText
    );



    // =====================================
    // BLOCK 4
    // FIRST THEORY LESSON READING
    // MUST FINISH COMPLETELY FIRST
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



    // =====================================
    // BLOCK 5
    // PEDAGOGICAL EXPLANATION
    // STARTS ONLY AFTER BLOCK 4 FINISHES
    // =====================================

    if(
        typeof RaniseMoisePedagogicalExplanationEngine !==
        "undefined" &&
        typeof RaniseMoisePedagogicalExplanationEngine.teachExplanation ===
        "function"
    ){

        await RaniseMoisePedagogicalExplanationEngine
            .teachExplanation();

    }







// =====================================
// BLOCK 6
// PRACTICE TEACHING
// STARTS ONLY AFTER BLOCK 5 FINISHES
// =====================================

if(
    typeof RaniseMoisePracticeTeachingEngine !==
    "undefined" &&
    typeof RaniseMoisePracticeTeachingEngine.teachFirstPractice ===
    "function"
){

    await RaniseMoisePracticeTeachingEngine
        .teachFirstPractice();

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



        // =====================================
        // WAIT FOR REAL AUDIO PLAYBACK
        // =====================================

        await new Promise(
            function(resolve, reject){

                let finished =
                    false;



                function cleanup(){

                    if(
                        raniseProfessorAudio
                    ){

                        raniseProfessorAudio.onplay =
                            null;

                        raniseProfessorAudio.onended =
                            null;

                        raniseProfessorAudio.onerror =
                            null;

                    }

                }



                function finishSuccess(){

                    if(finished){

                        return;

                    }



                    finished =
                        true;



                    cleanup();



                    if(

                        typeof raniseStopTalking ===
                        "function"

                    ){

                        raniseStopTalking();

                    }



                    try{

                        URL.revokeObjectURL(
                            audioUrl
                        );

                    }catch(error){}



                    resolve();

                }



                function finishError(error){

                    if(finished){

                        return;

                    }



                    finished =
                        true;



                    cleanup();



                    if(

                        typeof raniseStopTalking ===
                        "function"

                    ){

                        raniseStopTalking();

                    }



                    try{

                        URL.revokeObjectURL(
                            audioUrl
                        );

                    }catch(error){}



                    reject(error);

                }



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



                // =====================================
                // CRITICAL:
                // PROMISE RESOLVES ONLY WHEN
                // THE COMPLETE AUDIO HAS ENDED
                // =====================================

                raniseProfessorAudio.onended =
                    function(){

                        console.log(
                            "MARYTTS AUDIO ENDED"
                        );



                        finishSuccess();

                    };



                raniseProfessorAudio.onerror =
                    function(){

                        console.error(
                            "MARYTTS AUDIO ERROR"
                        );



                        finishError(
                            new Error(
                                "MARYTTS_AUDIO_PLAYBACK_ERROR"
                            )
                        );

                    };



                let playPromise;



                try{

                    playPromise =
                        raniseProfessorAudio.play();

                }catch(playError){

                    finishError(
                        playError
                    );

                    return;

                }



                if(

                    playPromise &&
                    typeof playPromise.catch ===
                    "function"

                ){

                    playPromise.catch(
                        function(playError){

                            finishError(
                                playError
                            );

                        }
                    );

                }

            }
        );



        console.log(
            "=== MARYTTS AUDIO COMPLETELY FINISHED ==="
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
    // GET ALL THEORY LESSONS
    // READ ONLY
    // ADDED WITHOUT CHANGING EXISTING
    // FIRST LESSON ARCHITECTURE
    // =====================================

    getAllTheoryLessons:function(){


        if(
            typeof RaniseMoiseTheoryEngine ===
            "undefined"
        ){

            return [];

        }



        const chapter =
            RaniseMoiseTheoryEngine
                .getTheory();



        if(
            !Array.isArray(chapter)
        ){

            return [];

        }



        return chapter;


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
    // NOW READS ALL THEORY PARTS
    // ONE AFTER ANOTHER
    // =====================================

    teachFirstLesson:async function(){


        const lessons =
            this.getAllTheoryLessons();



        if(
            !Array.isArray(lessons) ||
            !lessons.length
        ){

            console.error(
                "RANISE THEORY TEACHING ENGINE: THEORY LESSONS NOT AVAILABLE"
            );

            return false;

        }



        console.log(
            "RANISE THEORY TEACHING ENGINE: THEORY LESSONS READY",
            lessons.length
        );



        // =====================================
        // MARYTTS ONLY
        // SAME FUNCTION USED BY ACTIVATION
        // =====================================

        if(
            typeof speakProfessorIAWithMaryTTS !==
            "function"
        ){

            console.error(
                "RANISE THEORY TEACHING ENGINE: MARYTTS FUNCTION NOT AVAILABLE"
            );

            return false;

        }



        try{


            // =====================================
            // READ EACH THEORY PART
            // SEQUENTIALLY
            //
            // await guarantees:
            //
            // PART 1 AUDIO FINISHES
            // BEFORE PART 2 STARTS
            //
            // PART 2 AUDIO FINISHES
            // BEFORE PART 3 STARTS
            // =====================================

            for(
                let i = 0;
                i < lessons.length;
                i++
            ){


                const lesson =
                    lessons[i];



                if(!lesson){

                    continue;

                }



                const explanation =
                    this.buildExplanation(
                        lesson
                    );



                if(
                    !explanation
                ){

                    console.error(
                        "RANISE THEORY TEACHING ENGINE: THEORY PART NOT AVAILABLE",
                        i
                    );

                    continue;

                }



                console.log(
                    "RANISE THEORY TEACHING ENGINE: READING THEORY PART",
                    i + 1,
                    lessons.length,
                    lesson.title
                );



                await speakProfessorIAWithMaryTTS(
                    explanation
                );


            }



            console.log(
                "RANISE THEORY TEACHING ENGINE: ALL THEORY PARTS FINISHED"
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














// =====================================
// RANISE MOISE IA PROFESSOR
// PEDAGOGICAL ENGINE
// BLOCK 5 - PEDAGOGICAL EXPLANATION ENGINE
// READ-ONLY / ISOLATED
// MICROSOFT WORD 2007 - CHAPITRE 1
// COMPATIBLE WITH BLOCK 1 + 2 + 3 + 4
// MARYTTS ONLY
// =====================================


const RaniseMoisePedagogicalExplanationEngine = {


    // =====================================
    // GET CURRENT THEORY LESSON
    // READ ONLY
    // =====================================

    getCurrentLesson:function(){


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
    // BUILD PEDAGOGICAL EXPLANATION REQUEST
    // READ ONLY
    // =====================================

    buildPedagogicalPrompt:function(lesson){


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



        return (

            "Tu es Ranise Moise, professeure IA de " +
            "CampusNumérique FOBAS, spécialisée dans " +
            "la formation Microsoft Word 2007. " +

            "Tu viens de lire cette notion de cours. " +
            "Maintenant, ne te contente surtout pas de " +
            "répéter le texte du cours. " +

            "Passe dans une véritable phase " +
            "d'explication pédagogique destinée à un " +
            "élève débutant. " +

            "Explique avec des mots simples, clairs et " +
            "progressifs. " +

            "Décompose la notion en petites idées " +
            "faciles à comprendre. " +

            "Donne un exemple concret lié à " +
            "Microsoft Word 2007 lorsque cela est " +
            "pertinent. " +

            "Explique pourquoi cette notion est " +
            "importante pour l'élève. " +

            "Termine par un court résumé de ce que " +
            "l'élève doit retenir. " +

            "Ne parle pas de ton fonctionnement interne. " +
            "Ne mentionne ni API, ni backend, ni " +
            "intelligence artificielle, ni MaryTTS. " +

            "Adresse-toi directement à l'élève comme " +
            "une véritable professeure. " +

            "Notion à expliquer : " +

            lesson.title +

            ". " +

            "Contenu de référence du cours : " +

            lesson.content

        );


    },





    // =====================================
    // REQUEST PEDAGOGICAL EXPLANATION
    // READ ONLY
    // =====================================

    requestExplanation:async function(prompt){


        if(
            !prompt ||
            typeof prompt !== "string"
        ){

            return null;

        }



        if(
            typeof requestCampusAIProfessor !==
            "function"
        ){

            console.error(
                "RANISE PEDAGOGICAL EXPLANATION ENGINE: AI REQUEST FUNCTION NOT AVAILABLE"
            );

            return null;

        }



        try{


            const response =
                await requestCampusAIProfessor(
                    prompt
                );



            if(
                !response ||
                typeof response !== "string" ||
                !response.trim()
            ){

                return null;

            }



            return response.trim();


        }catch(error){


            console.error(
                "RANISE PEDAGOGICAL EXPLANATION ENGINE: AI REQUEST ERROR",
                error
            );


            return null;


        }


    },





    // =====================================
    // TEACH PEDAGOGICAL EXPLANATION
    // READ ONLY
    // =====================================

    teachExplanation:async function(){


        const lesson =
            this.getCurrentLesson();



        if(!lesson){

            console.error(
                "RANISE PEDAGOGICAL EXPLANATION ENGINE: LESSON NOT AVAILABLE"
            );

            return false;

        }



        const prompt =
            this.buildPedagogicalPrompt(
                lesson
            );



        if(!prompt){

            console.error(
                "RANISE PEDAGOGICAL EXPLANATION ENGINE: PROMPT NOT AVAILABLE"
            );

            return false;

        }



        const explanation =
            await this.requestExplanation(
                prompt
            );



        if(!explanation){

            console.error(
                "RANISE PEDAGOGICAL EXPLANATION ENGINE: EXPLANATION NOT AVAILABLE"
            );

            return false;

        }



        console.log(
            "RANISE PEDAGOGICAL EXPLANATION ENGINE: EXPLANATION READY",
            lesson.title
        );



        if(
            typeof speakProfessorIAWithMaryTTS !==
            "function"
        ){

            console.error(
                "RANISE PEDAGOGICAL EXPLANATION ENGINE: MARYTTS FUNCTION NOT AVAILABLE"
            );

            return false;

        }



        try{


            await speakProfessorIAWithMaryTTS(
                explanation
            );



            return true;


        }catch(error){


            console.error(
                "RANISE PEDAGOGICAL EXPLANATION ENGINE: MARYTTS ERROR",
                error
            );


            return false;


        }


    }


};





// =====================================
// RANISE MOISE IA PROFESSOR
// BLOCK 5 VERIFICATION
// =====================================

(function(){


    const lesson =
        RaniseMoisePedagogicalExplanationEngine
            .getCurrentLesson();



    if(lesson){

        console.log(
            "RANISE PEDAGOGICAL EXPLANATION ENGINE: READY"
        );

    }else{

        console.error(
            "RANISE PEDAGOGICAL EXPLANATION ENGINE: LESSON NOT AVAILABLE"
        );

    }


})();


















// =========================================================
// BLOCK 6
// MICROSOFT WORD 2007 FORMATION
// RANISE MOISE PRACTICE TEACHING ENGINE
// =========================================================
// ISOLATED ADD-ON
// USES THE EXISTING RANISE VOICE SYSTEM
// USES EXISTING COURSE PRACTICE DATA
// THEORY REMAINS UNTOUCHED
// BLOCK 5 REMAINS UNTOUCHED
// DOES NOT MODIFY BLOCK 4
// DOES NOT MODIFY BLOCK 5
// STARTED BY EXISTING ACTIVATION AFTER BLOCK 5
// =========================================================

(function(){

    "use strict";


    // =====================================================
    // PRACTICE TEACHING ENGINE
    // =====================================================

    window.RaniseMoisePracticeTeachingEngine = {


        async speak(text){

            if(!text){

                return;

            }


            // ---------------------------------------------
            // USE THE SAME RANISE TALKING SYSTEM
            // ---------------------------------------------

            if(
                typeof raniseStartTalking ===
                "function"
            ){

                raniseStartTalking();

            }


            try{

                if(
                    typeof speakProfessorIAWithMaryTTS ===
                    "function"
                ){

                    await speakProfessorIAWithMaryTTS(
                        text
                    );

                }

            }finally{

                if(
                    typeof raniseStopTalking ===
                    "function"
                ){

                    raniseStopTalking();

                }

            }

        },


        async teachFirstPractice(){

            // =================================================
            // GET CHAPTER 1 FROM EXISTING COURSE DATA
            // =================================================

            if(
                typeof microsoftWordCourse ===
                "undefined"
            ){

                return;

            }


            const chapter =
                microsoftWordCourse.chapters.find(
                    item =>
                        item.id === "chapitre1"
                );


            if(!chapter){

                return;

            }


            if(
                !Array.isArray(
                    chapter.practice
                ) ||
                chapter.practice.length === 0
            ){

                return;

            }


            // =================================================
            // PRACTICE INTRODUCTION
            // =================================================

            await this.speak(

                "Maintenant, nous allons passer aux séances pratiques, toujours pour la première leçon Microsoft Word 2007."

            );


            // =================================================
            // READ EXISTING PRACTICE CONTENT
            // EXACTLY IN COURSE DATA ORDER
            // =================================================

            for(
                const activity of chapter.practice
            ){

                if(!activity){

                    continue;

                }


                // ---------------------------------------------
                // PRACTICE ACTIVITY TITLE
                // ---------------------------------------------

                if(activity.title){

                    await this.speak(
                        activity.title
                    );

                }


                // ---------------------------------------------
                // PRACTICE STEPS
                // ---------------------------------------------

                if(
                    Array.isArray(
                        activity.steps
                    )
                ){

                    for(
                        let i = 0;
                        i < activity.steps.length;
                        i++
                    ){

                        const step =
                            activity.steps[i];


                        if(!step){

                            continue;

                        }


                        await this.speak(

                            "Étape " +
                            (i + 1) +
                            ". " +
                            step

                        );

                    }

                }

            }


            // =================================================
            // FINAL INSTRUCTION
            // =================================================

            await this.speak(

                "Cliquez sur le bouton “🚀 Ouvrir Microsoft Word Simulation” pour ouvrir l’espace de simulation. Attendez-moi ici, car c’est moi qui vais vous guider étape par étape."

            );

        }

    };


})();








































// =========================================================
// BLOCK 7
// MICROSOFT WORD 2007 FORMATION
// RANISE MOISE PRACTICAL GUIDANCE ENGINE
// =========================================================
// PRODUCTION VERSION — REAL SIMULATION ACTION VALIDATION
//
// RESPONSIBILITIES:
// 1. Read Chapter 1 practice data.
// 2. Enter the existing simulation only after it is launched.
// 3. Guide the student one practice step at a time.
// 4. Verify the REAL corresponding action in the simulation.
// 5. Never advance because of an unrelated click.
// 6. Use the existing MaryTTS + avatar system.
// 7. Keep Block 4, Block 5 and Block 6 untouched.
// 8. Keep the existing simulation iframe untouched.
// 9. Use the REAL HTML structure of Campus Word 2007.
// 10. Complete Chapter 1 only after ALL practice steps pass.
// =========================================================

(function () {

    "use strict";


    // =====================================================
    // BLOCK 7 STATE
    // =====================================================

    const state = {

        simulationFrame: null,

        simulationDocument: null,

        practice: null,

        activityIndex: 0,

        stepIndex: 0,

        started: false,

        waitingForAction: false,

        completed: false,

        listenersAttached: false,

        speaking: false,

        processingAction: false

    };


    // =====================================================
    // GET CHAPTER 1 PRACTICE
    // READ ONLY
    // =====================================================

    function getChapter1Practice() {

        if (
            typeof microsoftWordCourse ===
            "undefined"
        ) {
            return null;
        }


        if (
            !Array.isArray(
                microsoftWordCourse.chapters
            )
        ) {
            return null;
        }


        const chapter =
            microsoftWordCourse.chapters.find(
                chapterItem =>
                    chapterItem.id === "chapitre1"
            );


        if (!chapter) {
            return null;
        }


        if (
            !Array.isArray(chapter.practice) ||
            chapter.practice.length === 0
        ) {
            return null;
        }


        return chapter.practice;

    }


    // =====================================================
    // EXISTING RANISE VOICE
    // =====================================================

    async function speak(text) {

        if (!text) {
            return;
        }


        if (
            typeof speakProfessorIAWithMaryTTS !==
            "function"
        ) {

            console.warn(
                "RANISE BLOCK 7: MaryTTS unavailable."
            );

            return;

        }


        state.speaking = true;


        if (
            typeof raniseStartTalking ===
            "function"
        ) {

            raniseStartTalking();

        }


        try {

            await speakProfessorIAWithMaryTTS(
                text
            );

        } finally {

            state.speaking = false;


            if (
                typeof raniseStopTalking ===
                "function"
            ) {

                raniseStopTalking();

            }

        }

    }


    // =====================================================
    // FIND EXISTING SIMULATION
    // =====================================================

    function findSimulation() {

        const campusContent =
            document.getElementById(
                "campusContent"
            );


        if (!campusContent) {
            return null;
        }


        return campusContent.querySelector(
            'iframe[src*="campusword2007simulation"]'
        );

    }


    // =====================================================
    // CONNECT TO EXISTING SIMULATION
    // SAME ORIGIN ONLY
    // =====================================================

    function connectToSimulation() {

        const frame =
            findSimulation();


        if (!frame) {
            return false;
        }


        try {

            const doc =
                frame.contentDocument ||
                frame.contentWindow.document;


            if (!doc) {
                return false;
            }


            state.simulationFrame =
                frame;

            state.simulationDocument =
                doc;


            return true;

        } catch (error) {

            console.error(
                "RANISE BLOCK 7: Cannot access simulation document.",
                error
            );

            return false;

        }

    }


    // =====================================================
    // CURRENT ACTIVITY
    // =====================================================

    function getCurrentActivity() {

        if (!state.practice) {
            return null;
        }


        return state.practice[
            state.activityIndex
        ] || null;

    }


    // =====================================================
    // CURRENT STEP
    // =====================================================

    function getCurrentStep() {

        const activity =
            getCurrentActivity();


        if (!activity) {
            return null;
        }


        if (
            !Array.isArray(
                activity.steps
            )
        ) {
            return null;
        }


        return activity.steps[
            state.stepIndex
        ] || null;

    }


    // =====================================================
    // NORMALIZE TEXT
    // =====================================================

    function normalize(value) {

        return String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();

    }


    // =====================================================
    // GET ELEMENT DATA
    // =====================================================

    function getElementData(element) {

        if (!element) {
            return "";
        }


        const values = [

            element.id,

            element.className,

            element.innerText,

            element.textContent,

            element.getAttribute("title"),

            element.getAttribute("aria-label"),

            element.getAttribute("data-action"),

            element.getAttribute("data-command"),

            element.getAttribute("data-role"),

            element.getAttribute("data-target")

        ];


        return normalize(
            values
                .filter(Boolean)
                .join(" ")
        );

    }


    // =====================================================
    // GET REAL EVENT ELEMENT
    // =====================================================

    function closestFromTarget(
        target,
        selector
    ) {

        if (
            !target ||
            !selector
        ) {
            return null;
        }


        if (
            typeof target.closest !==
            "function"
        ) {
            return null;
        }


        try {

            return target.closest(
                selector
            );

        } catch (error) {

            return null;

        }

    }


    // =====================================================
    // DETECT REAL TITLE BAR
    //
    // REAL HTML:
    // <div id="cwTitleBar">
    // =====================================================

    function isTitleBarTarget(target) {

        const titleBar =
            closestFromTarget(
                target,
                "#cwTitleBar"
            );


        if (!titleBar) {
            return false;
        }


        return true;

    }


    // =====================================================
    // DETECT REAL OFFICE BUTTON
    //
    // REAL HTML:
    // <div id="cwOfficeButton"
    //      data-role="office-button">
    // =====================================================

    function isOfficeButtonTarget(target) {

        const officeButton =
            closestFromTarget(
                target,
                "#cwOfficeButton[data-role='office-button']"
            );


        if (officeButton) {
            return true;
        }


        const fallback =
            closestFromTarget(
                target,
                "#cwOfficeButton"
            );


        return !!fallback;

    }


    // =====================================================
    // DETECT REAL RIBBON CONTENT AREA
    //
    // REAL HTML:
    // <div id="cwRibbonContentArea">
    // =====================================================

    function isRibbonTarget(target) {

        const ribbonArea =
            closestFromTarget(
                target,
                "#cwRibbonContentArea"
            );


        if (ribbonArea) {
            return true;
        }


        const ribbonPanel =
            closestFromTarget(
                target,
                "#cwRibbonContentArea .cwRibbonPanel"
            );


        return !!ribbonPanel;

    }


    // =====================================================
    // DETECT REAL TAB BAR
    //
    // REAL HTML:
    // <div id="cwRibbonTabBar">
    //
    // <button class="cwTabBtn"
    //         data-target="tab-home">
    // =====================================================

    function isTabTarget(target) {

        const tab =
            closestFromTarget(
                target,
                "#cwRibbonTabBar .cwTabBtn"
            );


        if (!tab) {
            return false;
        }


        return true;

    }


    // =====================================================
    // DETECT SPECIFIC TAB
    // =====================================================

    function getClickedTabId(target) {

        const tab =
            closestFromTarget(
                target,
                "#cwRibbonTabBar .cwTabBtn"
            );


        if (!tab) {
            return "";

        }


        return normalize(
            tab.getAttribute(
                "data-target"
            )
        );

    }


    // =====================================================
    // DETECT DOCUMENT WORKSPACE
    // =====================================================

    function isDocumentAreaTarget(target) {

        if (!target) {
            return false;
        }


        const pageContent =
            closestFromTarget(
                target,
                ".cwPageContent"
            );


        if (pageContent) {
            return true;
        }


        const workspace =
            closestFromTarget(
                target,
                [
                    "#cwWorkspace",
                    "#cwWorkspaceShell",
                    "#cwWorkspaceScroll",
                    "#cwDocumentContainer"
                ].join(",")
            );


        if (workspace) {
            return true;
        }


        return false;

    }


    // =====================================================
    // DETECT REAL NEW ACTION
    //
    // REAL HTML:
    // <div class="cwOfficeItem"
    //      data-action="new">
    // =====================================================

    function isNewDocumentTarget(target) {

        if (!target) {
            return false;
        }


        const newAction =
            closestFromTarget(
                target,
                "[data-action='new']"
            );


        if (newAction) {
            return true;
        }


        const newDocument =
            closestFromTarget(
                target,
                "[data-action='new-document']"
            );


        if (newDocument) {
            return true;
        }


        return false;

    }


    // =====================================================
    // DETECT REAL OFFICE MENU ITEM
    // =====================================================

    function isOfficeMenuTarget(target) {

        const menuItem =
            closestFromTarget(
                target,
                "#cwOfficeMenu .cwOfficeItem"
            );


        return !!menuItem;

    }


    // =====================================================
    // GET OFFICE MENU ACTION
    // =====================================================

    function getOfficeMenuAction(target) {

        const menuItem =
            closestFromTarget(
                target,
                "#cwOfficeMenu .cwOfficeItem"
            );


        if (!menuItem) {
            return "";
        }


        return normalize(
            menuItem.getAttribute(
                "data-action"
            )
        );

    }


    // =====================================================
    // DETERMINE PRACTICE OBJECTIVE
    // =====================================================

    function getStepType(step) {

        const text =
            normalize(step);


        // -------------------------------------------------
        // TITLE BAR
        // -------------------------------------------------

        if (
            text.includes("barre de titre") ||
            text.includes("barre du titre") ||
            text.includes("title bar")
        ) {

            return "title-bar";

        }


        // -------------------------------------------------
        // OFFICE BUTTON
        // -------------------------------------------------

        if (
            text.includes("bouton office") ||
            text.includes("office button")
        ) {

            return "office-button";

        }


        // -------------------------------------------------
        // RIBBON
        // -------------------------------------------------

        if (
            text.includes("identifier le ruban") ||
            text.includes("identifiez le ruban") ||
            text.includes("repérer le ruban") ||
            text.includes("reperez le ruban") ||
            text.includes("ruban") ||
            text.includes("ribbon")
        ) {

            return "ribbon";

        }


        // -------------------------------------------------
        // TABS
        // -------------------------------------------------

        if (
            text.includes("identifier les onglets") ||
            text.includes("identifiez les onglets") ||
            text.includes("identifier l'onglet") ||
            text.includes("identifier les onglet") ||
            text.includes("onglets du ruban") ||
            text.includes("onglet du ruban") ||
            text.includes("ribbon tabs") ||
            text.includes("identify the tabs")
        ) {

            return "tabs";

        }


        // -------------------------------------------------
        // DOCUMENT AREA
        // -------------------------------------------------

        if (
            text.includes("zone de travail") ||
            text.includes("zone du document") ||
            text.includes("zone de document") ||
            text.includes("document area") ||
            text.includes("espace de travail")
        ) {

            return "document-area";

        }


        // -------------------------------------------------
        // NEW DOCUMENT
        // -------------------------------------------------

        if (
            text.includes("nouveau document") ||
            text.includes("créer un nouveau document") ||
            text.includes("creer un nouveau document") ||
            text.includes("new document")
        ) {

            return "new-document";

        }


        return "unknown";

    }


    // =====================================================
    // DETECT POSSIBLE SPECIFIC TAB FROM STEP
    // =====================================================

    function getRequestedTab(step) {

        const text =
            normalize(step);


        if (
            text.includes("home")
        ) {
            return "tab-home";
        }


        if (
            text.includes("insert")
        ) {
            return "tab-insert";
        }


        if (
            text.includes("page layout")
        ) {
            return "tab-page-layout";
        }


        if (
            text.includes("references")
        ) {
            return "tab-references";
        }


        if (
            text.includes("mailings")
        ) {
            return "tab-mailings";
        }


        if (
            text.includes("review")
        ) {
            return "tab-review";
        }


        if (
            text.includes("view")
        ) {
            return "tab-view";
        }


        if (
            text.includes("format")
        ) {
            return "tab-format";
        }


        return "";

    }


    // =====================================================
    // VERIFY CURRENT STUDENT ACTION
    // =====================================================

    function studentPerformedCorrectAction(
        event
    ) {

        if (
            !event ||
            !event.target
        ) {
            return false;
        }


        const step =
            getCurrentStep();


        if (!step) {
            return false;
        }


        const type =
            getStepType(step);


        const target =
            event.target;


        // =================================================
        // IMPORTANT:
        // NO GENERIC "ANY BUTTON = CORRECT".
        // EVERY STEP HAS ITS OWN REAL TARGET.
        // =================================================

        switch (type) {


            // =============================================
            // TITLE BAR
            // =============================================

            case "title-bar":

                return isTitleBarTarget(
                    target
                );


            // =============================================
            // OFFICE BUTTON
            // =============================================

            case "office-button":

                return isOfficeButtonTarget(
                    target
                );


            // =============================================
            // RIBBON
            // =============================================

            case "ribbon":

                return isRibbonTarget(
                    target
                );


            // =============================================
            // TABS
            // =============================================

            case "tabs": {

                if (
                    !isTabTarget(
                        target
                    )
                ) {
                    return false;
                }


                const requestedTab =
                    getRequestedTab(
                        step
                    );


                if (!requestedTab) {

                    return true;

                }


                return (
                    getClickedTabId(
                        target
                    ) === requestedTab
                );

            }


            // =============================================
            // DOCUMENT AREA
            // =============================================

            case "document-area":

                return isDocumentAreaTarget(
                    target
                );


            // =============================================
            // NEW DOCUMENT
            // =============================================

            case "new-document":

                return isNewDocumentTarget(
                    target
                );


            // =============================================
            // UNKNOWN
            // =============================================

            default:

                return false;

        }

    }


    // =====================================================
    // EXPLAIN CURRENT STEP
    // =====================================================

    async function speakCurrentStep() {

        const activity =
            getCurrentActivity();


        if (!activity) {
            return;
        }


        const step =
            getCurrentStep();


        if (!step) {
            return;
        }


        state.waitingForAction = false;


        await speak(

            "Étape " +
            (state.stepIndex + 1) +
            ". " +
            step +
            " Faites cette action maintenant."

        );


        if (
            !state.completed
        ) {

            state.waitingForAction = true;

        }

    }


    // =====================================================
    // STEP COMPLETED FEEDBACK
    // =====================================================

    async function confirmStep() {

        state.waitingForAction = false;


        await speak(
            "Très bien. C'est correct."
        );

    }


    // =====================================================
    // MOVE TO NEXT PRACTICE STEP
    // =====================================================

    async function nextPracticeStep() {

        if (
            state.completed ||
            state.processingAction
        ) {
            return;
        }


        state.processingAction = true;


        try {

            await confirmStep();


            const activity =
                getCurrentActivity();


            if (!activity) {
                return;
            }


            // =============================================
            // NEXT STEP — SAME ACTIVITY
            // =============================================

            if (
                Array.isArray(
                    activity.steps
                ) &&
                state.stepIndex <
                activity.steps.length - 1
            ) {

                state.stepIndex++;


                await speakCurrentStep();


                return;

            }


            // =============================================
            // NEXT ACTIVITY
            // =============================================

            if (
                state.activityIndex <
                state.practice.length - 1
            ) {

                state.activityIndex++;

                state.stepIndex = 0;


                const nextActivity =
                    getCurrentActivity();


                if (
                    nextActivity &&
                    nextActivity.title
                ) {

                    await speak(

                        "Excellent. Vous avez terminé cette activité. " +
                        "Nous passons maintenant à l'activité suivante : " +
                        nextActivity.title

                    );

                }


                await speakCurrentStep();


                return;

            }


            // =============================================
            // ENTIRE PRACTICE COMPLETED
            // =============================================

            state.completed = true;

            state.waitingForAction = false;









            await speak(

                "Excellent. Vous avez terminé toutes les étapes de la séance pratique du Chapitre 1. " +
                "Votre pratique est maintenant validée. Bravo pour votre travail."

            );


            console.log(
                "RANISE BLOCK 7: CHAPTER 1 PRACTICE COMPLETED AND VALIDATED"
            );

        } finally {

            state.processingAction = false;

        }

    }


    // =====================================================
    // REAL SIMULATION CLICK LISTENER
    // =====================================================

    function handleSimulationClick(event) {

        if (!state.started) {
            return;
        }


        if (state.completed) {
            return;
        }


        if (state.speaking) {
            return;
        }


        if (state.processingAction) {
            return;
        }


        if (!state.waitingForAction) {
            return;
        }


        if (
            studentPerformedCorrectAction(
                event
            )
        ) {

            nextPracticeStep();

        }

    }


    // =====================================================
    // INPUT LISTENER
    //
    // IMPORTANT:
    // Do NOT treat every input as a correct action.
    // Input only validates an actual document-area
    // interaction when the current step requires it.
    // =====================================================

    function handleSimulationInput(event) {

        if (!state.started) {
            return;
        }


        if (state.completed) {
            return;
        }


        if (state.speaking) {
            return;
        }


        if (state.processingAction) {
            return;
        }


        if (!state.waitingForAction) {
            return;
        }


        const step =
            getCurrentStep();


        if (!step) {
            return;
        }


        const type =
            getStepType(step);


        if (
            type !== "document-area"
        ) {
            return;
        }


        if (
            isDocumentAreaTarget(
                event.target
            )
        ) {

            nextPracticeStep();

        }

    }


    // =====================================================
    // ATTACH SIMULATION LISTENERS
    // =====================================================

    function attachSimulationListeners() {

        if (
            !state.simulationDocument ||
            state.listenersAttached
        ) {
            return;
        }


        state.simulationDocument.addEventListener(

            "click",

            handleSimulationClick,

            true

        );


        state.simulationDocument.addEventListener(

            "input",

            handleSimulationInput,

            true

        );


        state.listenersAttached = true;

    }


    // =====================================================
    // START BLOCK 7
    // =====================================================

    async function startBlock7() {

        if (state.started) {
            return;
        }


        if (!connectToSimulation()) {
            return;
        }


        const practice =
            getChapter1Practice();


        if (!practice) {

            console.error(
                "RANISE BLOCK 7: Chapter 1 practice unavailable."
            );

            return;

        }


        state.practice =
            practice;

        state.activityIndex =
            0;

        state.stepIndex =
            0;

        state.started =
            true;

        state.completed =
            false;

        state.waitingForAction =
            false;

        state.processingAction =
            false;


        attachSimulationListeners();


        // =================================================
        // PRACTICE WELCOME
        // =================================================

        await speak(

            "Bienvenue dans l'espace de simulation Microsoft Word 2007. " +
            "Nous allons maintenant réaliser la pratique du Chapitre 1 ensemble. " +
            "Je vais vous donner une consigne à la fois. " +
            "Après chaque consigne, effectuez réellement l'action demandée dans la simulation. " +
            "Je vérifierai votre action avant de passer à l'étape suivante."

        );


        // =================================================
        // FIRST ACTIVITY
        // =================================================

        const firstActivity =
            state.practice[0];


        if (
            firstActivity &&
            firstActivity.title
        ) {

            await speak(
                firstActivity.title
            );

        }


        // =================================================
        // FIRST STEP
        // =================================================

        await speakCurrentStep();

    }


    // =====================================================
    // WAIT FOR EXISTING SIMULATION
    // =====================================================

    function waitForSimulation() {

        let attempts = 0;


        const timer =
            setInterval(

                function () {

                    attempts++;


                    const frame =
                        findSimulation();


                    if (!frame) {

                        if (
                            attempts >= 100
                        ) {

                            clearInterval(
                                timer
                            );

                            console.warn(
                                "RANISE BLOCK 7: Simulation iframe not found."
                            );

                        }

                        return;

                    }


                    clearInterval(
                        timer
                    );


                    state.simulationFrame =
                        frame;


                    // =====================================
                    // SIMULATION ALREADY LOADED
                    // =====================================

                    if (
                        frame.contentDocument &&
                        frame.contentDocument.readyState ===
                        "complete"
                    ) {

                        startBlock7();

                        return;

                    }


                    // =====================================
                    // WAIT FOR EXISTING IFRAME LOAD
                    // =====================================

                    frame.addEventListener(

                        "load",

                        function () {

                            startBlock7();

                        },

                        {
                            once: true
                        }

                    );

                },

                100

            );

    }


    // =====================================================
    // OBSERVE EXISTING SIMULATION LAUNCH
    //
    // DOES NOT REPLACE THE EXISTING LAUNCH CODE.
    // =====================================================

    document.addEventListener(

        "click",

        function (event) {

            const launchButton =
                event.target.closest(
                    "#launchMicrosoftWordSimulationBtn"
                );


            if (!launchButton) {
                return;
            }


            setTimeout(

                function () {

                    waitForSimulation();

                },

                100

            );

        },

        true

    );


    // =====================================================
    // PUBLIC API
    // =====================================================

    window.RaniseMoisePracticeGuidanceEngine = {

        start:
            startBlock7,


        getState:
            function () {

                return {

                    started:
                        state.started,

                    completed:
                        state.completed,

                    activityIndex:
                        state.activityIndex,

                    stepIndex:
                        state.stepIndex,

                    waitingForAction:
                        state.waitingForAction,

                    speaking:
                        state.speaking

                };

            }

    };


})();
































// =========================================================
// BLOCK 8
// MICROSOFT WORD 2007 FORMATION
// RANISE MOISE EXERCISE MASTERY ENGINE
// =========================================================
// INTELLIGENT + STRICT PRODUCTION VERSION
//
// PURPOSE:
// 1. START AUTOMATICALLY AFTER BLOCK 7 COMPLETES.
// 2. USE THE SAME EXISTING WORD 2007 SIMULATION.
// 3. USE CHAPTER 1 EXERCISES DYNAMICALLY.
// 4. VERIFY THE REAL ACTIONS REQUESTED BY EACH EXERCISE.
// 5. NEVER VALIDATE AN EXERCISE FROM A RANDOM CLICK.
// 6. NEVER VALIDATE AN EXERCISE ONLY BECAUSE AN ELEMENT EXISTS.
// 7. EXERCISE 1 REQUIRES THE REQUESTED INTERFACE ELEMENTS.
// 8. EXERCISE 2 REQUIRES REAL STUDENT TYPING.
// 9. EXERCISE 2 GIVES BEGINNERS TIME TO TYPE SLOWLY.
// 10. EXERCISE 3 REQUIRES THE REAL REQUESTED ACTION.
// 11. ACTIONS ARE TRACKED INDIVIDUALLY.
// 12. EACH EXERCISE HAS ITS OWN VALIDATION STATE.
// 13. NEVER MODIFY BLOCK 6.
// 14. NEVER MODIFY BLOCK 7.
// 15. NEVER MODIFY THE EXISTING SIMULATION ENGINE.
// 16. NEVER REPLACE MARYTTS + AVATAR.
// 17. KEEP THE SMALL DRAGGABLE EXERCISE PANEL.
// 18. DO NOT AUTO-PASS AN EXERCISE.
// =========================================================

(function () {

    "use strict";


    // =====================================================
    // BLOCK 8 STATE
    // =====================================================

    const state = {

        initialized: false,

        started: false,

        completed: false,

        transitionDetected: false,

        simulationFrame: null,

        simulationDocument: null,

        chapter: null,

        exercises: [],

        practice: [],

        exerciseIndex: 0,

        currentExercise: null,

        currentType: "generic",

        waitingForStudent: false,

        processing: false,

        speaking: false,

        listenersAttached: false,

        exerciseStartedAt: 0,

        lastActionAt: 0,

        actionCount: 0,

        actionLedger: [],

        completedActions: new Set(),

        textSnapshot: "",

        textChangeDetected: false,

        typingStartedAt: 0,

        typedResponseTimer: null,

        validationTimer: null,

        exercise3ActionDetected: false,

        exercise3BaselineSignature: "",

        exercise3ActionTime: 0,

        ui: {

            root: null,

            title: null,

            instruction: null,

            status: null,

            progress: null

        }

    };


    // =====================================================
    // NORMALIZE
    // =====================================================

    function normalize(value) {

        return String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[“”"«»]/g, " ")
            .replace(/[.,;:!?()[\]{}]/g, " ")
            .replace(/\s+/g, " ")
            .trim();

    }


    // =====================================================
    // NORMALIZE RESPONSE
    // =====================================================

    function normalizeResponse(value) {

        return normalize(value)
            .replace(
                /\b(le|la|les|un|une|des|du|de|d|et|ou|a|au|aux|dans|sur|pour|avec|en|est|sont)\b/g,
                " "
            )
            .replace(/\s+/g, " ")
            .trim();

    }


    // =====================================================
    // SPEAK
    // =====================================================

    async function speak(text) {

        if (!text) {
            return;
        }


        state.speaking = true;


        if (
            typeof raniseStartTalking ===
            "function"
        ) {

            raniseStartTalking();

        }


        try {

            if (
                typeof speakProfessorIAWithMaryTTS ===
                "function"
            ) {

                await speakProfessorIAWithMaryTTS(
                    text
                );

            }

        } finally {

            state.speaking = false;


            if (
                typeof raniseStopTalking ===
                "function"
            ) {

                raniseStopTalking();

            }

        }

    }


    // =====================================================
    // CHAPTER 1
    // =====================================================

    function getChapter1() {

        if (
            typeof microsoftWordCourse ===
            "undefined"
        ) {

            return null;

        }


        if (
            !Array.isArray(
                microsoftWordCourse.chapters
            )
        ) {

            return null;

        }


        return microsoftWordCourse.chapters.find(
            chapter =>
                chapter.id === "chapitre1"
        ) || null;

    }


    // =====================================================
    // FIND SIMULATION
    // =====================================================

    function findSimulation() {

        const campusContent =
            document.getElementById(
                "campusContent"
            );


        if (!campusContent) {
            return null;
        }


        return campusContent.querySelector(
            'iframe[src*="campusword2007simulation"]'
        ) || null;

    }


    // =====================================================
    // CONNECT SIMULATION
    // =====================================================

    function connectToSimulation() {

        const frame =
            findSimulation();


        if (!frame) {
            return false;
        }


        try {

            const doc =
                frame.contentDocument ||
                frame.contentWindow.document;


            if (!doc) {
                return false;
            }


            state.simulationFrame =
                frame;

            state.simulationDocument =
                doc;


            return true;

        } catch (error) {

            return false;

        }

    }


    // =====================================================
    // CURRENT EXERCISE
    // =====================================================

    function getCurrentExercise() {

        return (
            state.exercises[
                state.exerciseIndex
            ] || null
        );

    }


    // =====================================================
    // ELEMENT DATA
    // =====================================================

    function getElementData(element) {

        if (!element) {
            return "";
        }


        const values = [

            element.id,

            element.className,

            element.innerText,

            element.textContent,

            element.getAttribute("title"),

            element.getAttribute("aria-label"),

            element.getAttribute("data-action"),

            element.getAttribute("data-command"),

            element.getAttribute("data-role"),

            element.getAttribute("data-target"),

            element.getAttribute("name")

        ];


        return normalize(
            values
                .filter(Boolean)
                .join(" ")
        );

    }


    // =====================================================
    // CLOSEST
    // =====================================================

    function closestFromTarget(
        target,
        selector
    ) {

        if (
            !target ||
            !selector ||
            typeof target.closest !==
            "function"
        ) {

            return null;

        }


        try {

            return target.closest(
                selector
            );

        } catch (error) {

            return null;

        }

    }


    // =====================================================
    // PAGE CONTENTS
    // =====================================================

    function getPageContents() {

        if (!state.simulationDocument) {
            return [];
        }


        return Array.from(
            state.simulationDocument.querySelectorAll(
                ".cwPageContent"
            )
        );

    }


    // =====================================================
    // DOCUMENT TEXT
    // =====================================================

    function readDocumentText() {

        const pages =
            getPageContents();


        if (!pages.length) {
            return "";
        }


        let output = "";


        pages.forEach(
            page => {

                output +=
                    " " +
                    (
                        page.innerText ||
                        page.textContent ||
                        ""
                    );

            }
        );


        return output
            .replace(/\u00a0/g, " ")
            .replace(/\s+/g, " ")
            .trim();

    }


    // =====================================================
    // DOCUMENT SIGNATURE
    //
    // Used to detect real structural changes.
    // =====================================================

    function getDocumentSignature() {

        if (!state.simulationDocument) {
            return "";
        }


        const pages =
            getPageContents();


        return pages.map(
            page => {

                return [

                    page.getAttribute("data-page"),

                    page.id,

                    page.children.length,

                    normalize(
                        page.innerText ||
                        page.textContent ||
                        ""
                    ).slice(0, 500)

                ].join("|");

            }
        ).join("||");

    }


    // =====================================================
    // OFFICE BUTTON
    // =====================================================

    function getOfficeButton() {

        if (!state.simulationDocument) {
            return null;
        }


        return state.simulationDocument.querySelector(
            "#cwOfficeButton[data-role='office-button'], #cwOfficeButton"
        );

    }


    // =====================================================
    // RIBBON
    // =====================================================

    function getRibbon() {

        if (!state.simulationDocument) {
            return null;
        }


        return state.simulationDocument.querySelector(
            "#cwRibbonContentArea"
        );

    }


    // =====================================================
    // TITLE BAR
    // =====================================================

    function getTitleBar() {

        if (!state.simulationDocument) {
            return null;
        }


        return state.simulationDocument.querySelector(
            "#cwTitleBar"
        );

    }


    // =====================================================
    // TABS
    // =====================================================

    function getTabs() {

        if (!state.simulationDocument) {
            return [];
        }


        return Array.from(
            state.simulationDocument.querySelectorAll(
                "#cwRibbonTabBar .cwTabBtn"
            )
        );

    }


    // =====================================================
    // DOCUMENT AREA
    // =====================================================

    function getDocumentAreaTarget(target) {

        if (!target) {
            return null;
        }


        return closestFromTarget(
            target,
            [
                ".cwPageContent",
                "#cwWorkspace",
                "#cwWorkspaceShell",
                "#cwWorkspaceScroll",
                "#cwDocumentContainer"
            ].join(",")
        );

    }


    // =====================================================
    // CREATE UI
    // =====================================================

    function createExerciseUI() {

        if (
            !state.simulationDocument ||
            state.ui.root
        ) {

            return;

        }


        const doc =
            state.simulationDocument;


        const root =
            doc.createElement("div");


        root.id =
            "raniseBlock8ExercisePanel";


        root.style.position =
            "fixed";

        root.style.top =
            "12px";

        root.style.right =
            "12px";

        root.style.width =
            "min(360px, calc(100vw - 24px))";

        root.style.maxHeight =
            "calc(100vh - 24px)";

        root.style.overflowY =
            "auto";

        root.style.zIndex =
            "2147483640";

        root.style.background =
            "rgba(255,255,255,0.97)";

        root.style.border =
            "2px solid #1f4e79";

        root.style.borderRadius =
            "12px";

        root.style.boxShadow =
            "0 8px 30px rgba(0,0,0,0.25)";

        root.style.padding =
            "14px";

        root.style.fontFamily =
            "Arial, sans-serif";

        root.style.fontSize =
            "14px";

        root.style.lineHeight =
            "1.45";

        root.style.userSelect =
            "none";

        root.style.webkitUserSelect =
            "none";


        const title =
            doc.createElement("div");


        title.style.fontWeight =
            "700";

        title.style.fontSize =
            "17px";

        title.style.marginBottom =
            "8px";

        title.style.cursor =
            "grab";

        title.style.touchAction =
            "none";

        title.style.userSelect =
            "none";

        title.style.webkitUserSelect =
            "none";

        title.textContent =
            "Ranise Moïse — Exercices";


        const progress =
            doc.createElement("div");


        progress.style.fontWeight =
            "600";

        progress.style.marginBottom =
            "8px";


        const instruction =
            doc.createElement("div");


        instruction.style.marginBottom =
            "10px";


        const status =
            doc.createElement("div");


        status.style.padding =
            "8px";

        status.style.borderRadius =
            "8px";

        status.style.background =
            "#eef4f8";


        root.appendChild(title);

        root.appendChild(progress);

        root.appendChild(instruction);

        root.appendChild(status);


        (
            doc.body ||
            doc.documentElement
        ).appendChild(root);


        state.ui.root =
            root;

        state.ui.title =
            title;

        state.ui.progress =
            progress;

        state.ui.instruction =
            instruction;

        state.ui.status =
            status;


        enableExercisePanelDragging();

    }


    // =====================================================
    // DRAG ENGINE
    // =====================================================

    function enableExercisePanelDragging() {

        if (
            !state.ui.root ||
            !state.ui.title
        ) {

            return;

        }


        const panel =
            state.ui.root;

        const handle =
            state.ui.title;


        let dragging =
            false;

        let pointerId =
            null;

        let offsetX =
            0;

        let offsetY =
            0;


        function clampPosition(
            left,
            top
        ) {

            const doc =
                state.simulationDocument;


            const viewWidth =
                doc.documentElement.clientWidth ||
                doc.body.clientWidth ||
                window.innerWidth;


            const viewHeight =
                doc.documentElement.clientHeight ||
                doc.body.clientHeight ||
                window.innerHeight;


            const maxLeft =
                Math.max(
                    0,
                    viewWidth -
                    panel.offsetWidth
                );


            const maxTop =
                Math.max(
                    0,
                    viewHeight -
                    panel.offsetHeight
                );


            return {

                left:
                    Math.max(
                        0,
                        Math.min(
                            left,
                            maxLeft
                        )
                    ),

                top:
                    Math.max(
                        0,
                        Math.min(
                            top,
                            maxTop
                        )
                    )

            };

        }


        function startDrag(event) {

            if (
                event.pointerType === "mouse" &&
                event.button !== 0
            ) {

                return;

            }


            const rect =
                panel.getBoundingClientRect();


            dragging =
                true;

            pointerId =
                event.pointerId;

            offsetX =
                event.clientX -
                rect.left;

            offsetY =
                event.clientY -
                rect.top;


            handle.style.cursor =
                "grabbing";


            if (
                typeof handle.setPointerCapture ===
                "function"
            ) {

                try {

                    handle.setPointerCapture(
                        event.pointerId
                    );

                } catch (error) {}

            }


            event.preventDefault();

        }


        function moveDrag(event) {

            if (!dragging) {
                return;
            }


            if (
                pointerId !== null &&
                event.pointerId !== pointerId
            ) {

                return;

            }


            const position =
                clampPosition(

                    event.clientX -
                    offsetX,

                    event.clientY -
                    offsetY

                );


            panel.style.left =
                position.left + "px";


            panel.style.top =
                position.top + "px";


            panel.style.right =
                "auto";


            event.preventDefault();

        }


        function stopDrag(event) {

            if (!dragging) {
                return;
            }


            dragging =
                false;

            pointerId =
                null;

            handle.style.cursor =
                "grab";

        }


        handle.addEventListener(
            "pointerdown",
            startDrag,
            true
        );

        handle.addEventListener(
            "pointermove",
            moveDrag,
            true
        );

        handle.addEventListener(
            "pointerup",
            stopDrag,
            true
        );

        handle.addEventListener(
            "pointercancel",
            stopDrag,
            true
        );

    }


    // =====================================================
    // EXERCISE TYPE
    // =====================================================

    function getExerciseType(exercise) {

        const text =
            normalize(exercise);


        if (
            (
                text.includes("identifier") ||
                text.includes("identifiez") ||
                text.includes("montrez") ||
                text.includes("repérez") ||
                text.includes("reperez")
            ) &&
            (
                text.includes("interface") ||
                text.includes("éléments") ||
                text.includes("elements") ||
                text.includes("composants")
            )
        ) {

            return "identify-interface";

        }


        if (
            (
                text.includes("expliquer") ||
                text.includes("expliquez") ||
                text.includes("explique")
            ) &&
            (
                text.includes("bouton office") ||
                text.includes("office button")
            )
        ) {

            return "office-button-explanation";

        }


        if (
            (
                text.includes("créer") ||
                text.includes("creer") ||
                text.includes("create")
            ) &&
            (
                text.includes("document") ||
                text.includes("fichier") ||
                text.includes("file")
            )
        ) {

            return "create-document";

        }


        return "generic";

    }


    // =====================================================
    // INTERFACE TARGET DEFINITIONS
    // =====================================================

    function getInterfaceTargets() {

        return {

            titleBar: {

                keywords: [
                    "barre de titre",
                    "barre titre",
                    "title bar"
                ],

                selector:
                    "#cwTitleBar"

            },

            officeButton: {

                keywords: [
                    "bouton office",
                    "office button"
                ],

                selector:
                    "#cwOfficeButton[data-role='office-button'], #cwOfficeButton"

            },

            ribbon: {

                keywords: [
                    "ruban",
                    "ribbon"
                ],

                selector:
                    "#cwRibbonContentArea"

            },

            tabs: {

                keywords: [
                    "onglets",
                    "onglet",
                    "tabs"
                ],

                selector:
                    "#cwRibbonTabBar .cwTabBtn"

            },

            documentArea: {

                keywords: [
                    "zone de travail",
                    "zone du document",
                    "zone document",
                    "document area"
                ],

                selector:
                    ".cwPageContent"

            }

        };

    }


    // =====================================================
    // BUILD STRICT ACTION LEDGER
    //
    // IMPORTANT:
    // An exercise can require MULTIPLE actions.
    // Every required action receives its own state.
    // =====================================================

    function buildActionLedger(exercise) {

        const type =
            getExerciseType(exercise);


        const text =
            normalize(exercise);


        const ledger = [];


        if (
            type ===
            "identify-interface"
        ) {

            const targets =
                getInterfaceTargets();


            Object.keys(targets).forEach(
                key => {

                    const item =
                        targets[key];


                    const mentioned =
                        item.keywords.some(
                            keyword =>
                                text.includes(
                                    normalize(keyword)
                                )
                        );


                    if (mentioned) {

                        ledger.push({

                            id:
                                "interface-" +
                                key,

                            label:
                                item.keywords[0],

                            selector:
                                item.selector,

                            required:
                                true,

                            completed:
                                false,

                            clicks:
                                0

                        });

                    }

                }
            );


            // ------------------------------------------------
            // If the wording is broad, require the main
            // Word interface components rather than one
            // random click.
            // ------------------------------------------------

            if (!ledger.length) {

                [
                    "titleBar",
                    "officeButton",
                    "ribbon",
                    "tabs",
                    "documentArea"
                ].forEach(
                    key => {

                        const item =
                            targets[key];


                        ledger.push({

                            id:
                                "interface-" +
                                key,

                            label:
                                item.keywords[0],

                            selector:
                                item.selector,

                            required:
                                true,

                            completed:
                                false,

                            clicks:
                                0

                        });

                    }
                );

            }

        }


        if (
            type ===
            "office-button-explanation"
        ) {

            ledger.push({

                id:
                    "real-typing",

                label:
                    "Réponse réellement tapée",

                required:
                    true,

                completed:
                    false,

                clicks:
                    0

            });

        }


        if (
            type ===
            "create-document"
        ) {

            ledger.push({

                id:
                    "new-document-action",

                label:
                    "Création réelle du document",

                required:
                    true,

                completed:
                    false,

                clicks:
                    0

            });

        }


        if (
            type ===
            "generic"
        ) {

            ledger.push({

                id:
                    "real-student-action",

                label:
                    "Action réelle dans la simulation",

                required:
                    true,

                completed:
                    false,

                clicks:
                    0

            });

        }


        return ledger;

    }


    // =====================================================
    // RESET EXERCISE VALIDATION
    // =====================================================

    function resetExerciseValidation() {

        state.completedActions =
            new Set();


        state.actionLedger =
            buildActionLedger(
                getCurrentExercise()
            );


        state.actionCount =
            0;

        state.lastActionAt =
            0;

        state.exerciseStartedAt =
            Date.now();

        state.textSnapshot =
            readDocumentText();

        state.textChangeDetected =
            false;

        state.typingStartedAt =
            0;

        state.exercise3ActionDetected =
            false;

        state.exercise3ActionTime =
            0;

        state.exercise3BaselineSignature =
            getDocumentSignature();


        if (state.validationTimer) {

            clearInterval(
                state.validationTimer
            );

            state.validationTimer =
                null;

        }

    }


    // =====================================================
    // UI ACTION CHECKLIST
    // =====================================================

    function getLedgerStatusText() {

        if (!state.actionLedger.length) {

            return "";

        }


        const completed =
            state.actionLedger.filter(
                item =>
                    item.completed
            ).length;


        const total =
            state.actionLedger.length;


        return (
            "Actions validées : " +
            completed +
            " / " +
            total
        );

    }


    // =====================================================
    // UPDATE UI
    // =====================================================

    function updateExerciseUI() {

        if (!state.ui.root) {
            return;
        }


        const exercise =
            getCurrentExercise();


        if (!exercise) {
            return;
        }


        state.ui.progress.textContent =
            "Exercice " +
            (state.exerciseIndex + 1) +
            " / " +
            state.exercises.length;


        state.ui.instruction.textContent =
            exercise;


        state.ui.status.textContent =
            getLedgerStatusText() +
            " — À vous de jouer. Je vérifie chaque action.";

    }


    // =====================================================
    // FIND TARGET FROM EVENT
    // =====================================================

    function eventMatchesSelector(
        target,
        selector
    ) {

        if (
            !target ||
            !selector
        ) {

            return false;

        }


        return !!closestFromTarget(
            target,
            selector
        );

    }


    // =====================================================
    // MARK ACTION
    // =====================================================

    function markActionCompleted(id) {

        const item =
            state.actionLedger.find(
                action =>
                    action.id === id
            );


        if (!item) {
            return false;
        }


        if (!item.completed) {

            item.completed =
                true;

            state.completedActions.add(
                id
            );

            state.actionCount++;

            state.lastActionAt =
                Date.now();

        }


        updateExerciseUI();


        return true;

    }


    // =====================================================
    // ALL REQUIRED ACTIONS COMPLETE?
    // =====================================================

    function allRequiredActionsComplete() {

        if (!state.actionLedger.length) {

            return false;

        }


        return state.actionLedger.every(
            item =>
                item.required === false ||
                item.completed === true
        );

    }


    // =====================================================
    // EXERCISE 1 STRICT VALIDATION
    //
    // A RANDOM CLICK IS NEVER ENOUGH.
    //
    // The student must touch EACH required target.
    // =====================================================

    function validateInterfaceIdentification(
        event
    ) {

        if (
            !event ||
            !event.target
        ) {

            return false;

        }


        let matched =
            false;


        state.actionLedger.forEach(
            item => {

                if (
                    item.completed ||
                    !item.selector
                ) {

                    return;

                }


                if (
                    eventMatchesSelector(
                        event.target,
                        item.selector
                    )
                ) {

                    item.clicks++;


                    markActionCompleted(
                        item.id
                    );


                    matched =
                        true;

                }

            }
        );


        if (matched) {

            if (
                allRequiredActionsComplete()
            ) {

                return true;

            }


            if (state.ui.status) {

                state.ui.status.textContent =
                    getLedgerStatusText() +
                    " — Bien. Continuez avec les éléments restants demandés.";

            }

        }


        return false;

    }


    // =====================================================
    // OFFICE BUTTON SEMANTIC VALIDATION
    // =====================================================

    function validateOfficeButtonExplanation(
        text
    ) {

        const value =
            normalizeResponse(text);


        if (
            !value ||
            value.length < 20
        ) {

            return {

                correct:
                    false,

                reason:
                    "La réponse est trop courte."

            };

        }


        const officeContext =
            value.includes("office") ||
            value.includes("bouton");


        if (!officeContext) {

            return {

                correct:
                    false,

                reason:
                    "La réponse ne montre pas clairement qu'elle concerne le bouton Office."

            };

        }


        const concepts = {

            create: [
                "nouveau",
                "creer",
                "créer",
                "new"
            ],

            open: [
                "ouvrir",
                "open"
            ],

            save: [
                "enregistrer",
                "sauvegarder",
                "save"
            ],

            print: [
                "imprimer",
                "impression",
                "print"
            ],

            close: [
                "fermer",
                "fermeture",
                "close"
            ],

            document: [
                "document",
                "fichier",
                "file"
            ],

            commands: [
                "commande",
                "commandes",
                "fonctions",
                "options",
                "actions"
            ]

        };


        const matchedGroups =
            new Set();


        Object.keys(concepts).forEach(
            group => {

                if (
                    concepts[group].some(
                        word =>
                            value.includes(
                                normalize(word)
                            )
                    )
                ) {

                    matchedGroups.add(
                        group
                    );

                }

            }
        );


        const functionalGroups =
            [
                "create",
                "open",
                "save",
                "print",
                "close"
            ].filter(
                group =>
                    matchedGroups.has(group)
            );


        // ------------------------------------------------
        // STRICT SEMANTIC RULE:
        //
        // Office + at least TWO real functions
        // OR Office + document management concept
        // combined with one real function.
        // ------------------------------------------------

        const twoFunctions =
            functionalGroups.length >= 2;


        const documentManagement =
            matchedGroups.has("document") &&
            functionalGroups.length >= 1;


        const commandExplanation =
            matchedGroups.has("commands") &&
            functionalGroups.length >= 1;


        if (
            twoFunctions ||
            documentManagement ||
            commandExplanation
        ) {

            return {

                correct:
                    true,

                reason:
                    "Compréhension fonctionnelle détectée."

            };

        }


        return {

            correct:
                false,

            reason:
                "La réponse mentionne le bouton Office, mais n'explique pas encore suffisamment ses fonctions."

        };

    }


    // =====================================================
    // REAL TYPING DETECTION
    //
    // CRITICAL:
    // Existing text from BEFORE the exercise cannot
    // automatically validate Exercise 2.
    // =====================================================

    function processExercise2Input() {

        const currentText =
            readDocumentText();


        if (
            currentText ===
            state.textSnapshot
        ) {

            return false;

        }


        state.textChangeDetected =
            true;


        if (!state.typingStartedAt) {

            state.typingStartedAt =
                Date.now();

        }


        const validation =
            validateOfficeButtonExplanation(
                currentText
            );


        if (
            validation.correct &&
            state.textChangeDetected
        ) {

            markActionCompleted(
                "real-typing"
            );


            return true;

        }


        if (state.ui.status) {

            state.ui.status.textContent =
                getLedgerStatusText() +
                " — Je vois votre saisie. Prenez votre temps et complétez votre explication.";

        }


        return false;

    }


    // =====================================================
    // START EXERCISE 2 MONITOR
    //
    // Long monitoring interval intentionally kept alive
    // so slow beginners are not rushed.
    // =====================================================

    function beginExercise2Monitoring() {

        if (state.typedResponseTimer) {

            clearInterval(
                state.typedResponseTimer
            );

        }


        state.textSnapshot =
            readDocumentText();

        state.textChangeDetected =
            false;

        state.typingStartedAt =
            0;


        state.typedResponseTimer =
            setInterval(

                function () {

                    if (
                        state.completed ||
                        state.processing ||
                        !state.waitingForStudent
                    ) {

                        return;

                    }


                    if (
                        state.currentType !==
                        "office-button-explanation"
                    ) {

                        return;

                    }


                    if (
                        processExercise2Input()
                    ) {

                        clearInterval(
                            state.typedResponseTimer
                        );

                        state.typedResponseTimer =
                            null;


                        moveToNextExercise();

                    }

                },

                350

            );

    }


    // =====================================================
    // STOP EXERCISE 2
    // =====================================================

    function stopExercise2Monitoring() {

        if (state.typedResponseTimer) {

            clearInterval(
                state.typedResponseTimer
            );

            state.typedResponseTimer =
                null;

        }

    }


    // =====================================================
    // DETECT REAL NEW-DOCUMENT ACTION
    // =====================================================

    function detectCreateDocumentAction(
        event
    ) {

        if (
            !event ||
            !event.target
        ) {

            return false;

        }


        const target =
            event.target;


        const candidates = [

            "[data-action='new']",

            "[data-action='new-document']",

            "[data-command='new']",

            "[data-command='new-document']",

            "#cwOfficeMenu [data-action='new']",

            "#cwOfficeMenu [data-action='new-document']"

        ];


        for (
            let i = 0;
            i < candidates.length;
            i++
        ) {

            if (
                closestFromTarget(
                    target,
                    candidates[i]
                )
            ) {

                return true;

            }

        }


        // ------------------------------------------------
        // DATA TEXT FALLBACK
        // ------------------------------------------------

        const element =
            closestFromTarget(
                target,
                "#cwOfficeMenu .cwOfficeItem, button, [role='button'], [role='menuitem']"
            );


        if (!element) {
            return false;
        }


        const data =
            getElementData(element);


        return (
            (
                data.includes("nouveau") ||
                data.includes("new")
            ) &&
            (
                data.includes("document") ||
                data.includes("fichier") ||
                data.includes("file")
            )
        );

    }


    // =====================================================
    // VERIFY REAL DOCUMENT CHANGE
    // =====================================================

    function verifyDocumentCreation() {

        const currentSignature =
            getDocumentSignature();


        const signatureChanged =
            currentSignature !==
            state.exercise3BaselineSignature;


        const pages =
            getPageContents();


        const hasRealArea =
            pages.some(
                page =>
                    page &&
                    page.isConnected
            );


        return (
            state.exercise3ActionDetected &&
            hasRealArea &&
            (
                signatureChanged ||
                Date.now() -
                state.exercise3ActionTime >=
                500
            )
        );

    }


    // =====================================================
    // EXERCISE 3 MONITOR
    // =====================================================

    function beginExercise3Monitoring() {

        if (state.validationTimer) {

            clearInterval(
                state.validationTimer
            );

        }


        state.validationTimer =
            setInterval(

                function () {

                    if (
                        state.completed ||
                        state.processing ||
                        !state.waitingForStudent
                    ) {

                        return;

                    }


                    if (
                        state.currentType !==
                        "create-document"
                    ) {

                        return;

                    }


                    if (
                        !state.exercise3ActionDetected
                    ) {

                        return;

                    }


                    if (
                        verifyDocumentCreation()
                    ) {

                        markActionCompleted(
                            "new-document-action"
                        );


                        clearInterval(
                            state.validationTimer
                        );

                        state.validationTimer =
                            null;


                        moveToNextExercise();

                    }

                },

                300

            );

    }


    // =====================================================
    // STOP ALL MONITORS
    // =====================================================

    function stopAllMonitors() {

        stopExercise2Monitoring();


        if (state.validationTimer) {

            clearInterval(
                state.validationTimer
            );

            state.validationTimer =
                null;

        }

    }


    // =====================================================
    // ANNOUNCE EXERCISE
    // =====================================================

    async function announceCurrentExercise() {

        const exercise =
            getCurrentExercise();


        if (!exercise) {
            return;
        }


        state.currentType =
            getExerciseType(
                exercise
            );


        resetExerciseValidation();


        updateExerciseUI();


        if (
            state.currentType ===
            "identify-interface"
        ) {

            await speak(

                "Exercice " +
                (state.exerciseIndex + 1) +
                ". " +
                exercise +
                " Je vais vérifier chaque élément que je vous demande de montrer. Un simple clic au hasard ne permettra pas de valider l'exercice. Prenez le temps nécessaire pour effectuer chaque action."

            );


            return;

        }


        if (
            state.currentType ===
            "office-button-explanation"
        ) {

            await speak(

                "Exercice " +
                (state.exerciseIndex + 1) +
                ". " +
                exercise +
                " Cliquez dans la zone de travail et tapez votre propre réponse. Je vais attendre votre saisie et analyser réellement ce que vous écrivez. Si vous êtes débutant et que vous tapez lentement, prenez votre temps."

            );


            beginExercise2Monitoring();


            return;

        }


        if (
            state.currentType ===
            "create-document"
        ) {

            await speak(

                "Exercice " +
                (state.exerciseIndex + 1) +
                ". " +
                exercise +
                " Effectuez réellement l'action demandée dans la simulation. Je vais vérifier l'action avant de valider."

            );


            beginExercise3Monitoring();


            return;

        }


        await speak(

            "Exercice " +
            (state.exerciseIndex + 1) +
            ". " +
            exercise +
            " Effectuez réellement la tâche demandée dans la simulation. Je vais vérifier votre action avant de valider."

        );

    }


    // =====================================================
    // SUCCESS EXERCISE 1
    // =====================================================

    async function confirmExercise1() {

        await speak(

            "Très bien. Vous avez effectué toutes les actions demandées sur les éléments réels de l'interface. Je valide l'exercice."

        );

    }


    // =====================================================
    // SUCCESS EXERCISE 2
    // =====================================================

    async function confirmExercise2() {

        stopExercise2Monitoring();


        if (state.ui.status) {

            state.ui.status.textContent =
                "Réponse réellement saisie et comprise. Exercice validé.";

        }


        await speak(

            "Très bien. J'ai vérifié votre saisie réelle et votre explication montre que vous avez compris le rôle du bouton Office. Je valide l'exercice."

        );

    }


    // =====================================================
    // SUCCESS EXERCISE 3
    // =====================================================

    async function confirmExercise3() {

        if (state.ui.status) {

            state.ui.status.textContent =
                "Action réelle détectée et vérifiée. Exercice validé.";

        }


        await speak(

            "Excellent. J'ai détecté et vérifié l'action réelle demandée dans la simulation. L'exercice est validé."

        );

    }


    // =====================================================
    // MOVE NEXT
    // =====================================================

    async function moveToNextExercise() {

        if (
            state.processing ||
            state.completed
        ) {

            return;

        }


        // ------------------------------------------------
        // NEVER MOVE FORWARD WITHOUT COMPLETE LEDGER.
        // ------------------------------------------------

        if (
            !allRequiredActionsComplete()
        ) {

            return;

        }


        state.processing =
            true;


        try {

            stopAllMonitors();


            state.waitingForStudent =
                false;


            if (
                state.currentType ===
                "identify-interface"
            ) {

                await confirmExercise1();

            }


            if (
                state.currentType ===
                "office-button-explanation"
            ) {

                await confirmExercise2();

            }


            if (
                state.currentType ===
                "create-document"
            ) {

                await confirmExercise3();

            }


            state.exerciseIndex++;


            if (
                state.exerciseIndex >=
                state.exercises.length
            ) {

                await completeBlock8();


                return;

            }


            state.currentExercise =
                getCurrentExercise();


            await announceCurrentExercise();


            state.waitingForStudent =
                true;

        } finally {

            state.processing =
                false;

        }

    }


    // =====================================================
    // GENERIC EXERCISE
    //
    // Does NOT auto-pass.
    // A real simulation interaction is required.
    // =====================================================

    function validateGenericAction(event) {

        if (
            !event ||
            !event.target
        ) {

            return false;

        }


        const target =
            event.target;


        const insideSimulation =
            !!closestFromTarget(
                target,
                [
                    "#cwTitleBar",
                    "#cwRibbonContentArea",
                    "#cwRibbonTabBar",
                    "#cwOfficeButton",
                    ".cwPageContent",
                    "#cwWorkspace",
                    "#cwWorkspaceShell",
                    "#cwDocumentContainer",
                    "button",
                    "[role='button']"
                ].join(",")
            );


        if (!insideSimulation) {

            return false;

        }


        markActionCompleted(
            "real-student-action"
        );


        return true;

    }


    // =====================================================
    // HANDLE SIMULATION CLICK
    // =====================================================

    function handleSimulationClick(event) {

        if (
            !state.started ||
            state.completed ||
            state.processing ||
            !state.waitingForStudent ||
            state.speaking
        ) {

            return;

        }


        const exercise =
            getCurrentExercise();


        if (!exercise) {
            return;
        }


        const type =
            state.currentType ||
            getExerciseType(
                exercise
            );


        // =================================================
        // EXERCISE 1
        // =================================================

        if (
            type ===
            "identify-interface"
        ) {

            if (
                validateInterfaceIdentification(
                    event
                ) &&
                allRequiredActionsComplete()
            ) {

                moveToNextExercise();

            }


            return;

        }


        // =================================================
        // EXERCISE 2
        //
        // CLICKING IS NOT VALIDATION.
        // Actual text input is required.
        // =================================================

        if (
            type ===
            "office-button-explanation"
        ) {

            if (
                getDocumentAreaTarget(
                    event.target
                )
            ) {

                if (state.ui.status) {

                    state.ui.status.textContent =
                        getLedgerStatusText() +
                        " — Zone de travail détectée. Tapez maintenant votre réponse.";

                }

            }


            return;

        }


        // =================================================
        // EXERCISE 3
        // =================================================

        if (
            type ===
            "create-document"
        ) {

            if (
                detectCreateDocumentAction(
                    event
                )
            ) {

                state.exercise3ActionDetected =
                    true;

                state.exercise3ActionTime =
                    Date.now();


                if (state.ui.status) {

                    state.ui.status.textContent =
                        "Action demandée détectée. Je vérifie maintenant le résultat réel...";

                }

            }


            return;

        }


        // =================================================
        // GENERIC
        // =================================================

        if (
            type ===
            "generic"
        ) {

            if (
                validateGenericAction(
                    event
                ) &&
                allRequiredActionsComplete()
            ) {

                moveToNextExercise();

            }

        }

    }


    // =====================================================
    // HANDLE REAL INPUT
    // =====================================================

    function handleSimulationInput(event) {

        if (
            !state.started ||
            state.completed ||
            state.processing ||
            !state.waitingForStudent ||
            state.speaking
        ) {

            return;

        }


        if (
            state.currentType !==
            "office-button-explanation"
        ) {

            return;

        }


        if (
            !getDocumentAreaTarget(
                event.target
            )
        ) {

            return;

        }


        processExercise2Input();

    }


    // =====================================================
    // HANDLE KEYUP
    // =====================================================

    function handleSimulationKeyup(event) {

        if (
            !state.started ||
            state.completed ||
            state.processing ||
            !state.waitingForStudent ||
            state.speaking
        ) {

            return;

        }


        if (
            state.currentType !==
            "office-button-explanation"
        ) {

            return;

        }


        if (
            !getDocumentAreaTarget(
                event.target
            )
        ) {

            return;

        }


        processExercise2Input();

    }


    // =====================================================
    // ATTACH LISTENERS
    // =====================================================

    function attachListeners() {

        if (
            !state.simulationDocument ||
            state.listenersAttached
        ) {

            return;

        }


        state.simulationDocument.addEventListener(
            "click",
            handleSimulationClick,
            true
        );


        state.simulationDocument.addEventListener(
            "input",
            handleSimulationInput,
            true
        );


        state.simulationDocument.addEventListener(
            "keyup",
            handleSimulationKeyup,
            true
        );


        state.listenersAttached =
            true;

    }


    // =====================================================
    // COMPLETE BLOCK 8
    // =====================================================

    async function completeBlock8() {

        state.completed =
            true;

        state.waitingForStudent =
            false;


        stopAllMonitors();


        if (state.ui.progress) {

            state.ui.progress.textContent =
                "Exercices terminés";

        }


        if (state.ui.instruction) {

            state.ui.instruction.textContent =
                "Tous les exercices du Chapitre 1 sont validés.";

        }


        if (state.ui.status) {

            state.ui.status.textContent =
                "Félicitations. Toutes les tâches ont été réellement exécutées et vérifiées.";

        }


        localStorage.setItem(
            "wordChapter1ExercisesCompleted",
            "true"
        );


        await speak(

            "Excellent travail. Vous avez terminé et réussi tous les exercices du Chapitre 1. " +
            "J'ai vérifié les actions demandées ainsi que vos réponses. " +
            "Vous avez démontré que vous pouvez utiliser les connaissances acquises avec davantage d'autonomie."

        );


        console.log(
            "RANISE BLOCK 8: STRICT EXERCISE MASTERY COMPLETED"
        );

    }


    // =====================================================
    // START BLOCK 8
    // =====================================================

    async function startBlock8() {

        if (
            state.started ||
            state.completed
        ) {

            return;

        }


        if (
            !connectToSimulation()
        ) {

            return;

        }


        const chapter =
            getChapter1();


        if (!chapter) {

            console.error(
                "RANISE BLOCK 8: Chapter 1 unavailable."
            );

            return;

        }


        if (
            !Array.isArray(
                chapter.exercises
            ) ||
            chapter.exercises.length === 0
        ) {

            console.error(
                "RANISE BLOCK 8: Chapter 1 exercises unavailable."
            );

            return;

        }


        state.chapter =
            chapter;


        state.exercises =
            chapter.exercises.filter(
                Boolean
            );


        state.practice =
            Array.isArray(
                chapter.practice
            )
                ? chapter.practice
                : [];


        state.exerciseIndex =
            0;


        state.currentExercise =
            state.exercises[0];


        state.started =
            true;

        state.completed =
            false;

        state.waitingForStudent =
            false;

        state.processing =
            false;

        state.transitionDetected =
            true;


        createExerciseUI();


        attachListeners();


        await speak(

            "Excellent. La pratique guidée est terminée. " +
            "Nous allons maintenant passer aux exercices. " +
            "Cette fois, je vais contrôler réellement les tâches que vous exécutez. " +
            "Je ne validerai pas un exercice simplement parce qu'un clic a été détecté. " +
            "Prenez le temps nécessaire pour chaque tâche."

        );


        await announceCurrentExercise();


        state.waitingForStudent =
            true;

    }


    // =====================================================
    // BLOCK 7 → BLOCK 8
    //
    // READ-ONLY ACCESS TO BLOCK 7 PUBLIC STATE.
    // BLOCK 7 IS NOT MODIFIED.
    // =====================================================

    function checkBlock7Completion() {

        if (
            state.started ||
            state.completed
        ) {

            return;

        }


        if (
            !window.RaniseMoisePracticeGuidanceEngine ||
            typeof
                window.RaniseMoisePracticeGuidanceEngine.getState !==
                "function"
        ) {

            return;

        }


        let block7State;


        try {

            block7State =
                window.RaniseMoisePracticeGuidanceEngine.getState();

        } catch (error) {

            return;

        }


        if (!block7State) {
            return;
        }


        if (
            block7State.completed === true &&
            block7State.speaking === false
        ) {

            state.transitionDetected =
                true;


            if (
                connectToSimulation()
            ) {

                startBlock8();

                return;

            }


            state.transitionDetected =
                false;

        }

    }


    // =====================================================
    // WAIT FOR SIMULATION
    // =====================================================

    function waitForSimulationThenStart() {

        if (
            state.started ||
            state.completed
        ) {

            return;

        }


        if (
            connectToSimulation()
        ) {

            checkBlock7Completion();

        }

    }


    // =====================================================
    // AUTOMATIC BRIDGE
    // =====================================================

    const transitionTimer =
        setInterval(

            function () {

                if (
                    state.started ||
                    state.completed
                ) {

                    clearInterval(
                        transitionTimer
                    );

                    return;

                }


                waitForSimulationThenStart();

            },

            100

        );


    // =====================================================
    // PUBLIC API
    // =====================================================

    window.RaniseMoiseExerciseMasteryEngine = {

        start:
            startBlock8,


        getState:
            function () {

                return {

                    started:
                        state.started,

                    completed:
                        state.completed,

                    exerciseIndex:
                        state.exerciseIndex,

                    exerciseCount:
                        state.exercises.length,

                    currentType:
                        state.currentType,

                    waitingForStudent:
                        state.waitingForStudent,

                    speaking:
                        state.speaking,

                    transitionDetected:
                        state.transitionDetected,

                    actionCount:
                        state.actionCount,

                    requiredActions:
                        state.actionLedger.length,

                    completedActions:
                        state.actionLedger.filter(
                            item =>
                                item.completed
                        ).length

                };

            }

    };


})();

























// =========================================================
// BLOCK 9
// MICROSOFT WORD 2007 FORMATION
// RANISE MOISE HOMEWORK MASTERY ENGINE
// =========================================================
// PRODUCTION FINAL VERSION
//
// PURPOSE:
// 1. START AUTOMATICALLY AFTER BLOCK 8 COMPLETES.
// 2. USE THE SAME EXISTING WORD 2007 SIMULATION.
// 3. READ CHAPTER 1 HOMEWORK DYNAMICALLY.
// 4. READ CHAPTER 1 PRACTICE DYNAMICALLY.
// 5. READ CHAPTER 1 EVALUATION DYNAMICALLY.
// 6. REQUIRE REAL SIMULATION ACTIONS.
// 7. REQUIRE REAL TEXT IN THE DOCUMENT.
// 8. REQUIRE A REAL CREATED DOCUMENT.
// 9. VERIFY THE FINAL DOCUMENT CONTENT.
// 10. VERIFY THE STUDENT'S REQUIRED WORK.
// 11. NEVER VALIDATE FROM A RANDOM CLICK.
// 12. NEVER VALIDATE FROM TEXT ALONE.
// 13. NEVER VALIDATE FROM A SINGLE ACTION.
// 14. GIVE BEGINNERS UNLIMITED PRACTICAL TIME.
// 15. DO NOT REQUIRE SAVE / ENREGISTRER.
// 16. DO NOT MODIFY BLOCK 6.
// 17. DO NOT MODIFY BLOCK 7.
// 18. DO NOT MODIFY BLOCK 8.
// 19. DO NOT MODIFY THE EXISTING SIMULATION ENGINE.
// 20. DO NOT MODIFY MARYTTS + AVATAR.
// 21. COMPLETE CHAPTER 1 ONLY AFTER REAL SUCCESS.
// 22. PANEL REMAINS SMALL AND DRAGGABLE.
// 23. PANEL DISAPPEARS AUTOMATICALLY AFTER VALIDATION.
// =========================================================

(function () {

    "use strict";


    // =====================================================
    // BLOCK 9 STATE
    // =====================================================

    const state = {

        initialized: false,

        started: false,

        completed: false,

        transitionDetected: false,

        simulationFrame: null,

        simulationDocument: null,

        chapter: null,

        homework: "",

        practice: [],

        evaluation: [],

        objective: [],

        waitingForStudent: false,

        processing: false,

        speaking: false,

        listenersAttached: false,

        observerAttached: false,

        mutationObserver: null,

        typedResponseTimer: null,

        lastDocumentText: "",

        lastDocumentSignature: "",

        lastActionTime: 0,

        actionHistory: [],


        // =================================================
        // REAL STUDENT ACTIONS
        // =================================================

        actionFlags: {

            titleBarSeen: false,

            officeButtonSeen: false,

            ribbonSeen: false,

            tabsSeen: false,

            documentAreaSeen: false,

            newDocumentAction: false,

            textEntered: false

        },


        // =================================================
        // VALIDATION STATE
        // =================================================

        validation: {

            contentValid: false,

            actionsValid: false,

            finalValid: false

        },


        // =================================================
        // UI
        // =================================================

        ui: {

            root: null,

            title: null,

            progress: null,

            instruction: null,

            status: null,

            details: null

        }

    };


    // =====================================================
    // NORMALIZE
    // =====================================================

    function normalize(value) {

        return String(value || "")

            .normalize("NFD")

            .replace(
                /[\u0300-\u036f]/g,
                ""
            )

            .toLowerCase()

            .replace(
                /[“”"«»]/g,
                " "
            )

            .replace(
                /[.,;:!?()[\]{}]/g,
                " "
            )

            .replace(
                /\s+/g,
                " "
            )

            .trim();

    }


    // =====================================================
    // WORD NORMALIZATION
    // =====================================================

    function normalizeResponse(value) {

        return normalize(value)

            .replace(
                /\b(le|la|les|un|une|des|du|de|d|et|ou|a|au|aux|dans|sur|pour|avec|en|ce|cette|ces)\b/g,
                " "
            )

            .replace(
                /\s+/g,
                " "
            )

            .trim();

    }


    // =====================================================
    // SPEAK USING EXISTING MARYTTS SYSTEM
    // =====================================================

    async function speak(text) {

        if (!text) {
            return;
        }


        state.speaking = true;


        if (
            typeof raniseStartTalking ===
            "function"
        ) {

            raniseStartTalking();

        }


        try {

            if (
                typeof speakProfessorIAWithMaryTTS ===
                "function"
            ) {

                await speakProfessorIAWithMaryTTS(
                    text
                );

            }

        } finally {

            state.speaking = false;


            if (
                typeof raniseStopTalking ===
                "function"
            ) {

                raniseStopTalking();

            }

        }

    }


    // =====================================================
    // GET CHAPTER 1
    // =====================================================

    function getChapter1() {

        if (
            typeof microsoftWordCourse ===
            "undefined"
        ) {

            return null;

        }


        if (
            !Array.isArray(
                microsoftWordCourse.chapters
            )
        ) {

            return null;

        }


        return microsoftWordCourse.chapters.find(

            chapter =>

                chapter &&

                chapter.id ===
                "chapitre1"

        ) || null;

    }


    // =====================================================
    // FIND EXISTING SIMULATION
    // =====================================================

    function findSimulation() {

        const campusContent =

            document.getElementById(
                "campusContent"
            );


        if (!campusContent) {
            return null;
        }


        return campusContent.querySelector(

            'iframe[src*="campusword2007simulation"]'

        ) || null;

    }


    // =====================================================
    // CONNECT TO EXISTING SIMULATION
    // =====================================================

    function connectToSimulation() {

        const frame =
            findSimulation();


        if (!frame) {
            return false;
        }


        try {

            const doc =

                frame.contentDocument ||

                frame.contentWindow.document;


            if (!doc) {
                return false;
            }


            state.simulationFrame =
                frame;

            state.simulationDocument =
                doc;


            return true;

        } catch (error) {

            return false;

        }

    }


    // =====================================================
    // GET PAGE CONTENTS
    // =====================================================

    function getPageContents() {

        if (
            !state.simulationDocument
        ) {

            return [];

        }


        return Array.from(

            state.simulationDocument.querySelectorAll(

                ".cwPageContent"

            )

        );

    }


    // =====================================================
    // READ REAL DOCUMENT TEXT
    // =====================================================

    function readDocumentText() {

        const pages =
            getPageContents();


        if (!pages.length) {
            return "";
        }


        let output = "";


        pages.forEach(

            page => {

                output +=

                    " " +

                    (

                        page.innerText ||

                        page.textContent ||

                        ""

                    );

            }

        );


        return output

            .replace(
                /\u00a0/g,
                " "
            )

            .replace(
                /\s+/g,
                " "
            )

            .trim();

    }


    // =====================================================
    // DOCUMENT SIGNATURE
    // =====================================================

    function getDocumentSignature() {

        const text =
            readDocumentText();


        const pages =
            getPageContents();


        return [

            pages.length,

            text.length,

            normalize(text)

        ].join("|");

    }


    // =====================================================
    // GET TITLE BAR
    // =====================================================

    function getTitleBar() {

        if (
            !state.simulationDocument
        ) {

            return null;

        }


        return state.simulationDocument.querySelector(

            "#cwTitleBar"

        );

    }


    // =====================================================
    // GET OFFICE BUTTON
    // =====================================================

    function getOfficeButton() {

        if (
            !state.simulationDocument
        ) {

            return null;

        }


        return state.simulationDocument.querySelector(

            "#cwOfficeButton[data-role='office-button'], #cwOfficeButton"

        );

    }


    // =====================================================
    // GET RIBBON
    // =====================================================

    function getRibbon() {

        if (
            !state.simulationDocument
        ) {

            return null;

        }


        return state.simulationDocument.querySelector(

            "#cwRibbonContentArea"

        );

    }


    // =====================================================
    // GET TABS
    // =====================================================

    function getTabs() {

        if (
            !state.simulationDocument
        ) {

            return [];

        }


        return Array.from(

            state.simulationDocument.querySelectorAll(

                "#cwRibbonTabBar .cwTabBtn"

            )

        );

    }


    // =====================================================
    // GET DOCUMENT AREA
    // =====================================================

    function getDocumentArea() {

        if (
            !state.simulationDocument
        ) {

            return null;

        }


        return state.simulationDocument.querySelector(

            ".cwPageContent"

        );

    }


    // =====================================================
    // GET ELEMENT DATA
    // =====================================================

    function getElementData(element) {

        if (!element) {
            return "";
        }


        return normalize(

            [

                element.id,

                element.className,

                element.innerText,

                element.textContent,

                element.getAttribute(
                    "title"
                ),

                element.getAttribute(
                    "aria-label"
                ),

                element.getAttribute(
                    "data-action"
                ),

                element.getAttribute(
                    "data-command"
                ),

                element.getAttribute(
                    "data-role"
                ),

                element.getAttribute(
                    "data-target"
                )

            ]

            .filter(Boolean)

            .join(" ")

        );

    }


    // =====================================================
    // CLOSEST
    // =====================================================

    function closestFromTarget(
        target,
        selector
    ) {

        if (

            !target ||

            !selector ||

            typeof target.closest !==
            "function"

        ) {

            return null;

        }


        try {

            return target.closest(
                selector
            );

        } catch (error) {

            return null;

        }

    }


    // =====================================================
    // RECORD REAL STUDENT ACTION
    // =====================================================

    function recordAction(action) {

        if (!action) {
            return;
        }


        state.lastActionTime =
            Date.now();


        state.actionHistory.push({

            action:
                action,

            timestamp:
                Date.now()

        });


        if (
            state.actionHistory.length >
            300
        ) {

            state.actionHistory.shift();

        }

    }


    // =====================================================
    // CREATE HOMEWORK PANEL
    // =====================================================

    function createHomeworkUI() {

        if (

            !state.simulationDocument ||

            state.ui.root

        ) {

            return;

        }


        const doc =
            state.simulationDocument;


        const root =
            doc.createElement("div");


        root.id =
            "raniseBlock9HomeworkPanel";


        // -------------------------------------------------
        // SMALL PANEL
        // -------------------------------------------------

        root.style.position =
            "fixed";

        root.style.top =
            "12px";

        root.style.right =
            "12px";

        root.style.width =
            "min(360px, calc(100vw - 24px))";

        root.style.maxWidth =
            "calc(100vw - 24px)";

        root.style.maxHeight =
            "calc(100vh - 24px)";

        root.style.overflowY =
            "auto";

        root.style.zIndex =
            "2147483640";

        root.style.background =
            "rgba(255,255,255,0.97)";

        root.style.border =
            "2px solid #1f4e79";

        root.style.borderRadius =
            "12px";

        root.style.boxShadow =
            "0 8px 30px rgba(0,0,0,0.25)";

        root.style.padding =
            "12px";

        root.style.fontFamily =
            "Arial, sans-serif";

        root.style.fontSize =
            "13px";

        root.style.lineHeight =
            "1.4";

        root.style.boxSizing =
            "border-box";

        root.style.userSelect =
            "none";

        root.style.webkitUserSelect =
            "none";


        // =================================================
        // TITLE / DRAG HANDLE
        // =================================================

        const title =
            doc.createElement("div");


        title.style.fontWeight =
            "700";

        title.style.fontSize =
            "16px";

        title.style.marginBottom =
            "7px";

        title.style.cursor =
            "grab";

        title.style.touchAction =
            "none";

        title.style.userSelect =
            "none";

        title.style.webkitUserSelect =
            "none";

        title.textContent =
            "Ranise Moïse — Devoir";


        // =================================================
        // PROGRESS
        // =================================================

        const progress =
            doc.createElement("div");


        progress.style.fontWeight =
            "600";

        progress.style.marginBottom =
            "7px";


        // =================================================
        // HOMEWORK
        // =================================================

        const instruction =
            doc.createElement("div");


        instruction.style.marginBottom =
            "8px";


        // =================================================
        // STATUS
        // =================================================

        const status =
            doc.createElement("div");


        status.style.padding =
            "7px";

        status.style.borderRadius =
            "7px";

        status.style.background =
            "#eef4f8";

        status.style.marginBottom =
            "7px";


        // =================================================
        // DETAILS
        // =================================================

        const details =
            doc.createElement("div");


        details.style.fontSize =
            "12px";

        details.style.lineHeight =
            "1.35";


        root.appendChild(title);

        root.appendChild(progress);

        root.appendChild(instruction);

        root.appendChild(status);

        root.appendChild(details);


        (
            doc.body ||
            doc.documentElement
        ).appendChild(root);


        state.ui.root =
            root;

        state.ui.title =
            title;

        state.ui.progress =
            progress;

        state.ui.instruction =
            instruction;

        state.ui.status =
            status;

        state.ui.details =
            details;


        enableHomeworkPanelDragging();

    }


    // =====================================================
    // DRAG ENGINE
    // =====================================================

    function enableHomeworkPanelDragging() {

        if (

            !state.ui.root ||

            !state.ui.title

        ) {

            return;

        }


        const panel =
            state.ui.root;

        const handle =
            state.ui.title;


        let dragging =
            false;

        let pointerId =
            null;

        let offsetX =
            0;

        let offsetY =
            0;


        function clampPosition(
            left,
            top
        ) {

            const doc =
                state.simulationDocument;


            const viewWidth =

                doc?.documentElement?.clientWidth ||

                window.innerWidth;


            const viewHeight =

                doc?.documentElement?.clientHeight ||

                window.innerHeight;


            const panelWidth =
                panel.offsetWidth;


            const panelHeight =
                panel.offsetHeight;


            return {

                left:

                    Math.max(

                        0,

                        Math.min(

                            left,

                            Math.max(

                                0,

                                viewWidth -
                                panelWidth

                            )

                        )

                    ),


                top:

                    Math.max(

                        0,

                        Math.min(

                            top,

                            Math.max(

                                0,

                                viewHeight -
                                panelHeight

                            )

                        )

                    )

            };

        }


        function startDrag(event) {

            if (!event) {
                return;
            }


            if (

                event.pointerType ===
                "mouse" &&

                event.button !== 0

            ) {

                return;

            }


            const rect =
                panel.getBoundingClientRect();


            dragging =
                true;


            pointerId =
                event.pointerId;


            offsetX =
                event.clientX -
                rect.left;


            offsetY =
                event.clientY -
                rect.top;


            handle.style.cursor =
                "grabbing";


            if (

                typeof handle.setPointerCapture ===
                "function" &&

                event.pointerId !==
                undefined

            ) {

                try {

                    handle.setPointerCapture(
                        event.pointerId
                    );

                } catch (error) {}

            }


            event.preventDefault();

        }


        function moveDrag(event) {

            if (

                !dragging ||

                !event

            ) {

                return;

            }


            if (

                pointerId !== null &&

                event.pointerId !==
                pointerId

            ) {

                return;

            }


            const position =
                clampPosition(

                    event.clientX -
                    offsetX,

                    event.clientY -
                    offsetY

                );


            panel.style.left =
                position.left + "px";


            panel.style.top =
                position.top + "px";


            panel.style.right =
                "auto";


            event.preventDefault();

        }


        function stopDrag(event) {

            if (!dragging) {
                return;
            }


            if (

                event &&

                pointerId !== null &&

                event.pointerId !==
                pointerId

            ) {

                return;

            }


            dragging =
                false;


            pointerId =
                null;


            handle.style.cursor =
                "grab";

        }


        handle.addEventListener(
            "pointerdown",
            startDrag,
            true
        );


        handle.addEventListener(
            "pointermove",
            moveDrag,
            true
        );


        handle.addEventListener(
            "pointerup",
            stopDrag,
            true
        );


        handle.addEventListener(
            "pointercancel",
            stopDrag,
            true
        );

    }


    // =====================================================
    // UPDATE PANEL
    // =====================================================

    function updateHomeworkUI() {

        if (!state.ui.root) {
            return;
        }


        state.ui.progress.textContent =
            "Devoir — Chapitre 1";


        state.ui.instruction.textContent =

            state.homework ||

            "Réalisez le devoir demandé.";


        state.ui.details.innerHTML =

            "Contrôle du professeur :<br>" +

            "• Barre de titre : " +

            (

                state.actionFlags.titleBarSeen
                    ? "✓"
                    : "…"

            ) +

            "<br>" +

            "• Bouton Office : " +

            (

                state.actionFlags.officeButtonSeen
                    ? "✓"
                    : "…"

            ) +

            "<br>" +

            "• Ruban : " +

            (

                state.actionFlags.ribbonSeen
                    ? "✓"
                    : "…"

            ) +

            "<br>" +

            "• Onglets : " +

            (

                state.actionFlags.tabsSeen
                    ? "✓"
                    : "…"

            ) +

            "<br>" +

            "• Zone document : " +

            (

                state.actionFlags.documentAreaSeen
                    ? "✓"
                    : "…"

            ) +

            "<br>" +

            "• Document créé : " +

            (

                state.actionFlags.newDocumentAction
                    ? "✓"
                    : "…"

            ) +

            "<br>" +

            "• Contenu du devoir : " +

            (

                state.actionFlags.textEntered
                    ? "✓"
                    : "…"

            );

    }


    // =====================================================
    // STATUS MESSAGE
    // =====================================================

    function setStatus(message) {

        if (
            state.ui.status
        ) {

            state.ui.status.textContent =
                message;

        }

    }


    // =====================================================
    // FIND NEW DOCUMENT ACTION
    // =====================================================

    function isNewDocumentAction(target) {

        if (!target) {
            return false;
        }


        const actionTarget =

            closestFromTarget(

                target,

                [

                    "[data-action='new']",

                    "[data-action='new-document']",

                    "[data-command='new']",

                    "[data-command='new-document']"

                ].join(",")

            );


        if (actionTarget) {
            return true;
        }


        const officeItem =

            closestFromTarget(

                target,

                "#cwOfficeMenu .cwOfficeItem"

            );


        if (officeItem) {

            const action =

                normalize(

                    officeItem.getAttribute(
                        "data-action"
                    )

                );


            return (

                action === "new" ||

                action === "new-document"

            );

        }


        return false;

    }


    // =====================================================
    // RECORD INTERFACE ACTIONS
    // =====================================================

    function inspectInterfaceTarget(target) {

        if (!target) {
            return;
        }


        if (

            closestFromTarget(
                target,
                "#cwTitleBar"
            )

        ) {

            state.actionFlags.titleBarSeen =
                true;

            recordAction(
                "title-bar"
            );

        }


        if (

            closestFromTarget(

                target,

                "#cwOfficeButton[data-role='office-button'], #cwOfficeButton"

            )

        ) {

            state.actionFlags.officeButtonSeen =
                true;

            recordAction(
                "office-button"
            );

        }


        if (

            closestFromTarget(

                target,

                "#cwRibbonContentArea"

            )

        ) {

            state.actionFlags.ribbonSeen =
                true;

            recordAction(
                "ribbon"
            );

        }


        if (

            closestFromTarget(

                target,

                "#cwRibbonTabBar .cwTabBtn"

            )

        ) {

            state.actionFlags.tabsSeen =
                true;

            recordAction(
                "tab"
            );

        }


        if (

            closestFromTarget(

                target,

                ".cwPageContent"

            )

        ) {

            state.actionFlags.documentAreaSeen =
                true;

            recordAction(
                "document-area"
            );

        }


        if (
            isNewDocumentAction(target)
        ) {

            state.actionFlags.newDocumentAction =
                true;

            recordAction(
                "new-document"
            );

        }


        updateHomeworkUI();

    }


    // =====================================================
    // CHECK IF TEXT IS MEANINGFUL
    // =====================================================

    function hasMeaningfulText(text) {

        const value =
            normalizeResponse(text);


        if (!value) {
            return false;
        }


        if (
            value.length < 40
        ) {

            return false;

        }


        const words =

            value
                .split(" ")
                .filter(Boolean);


        if (
            words.length < 8
        ) {

            return false;

        }


        return true;

    }


    // =====================================================
    // VERIFY REQUIRED WORD 2007 CONCEPTS
    //
    // FIVE CORE ELEMENTS ARE REQUIRED.
    //
    // 1. BARRE DE TITRE
    // 2. BOUTON OFFICE
    // 3. RUBAN
    // 4. ONGLET(S)
    // 5. ZONE DE TRAVAIL / DOCUMENT
    //
    // RÈGLES + BARRE D'ÉTAT ARE OPTIONAL SUPPORTING
    // CONCEPTS AND ARE NOT REQUIRED FOR PASSING.
    // =====================================================

    function validateRequiredConcepts(text) {

        const value =
            normalizeResponse(text);


        const groups = {

            titleBar: [

                "barre de titre",

                "title bar",

                "titre"

            ],


            officeButton: [

                "bouton office",

                "office button",

                "office"

            ],


            ribbon: [

                "ruban",

                "ribbon"

            ],


            tabs: [

                "onglet",

                "onglets",

                "tabs"

            ],


            documentArea: [

                "zone de travail",

                "zone du document",

                "zone document",

                "document area"

            ],


            ruler: [

                "regle",

                "regles",

                "ruler",

                "rulers"

            ],


            statusBar: [

                "barre d etat",

                "barre etat",

                "status bar"

            ]

        };


        const result = {};


        Object.keys(groups).forEach(

            group => {

                result[group] =

                    groups[group].some(

                        keyword =>

                            value.includes(

                                normalize(
                                    keyword
                                )

                            )

                    );

            }

        );


        const requiredGroups = [

            "titleBar",

            "officeButton",

            "ribbon",

            "tabs",

            "documentArea"

        ];


        const discovered =

            requiredGroups.filter(

                group =>
                    result[group]

            );


        return {

            correct:
                discovered.length >= 5,

            result:
                result,

            discovered:
                discovered.length

        };

    }


    // =====================================================
    // VERIFY DOCUMENT CONTENT
    // =====================================================

    function validateDocumentContent() {

        const text =
            readDocumentText();


        state.lastDocumentText =
            text;


        if (
            !hasMeaningfulText(text)
        ) {

            return {

                correct:
                    false,

                reason:
                    "Le document ne contient pas encore suffisamment de contenu."

            };

        }


        const concepts =

            validateRequiredConcepts(
                text
            );


        if (
            !concepts.correct
        ) {

            return {

                correct:
                    false,

                reason:
                    "Les cinq principaux éléments demandés ne sont pas encore tous présents dans le document."

            };

        }


        const normalized =

            normalizeResponse(
                text
            );


        const wordContext =

            normalized.includes(
                "word"
            ) ||

            normalized.includes(
                "microsoft"
            );


        if (!wordContext) {

            return {

                correct:
                    false,

                reason:
                    "Le contenu ne montre pas clairement qu'il présente Microsoft Word 2007."

            };

        }


        return {

            correct:
                true,

            reason:
                "Le document présente les cinq éléments principaux demandés de l'environnement Word 2007."

        };

    }


    // =====================================================
    // VERIFY REAL SIMULATION ACTIONS
    // =====================================================

    function validateSimulationActions() {

        const flags =
            state.actionFlags;


        const interfaceActions =

            flags.titleBarSeen &&

            flags.officeButtonSeen &&

            flags.ribbonSeen &&

            flags.tabsSeen &&

            flags.documentAreaSeen;


        const documentCreated =

            flags.newDocumentAction;


        const textEntered =

            flags.textEntered;


        return {

            correct:

                interfaceActions &&

                documentCreated &&

                textEntered,


            interfaceActions:
                interfaceActions,


            documentCreated:
                documentCreated,


            textEntered:
                textEntered

        };

    }


    // =====================================================
    // VERIFY COMPLETE HOMEWORK
    //
    // IMPORTANT:
    // NO SAVE CONDITION EXISTS HERE.
    // =====================================================

    function validateFinalHomework() {

        const actionValidation =

            validateSimulationActions();


        const contentValidation =

            validateDocumentContent();


        state.validation.actionsValid =

            actionValidation.correct;


        state.validation.contentValid =

            contentValidation.correct;


        state.validation.finalValid =

            actionValidation.correct &&

            contentValidation.correct;


        return {

            finalValid:
                state.validation.finalValid,

            actions:
                actionValidation,

            content:
                contentValidation

        };

    }


    // =====================================================
    // INTELLIGENT STATUS
    // =====================================================

    function updateIntelligentStatus() {

        if (

            state.completed ||

            !state.ui.status

        ) {

            return;

        }


        const result =
            validateFinalHomework();


        if (
            result.finalValid
        ) {

            setStatus(

                "Tout le travail demandé est détecté. Ranise effectue maintenant la vérification finale."

            );

            return;

        }


        if (
            !result.actions.interfaceActions
        ) {

            setStatus(

                "Je vérifie encore votre utilisation réelle de l'interface Word 2007. Prenez votre temps."

            );

            return;

        }


        if (
            !result.actions.documentCreated
        ) {

            setStatus(

                "Les éléments de l'interface sont repérés. Vous devez maintenant créer le document demandé."

            );

            return;

        }


        if (
            !result.content.correct
        ) {

            setStatus(

                "Le document existe. Continuez à présenter dans le document les différents éléments demandés. Je vérifie le contenu réel."

            );

            return;

        }


        setStatus(

            "Vérification finale du devoir en cours..."

        );

    }


    // =====================================================
    // DOCUMENT CHANGE HANDLER
    // =====================================================

    function handleDocumentChange() {

        if (

            !state.started ||

            state.completed

        ) {

            return;

        }


        const text =
            readDocumentText();


        const signature =
            getDocumentSignature();


        if (

            signature !==

            state.lastDocumentSignature

        ) {

            state.lastDocumentSignature =
                signature;


            state.lastDocumentText =
                text;


            if (
                text.trim().length > 0
            ) {

                state.actionFlags.textEntered =
                    true;

                recordAction(
                    "document-text"
                );

            }


            updateHomeworkUI();

            updateIntelligentStatus();

        }

    }


    // =====================================================
    // INPUT EVENT
    // =====================================================

    function handleSimulationInput(event) {

        if (

            !state.started ||

            state.completed ||

            state.processing

        ) {

            return;

        }


        if (

            event &&

            event.target &&

            closestFromTarget(

                event.target,

                ".cwPageContent"

            )

        ) {

            state.actionFlags.documentAreaSeen =
                true;

        }


        handleDocumentChange();

    }


    // =====================================================
    // CLICK EVENT
    // =====================================================

    function handleSimulationClick(event) {

        if (

            !state.started ||

            state.completed

        ) {

            return;

        }


        if (!event) {
            return;
        }


        inspectInterfaceTarget(
            event.target
        );


        if (

            closestFromTarget(

                event.target,

                ".cwPageContent"

            )

        ) {

            state.actionFlags.documentAreaSeen =
                true;

            recordAction(
                "document-area-click"
            );

        }


        handleDocumentChange();


        scheduleValidation();

    }


    // =====================================================
    // KEYUP
    // =====================================================

    function handleSimulationKeyup() {

        if (

            !state.started ||

            state.completed

        ) {

            return;

        }


        handleDocumentChange();

        scheduleValidation();

    }


    // =====================================================
    // SCHEDULE VALIDATION
    // =====================================================

    function scheduleValidation() {

        if (
            state.typedResponseTimer
        ) {

            clearTimeout(
                state.typedResponseTimer
            );

        }


        state.typedResponseTimer =

            setTimeout(

                function () {

                    state.typedResponseTimer =
                        null;

                    attemptFinalValidation();

                },

                700

            );

    }


    // =====================================================
    // FINAL VALIDATION
    // =====================================================

    async function attemptFinalValidation() {

        if (

            !state.started ||

            state.completed ||

            state.processing

        ) {

            return;

        }


        updateHomeworkUI();


        const result =
            validateFinalHomework();


        if (
            !result.finalValid
        ) {

            updateIntelligentStatus();

            return;

        }


        await completeHomework();

    }


    // =====================================================
    // REMOVE HOMEWORK PANEL
    //
    // IMPORTANT:
    // PANEL DISAPPEARS AUTOMATICALLY AFTER VALIDATION.
    // =====================================================

    function removeHomeworkPanel() {

        if (
            state.ui.root
        ) {

            try {

                state.ui.root.remove();

            } catch (error) {

                if (
                    state.ui.root.parentNode
                ) {

                    state.ui.root.parentNode.removeChild(
                        state.ui.root
                    );

                }

            }

        }


        state.ui.root =
            null;

        state.ui.title =
            null;

        state.ui.progress =
            null;

        state.ui.instruction =
            null;

        state.ui.status =
            null;

        state.ui.details =
            null;

    }


    // =====================================================
    // STOP INTERNAL OBSERVERS / TIMERS
    // =====================================================

    function stopBlock9Monitoring() {

        if (
            state.typedResponseTimer
        ) {

            clearTimeout(
                state.typedResponseTimer
            );

            state.typedResponseTimer =
                null;

        }


        if (
            state.mutationObserver
        ) {

            try {

                state.mutationObserver.disconnect();

            } catch (error) {}

            state.mutationObserver =
                null;

        }


        state.observerAttached =
            false;

    }


    // =====================================================
    // SUCCESS FEEDBACK
    // =====================================================

    async function completeHomework() {

        if (

            state.completed ||

            state.processing

        ) {

            return;

        }


        state.processing =
            true;


        try {

            // ---------------------------------------------
            // FINAL SECOND VERIFICATION
            // ---------------------------------------------

            const finalCheck =
                validateFinalHomework();


            if (
                !finalCheck.finalValid
            ) {

                updateIntelligentStatus();

                return;

            }


            state.completed =
                true;


            state.waitingForStudent =
                false;


            // ---------------------------------------------
            // SAVE CHAPTER 1 COMPLETION FLAG
            //
            // This is course progress only.
            // It is NOT document saving.
            // ---------------------------------------------

            localStorage.setItem(

                "wordChapter1HomeworkCompleted",

                "true"

            );


            // ---------------------------------------------
            // COMPLETE EXISTING CHAPTER SYSTEM
            // ---------------------------------------------

            if (

                typeof WordChapterCompletionEngine !==
                "undefined" &&

                typeof WordChapterCompletionEngine.completeChapter ===
                "function"

            ) {

                WordChapterCompletionEngine.completeChapter(

                    "chapitre1"

                );

            }


            // ---------------------------------------------
            // KEEP PROGRESS ENGINE SYNCHRONIZED
            // ---------------------------------------------

            if (

                typeof MicrosoftWordProgressEngine !==
                "undefined"

            ) {

                const progress =

                    MicrosoftWordProgressEngine.get();


                if (

                    !Array.isArray(
                        progress.completedChapters
                    )

                ) {

                    progress.completedChapters =
                        [];

                }


                if (

                    !progress.completedChapters.includes(
                        "chapitre1"
                    )

                ) {

                    progress.completedChapters.push(
                        "chapitre1"
                    );

                }


                MicrosoftWordProgressEngine.save(
                    progress
                );

            }


            // ---------------------------------------------
            // UNLOCK NEXT CHAPTER
            // ---------------------------------------------

            if (

                typeof WordChapterUnlockEngine !==
                "undefined" &&

                typeof WordChapterUnlockEngine.checkProgress ===
                "function"

            ) {

                WordChapterUnlockEngine.checkProgress();

            }


            // ---------------------------------------------
            // IMPORTANT:
            // REMOVE PANEL AUTOMATICALLY.
            //
            // The student should NOT continue seeing
            // the homework instruction card after Ranise
            // has validated the work.
            // ---------------------------------------------

            removeHomeworkPanel();


            // ---------------------------------------------
            // STOP BLOCK 9 INTERNAL MONITORING
            // ---------------------------------------------

            stopBlock9Monitoring();


            // ---------------------------------------------
            // FINAL PROFESSOR VOICE
            // ---------------------------------------------

            await speak(

                "Excellent travail. " +

                "J'ai vérifié votre utilisation réelle de la simulation ainsi que le contenu réel de votre document. " +

                "Les différents éléments demandés pour ce devoir sont bien présents. " +

                "Votre devoir du Chapitre 1 est maintenant validé. " +

                "Félicitations, vous avez terminé cette étape."

            );


            console.log(

                "RANISE BLOCK 9: " +

                "CHAPTER 1 HOMEWORK COMPLETED AND VALIDATED"

            );

        } finally {

            state.processing =
                false;

        }

    }


    // =====================================================
    // ATTACH MUTATION OBSERVER
    // =====================================================

    function attachMutationObserver() {

        if (

            state.observerAttached ||

            !state.simulationDocument

        ) {

            return;

        }


        if (
            typeof MutationObserver ===
            "undefined"
        ) {

            return;

        }


        const target =

            state.simulationDocument.body ||

            state.simulationDocument.documentElement;


        if (!target) {
            return;
        }


        state.mutationObserver =

            new MutationObserver(

                function () {

                    if (

                        state.started &&

                        !state.completed

                    ) {

                        handleDocumentChange();

                    }

                }

            );


        state.mutationObserver.observe(

            target,

            {

                subtree:
                    true,

                childList:
                    true,

                characterData:
                    true

            }

        );


        state.observerAttached =
            true;

    }


    // =====================================================
    // ATTACH EVENT LISTENERS
    // =====================================================

    function attachListeners() {

        if (

            !state.simulationDocument ||

            state.listenersAttached

        ) {

            return;

        }


        const doc =
            state.simulationDocument;


        doc.addEventListener(

            "click",

            handleSimulationClick,

            true

        );


        doc.addEventListener(

            "input",

            handleSimulationInput,

            true

        );


        doc.addEventListener(

            "keyup",

            handleSimulationKeyup,

            true

        );


        doc.addEventListener(

            "change",

            handleDocumentChange,

            true

        );


        state.listenersAttached =
            true;


        attachMutationObserver();

    }


    // =====================================================
    // ANNOUNCE HOMEWORK
    // =====================================================

    async function announceHomework() {

        updateHomeworkUI();


        await speak(

            "Nous passons maintenant au devoir du Chapitre 1. " +

            "Cette fois, je vais observer votre travail dans la simulation et vérifier le document que vous allez produire. " +

            "Prenez tout le temps dont vous avez besoin. " +

            "Votre devoir consiste à créer un document présentant les différents éléments que vous avez découverts dans Microsoft Word 2007. " +

            "Utilisez réellement l'interface, créez le document et rédigez votre travail dans la zone du document. " +

            "Je ne validerai le devoir que lorsque les actions demandées et le contenu réel du document seront correctement réalisés."

        );


        state.waitingForStudent =
            true;


        setStatus(

            "Commencez le devoir. Je vous laisse travailler à votre rythme et je vérifie chaque étape."

        );

    }


    // =====================================================
    // LOAD DYNAMIC COURSE DATA
    // =====================================================

    function loadChapterData() {

        const chapter =
            getChapter1();


        if (!chapter) {
            return false;
        }


        state.chapter =
            chapter;


        state.homework =

            String(

                chapter.homework ||

                ""

            ).trim();


        state.practice =

            Array.isArray(
                chapter.practice
            )

                ? chapter.practice

                : [];


        state.evaluation =

            Array.isArray(
                chapter.evaluation
            )

                ? chapter.evaluation

                : [];


        state.objective =

            Array.isArray(
                chapter.objective
            )

                ? chapter.objective

                : [];


        return !!state.homework;

    }


    // =====================================================
    // START BLOCK 9
    // =====================================================

    async function startBlock9() {

        if (

            state.started ||

            state.completed

        ) {

            return;

        }


        if (
            !connectToSimulation()
        ) {

            return;

        }


        if (
            !loadChapterData()
        ) {

            console.error(

                "RANISE BLOCK 9: " +

                "Chapter 1 homework unavailable."

            );

            return;

        }


        state.started =
            true;


        state.completed =
            false;


        state.waitingForStudent =
            false;


        state.processing =
            false;


        state.transitionDetected =
            true;


        state.lastDocumentSignature =
            getDocumentSignature();


        createHomeworkUI();


        attachListeners();


        updateHomeworkUI();


        await speak(

            "Très bien. Les exercices sont terminés. " +

            "Nous allons maintenant passer au devoir. " +

            "Je vais vous laisser travailler de manière autonome, mais cette fois je vais contrôler beaucoup plus précisément votre travail."

        );


        await announceHomework();

    }


    // =====================================================
    // DETECT BLOCK 8 COMPLETION
    //
    // BLOCK 8 IS READ ONLY.
    // =====================================================

    function checkBlock8Completion() {

        if (

            state.started ||

            state.completed ||

            state.transitionDetected

        ) {

            return;

        }


        if (

            !window.RaniseMoiseExerciseMasteryEngine ||

            typeof
                window.RaniseMoiseExerciseMasteryEngine.getState !==
                "function"

        ) {

            return;

        }


        let block8State;


        try {

            block8State =

                window.RaniseMoiseExerciseMasteryEngine
                    .getState();

        } catch (error) {

            return;

        }


        if (!block8State) {
            return;
        }


        // -------------------------------------------------
        // BLOCK 9 MUST NOT INTERRUPT BLOCK 8.
        // -------------------------------------------------

        if (

            block8State.completed ===
            true &&

            block8State.speaking ===
            false

        ) {

            state.transitionDetected =
                true;


            if (
                connectToSimulation()
            ) {

                startBlock9();

                return;

            }


            state.transitionDetected =
                false;

        }

    }


    // =====================================================
    // WAIT FOR SIMULATION
    // =====================================================

    function waitForSimulationThenStart() {

        if (

            state.started ||

            state.completed

        ) {

            return;

        }


        if (
            connectToSimulation()
        ) {

            checkBlock8Completion();

        }

    }


    // =====================================================
    // AUTOMATIC BLOCK 8 → BLOCK 9 BRIDGE
    // =====================================================

    const transitionTimer =

        setInterval(

            function () {

                if (

                    state.started ||

                    state.completed

                ) {

                    clearInterval(
                        transitionTimer
                    );

                    return;

                }


                waitForSimulationThenStart();

            },

            100

        );


    // =====================================================
    // PUBLIC API
    // =====================================================

    window.RaniseMoiseHomeworkMasteryEngine = {

        start:
            startBlock9,


        getState:

            function () {

                return {

                    started:
                        state.started,

                    completed:
                        state.completed,

                    waitingForStudent:
                        state.waitingForStudent,

                    speaking:
                        state.speaking,

                    transitionDetected:
                        state.transitionDetected,

                    actionFlags:

                        Object.assign(

                            {},

                            state.actionFlags

                        ),

                    validation:

                        Object.assign(

                            {},

                            state.validation

                        ),

                    homework:
                        state.homework

                };

            }

    };


})();




















































































































;// =========================================================
// CAMPUS WORD 2007
// RANISE IA COPY ABOVE WORD SIMULATION
// ISOLATED ADD-ON
// DOES NOT MODIFY EXISTING LAUNCH CODE
// DOES NOT MODIFY SIMULATION IFRAME
// DOES NOT MODIFY NOTIFICATIONS
// =========================================================

(function(){

    "use strict";


    const RANISE_COPY_CLASS =
        "ranise-word-simulation-ai-copy";


    const RANISE_SPACE_CLASS =
        "ranise-word-simulation-ai-space";


    let raniseOriginalTemplate = null;



    // =====================================================
    // FIND THE EXISTING VISIBLE RANISE CARD
    // BY ITS RANISE AVATAR IMAGE
    // =====================================================

    function findExistingRaniseCard(){

        const images =
            document.querySelectorAll(
                'img[src*="ranise-moise"]'
            );


        if(!images.length){

            return null;

        }


        for(
            const image of images
            ){

            let element =
                image;


            for(
                let level = 0;
                level < 6 && element;
                level++
            ){

                if(
                    element.id === "campusContent"
                ){

                    break;

                }


                if(
                    element !== image &&
                    element.children &&
                    element.children.length > 0
                ){

                    const rect =
                        element.getBoundingClientRect();


                    if(
                        rect.width > 0 &&
                        rect.height > 0
                    ){

                        return element;

                    }

                }


                element =
                    element.parentElement;

            }

        }


        return null;

    }



    // =====================================================
    // SAVE RANISE BEFORE EXISTING SIMULATION CODE RUNS
    // =====================================================

    document.addEventListener(

        "click",

        function(event){

            const launchButton =
                event.target.closest(
                    "#launchMicrosoftWordSimulationBtn"
                );


            if(!launchButton){

                return;

            }


            const existingRanise =
                findExistingRaniseCard();


            if(
                existingRanise
            ){

                raniseOriginalTemplate =
                    existingRanise.cloneNode(true);

            }


        },

        true

    );



    // =====================================================
    // WAIT FOR EXISTING SIMULATION IFRAME
    // =====================================================

    document.addEventListener(

        "click",

        function(event){

            const launchButton =
                event.target.closest(
                    "#launchMicrosoftWordSimulationBtn"
                );


            if(!launchButton){

                return;

            }


            let attempts =
                0;


            const waitForSimulation =
                setInterval(function(){

                    attempts++;


                    const campusContent =
                        document.getElementById(
                            "campusContent"
                        );


                    if(!campusContent){

                        return;

                    }


                    const simulationFrame =
                        campusContent.querySelector(
                            'iframe[src*="campusword2007simulation"]'
                        );


                    if(!simulationFrame){

                        if(
                            attempts >= 50
                        ){

                            clearInterval(
                                waitForSimulation
                            );

                        }

                        return;

                    }


                    clearInterval(
                        waitForSimulation
                    );


                    // =====================================
                    // PREVENT DUPLICATION
                    // =====================================

                    const oldSpace =
                        campusContent.querySelector(
                            "." +
                            RANISE_SPACE_CLASS
                        );


                    if(oldSpace){

                        oldSpace.remove();

                    }


                    // =====================================
                    // CREATE NEW RANISE SPACE
                    // =====================================

                    const raniseSpace =
                        document.createElement(
                            "div"
                        );


                    raniseSpace.className =
                        RANISE_SPACE_CLASS;



                    // =====================================
                    // CREATE RANISE COPY
                    // =====================================

                    if(
                        raniseOriginalTemplate
                    ){

                        const raniseCopy =
                            raniseOriginalTemplate.cloneNode(
                                true
                            );


                        raniseCopy.classList.add(
                            RANISE_COPY_CLASS
                        );


                        raniseSpace.appendChild(
                            raniseCopy
                        );

                    }


                    // =====================================
                    // INSERT ABOVE SIMULATION
                    // =====================================

                    simulationFrame.parentNode.insertBefore(

                        raniseSpace,

                        simulationFrame

                    );


                }, 20);


        },

        true

    );



    // =====================================================
    // ISOLATED CSS
    // =====================================================


    const style =
        document.createElement(
            "style"
        );


style.textContent = `

    .${RANISE_SPACE_CLASS} {

        width: 100%;

        box-sizing: border-box;

        display: flex;

        justify-content: center;

        align-items: flex-start;

        margin: 0 0 8px 0;

        padding: 0;

        overflow: hidden;

    }


    .${RANISE_COPY_CLASS} {

        width: 55% !important;

        max-width: 55% !important;

        transform: scale(0.75);

        transform-origin: top center;

        box-sizing: border-box;

        margin: 0 !important;

    }


    .${RANISE_COPY_CLASS} img {

        max-width: 100%;

        height: auto;

    }

`;


    document.head.appendChild(
        style
    );


})();
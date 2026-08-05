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
// RANISE MOISE PRACTICE SESSION CONTROL ENGINE
// =========================================================
// ISOLATED ADD-ON
// DOES NOT MODIFY BLOCK 4
// DOES NOT MODIFY BLOCK 5
// DOES NOT MODIFY BLOCK 6
// DOES NOT MODIFY EXISTING COURSE DATA
// DOES NOT MODIFY EXISTING SIMULATION CODE
// DOES NOT MODIFY EXISTING LAUNCH BUTTON
// USES EXISTING RANISE MARY TTS SYSTEM
// USES EXISTING RANISE ANIMATION SYSTEM
// =========================================================

(function(){

    "use strict";


    // =====================================================
    // PRIVATE STATE
    // =====================================================

    let practiceSessionActive = false;

    let practiceWelcomePlayed = false;

    let currentPracticeActivityIndex = 0;

    let currentPracticeStepIndex = 0;

    let practiceData = [];

    let simulationFrame = null;



    // =====================================================
    // RANISE PRACTICE WELCOME MESSAGE
    // =====================================================

    const PRACTICE_WELCOME_MESSAGE =

        "Bravo ! Vous venez de franchir la première étape pratique avec succès. " +

        "Je suis Ranise Moise, votre professeure IA. " +

        "Je vais maintenant vous guider étape par étape dans cet espace de simulation Microsoft Word 2007.";



    // =====================================================
    // SAFE RANISE SPEAK FUNCTION
    // =====================================================

    async function speakRanise(text){

        if(
            !text ||
            typeof text !== "string" ||
            !text.trim()
        ){

            return false;

        }


        if(
            typeof speakProfessorIAWithMaryTTS !==
            "function"
        ){

            console.error(
                "BLOCK 7: MaryTTS function unavailable."
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


            await speakProfessorIAWithMaryTTS(
                text.trim()
            );


            return true;


        }catch(error){

            console.error(
                "BLOCK 7: Ranise speech error.",
                error
            );

            return false;


        }finally{

            if(
                typeof raniseStopTalking ===
                "function"
            ){

                raniseStopTalking();

            }

        }

    }



    // =====================================================
    // LOAD EXISTING PRACTICE DATA
    // DOES NOT CHANGE THE ORIGINAL DATA
    // =====================================================

    function loadPracticeData(){

        if(
            typeof microsoftWordCourse ===
            "undefined"
        ){

            return false;

        }


        if(
            !Array.isArray(
                microsoftWordCourse.chapters
            )
        ){

            return false;

        }


        const chapter =

            microsoftWordCourse.chapters.find(

                function(item){

                    return (
                        item &&
                        item.id === "chapitre1"
                    );

                }

            );


        if(!chapter){

            return false;

        }


        if(
            !Array.isArray(
                chapter.practice
            )
        ){

            return false;

        }


        // -------------------------------------------------
        // COPY ONLY
        // ORIGINAL COURSE DATA REMAINS UNTOUCHED
        // -------------------------------------------------

        practiceData =

            chapter.practice.map(

                function(activity){

                    return {

                        title:
                            activity &&
                            typeof activity.title === "string"
                                ? activity.title
                                : "",

                        steps:
                            activity &&
                            Array.isArray(activity.steps)
                                ? activity.steps.slice()
                                : []

                    };

                }

            );


        return true;

    }



    // =====================================================
    // RESET PRACTICE SESSION
    // =====================================================

    function resetPracticeSession(){

        practiceSessionActive =
            false;

        practiceWelcomePlayed =
            false;

        currentPracticeActivityIndex =
            0;

        currentPracticeStepIndex =
            0;

        practiceData =
            [];

        simulationFrame =
            null;

    }



    // =====================================================
    // START PRACTICE SESSION
    // =====================================================

    async function startPracticeSession(frame){

        if(
            !frame
        ){

            return;

        }


        if(
            practiceSessionActive
        ){

            return;

        }


        if(
            !loadPracticeData()
        ){

            console.error(
                "BLOCK 7: Practice data unavailable."
            );

            return;

        }


        simulationFrame =
            frame;


        practiceSessionActive =
            true;


        currentPracticeActivityIndex =
            0;


        currentPracticeStepIndex =
            0;



        // -------------------------------------------------
        // WELCOME IS SPOKEN ONLY ONCE
        // -------------------------------------------------

        if(
            !practiceWelcomePlayed
        ){

            practiceWelcomePlayed =
                true;


            await speakRanise(
                PRACTICE_WELCOME_MESSAGE
            );

        }

    }



    // =====================================================
    // GUIDE ONE SPECIFIC PRACTICE STEP
    // =====================================================

    async function guidePracticeStep(
        activityIndex,
        stepIndex
    ){

        if(
            !practiceSessionActive
        ){

            return false;

        }


        if(
            !practiceData[
                activityIndex
            ]
        ){

            return false;

        }


        const activity =
            practiceData[
                activityIndex
            ];


        if(
            !Array.isArray(
                activity.steps
            )
        ){

            return false;

        }


        const step =
            activity.steps[
                stepIndex
            ];


        if(
            !step
        ){

            return false;

        }


        currentPracticeActivityIndex =
            activityIndex;


        currentPracticeStepIndex =
            stepIndex;


        return await speakRanise(

            "Étape " +
            (stepIndex + 1) +
            ". " +
            step

        );

    }



    // =====================================================
    // GUIDE NEXT PRACTICE STEP
    // =====================================================

    async function guideNextPracticeStep(){

        if(
            !practiceSessionActive
        ){

            return false;

        }


        const activity =
            practiceData[
                currentPracticeActivityIndex
            ];


        if(!activity){

            return false;

        }


        if(
            !Array.isArray(
                activity.steps
            )
        ){

            return false;

        }


        if(
            currentPracticeStepIndex >=
            activity.steps.length
        ){

            currentPracticeActivityIndex++;

            currentPracticeStepIndex = 0;

        }


        const nextActivity =
            practiceData[
                currentPracticeActivityIndex
            ];


        if(!nextActivity){

            return false;

        }


        const nextStep =
            nextActivity.steps[
                currentPracticeStepIndex
            ];


        if(!nextStep){

            return false;

        }


        const spoken =
            await speakRanise(

                "Étape " +
                (currentPracticeStepIndex + 1) +
                ". " +
                nextStep

            );


        if(
            spoken
        ){

            currentPracticeStepIndex++;

        }


        return spoken;

    }



    // =====================================================
    // PUBLIC ISOLATED ENGINE
    // =====================================================

    window.RaniseMoisePracticeSessionEngine = {

        start:
            startPracticeSession,

        speak:
            speakRanise,

        guideStep:
            guidePracticeStep,

        guideNext:
            guideNextPracticeStep,

        reset:
            resetPracticeSession,

        getState:

            function(){

                return {

                    active:
                        practiceSessionActive,

                    welcomePlayed:
                        practiceWelcomePlayed,

                    activityIndex:
                        currentPracticeActivityIndex,

                    stepIndex:
                        currentPracticeStepIndex

                };

            }

    };



    // =====================================================
    // DETECT THE EXISTING SIMULATION LAUNCH
    // CAPTURE PHASE ONLY
    // EXISTING LAUNCH CODE REMAINS UNTOUCHED
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


            // ---------------------------------------------
            // NEW SESSION
            // ---------------------------------------------

            resetPracticeSession();



            // ---------------------------------------------
            // WAIT FOR EXISTING SIMULATION TO APPEAR
            // ---------------------------------------------

            let attempts =
                0;


            const waitForSimulation =

                setInterval(

                    function(){

                        attempts++;


                        const campusContent =

                            document.getElementById(
                                "campusContent"
                            );


                        if(!campusContent){

                            if(
                                attempts >= 100
                            ){

                                clearInterval(
                                    waitForSimulation
                                );

                            }

                            return;

                        }



                        const frame =

                            campusContent.querySelector(

                                'iframe[src*="campusword2007simulation"]'

                            );


                        if(!frame){

                            if(
                                attempts >= 100
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



                        // ---------------------------------
                        // START BLOCK 7
                        // ---------------------------------

                        startPracticeSession(
                            frame
                        );


                    },

                    50

                );

        },

        true

    );



})();






























// =========================================================
// CAMPUS WORD 2007
// RANISE INTELLIGENT PRACTICE BRIDGE
// =========================================================
// ISOLATED CAMPUSNUMERIQUE ADD-ON
//
// PURPOSE:
// CONNECT RANISE PRACTICE ENGINES WITH THE EXISTING
// WORD SIMULATION IFRAME WITHOUT MODIFYING THE
// SIMULATION JAVASCRIPT.
//
// IMPORTANT:
// - DOES NOT MODIFY SIMULATION JS
// - DOES NOT REPLACE SIMULATION HTML
// - DOES NOT BLOCK CLICKS
// - DOES NOT BLOCK TOUCH
// - DOES NOT CREATE PRACTICE CONTENT
// - DOES NOT CONTROL MARYTTS
// - DOES NOT CONTROL AVATAR ANIMATION
// - WORKS DYNAMICALLY WITH THE EXISTING IFRAME
// - DESIGNED FOR BLOCK 8, BLOCK 9, BLOCK 10, ETC.
// =========================================================

(function(){

    "use strict";


    // =====================================================
    // PROTECTED GLOBAL NAMESPACE
    // =====================================================

    if(
        window.CampusWordPracticeBridge &&
        window.CampusWordPracticeBridge.__raniseBridge
    ){

        return;

    }


    // =====================================================
    // INTERNAL STATE
    // =====================================================

    let simulationFrame = null;

    let simulationDocument = null;

    let connected = false;

    let observer = null;

    let reconnectTimer = null;

    let actionWaiter = null;

    let lastInteractionSignature = "";

    let lastInteractionTime = 0;



    // =====================================================
    // SIMULATION SELECTOR
    // =====================================================

    const SIMULATION_SELECTOR =
        'iframe[src*="campusword2007simulation"]';



    // =====================================================
    // NORMALIZE TEXT
    // =====================================================

    function normalizeText(value){

        if(
            value === null ||
            value === undefined
        ){

            return "";

        }


        return String(value)

            .toLowerCase()

            .normalize("NFD")

            .replace(
                /[\u0300-\u036f]/g,
                ""
            )

            .replace(
                /\s+/g,
                " "
            )

            .trim();

    }



    // =====================================================
    // GET ELEMENT DESCRIPTION
    // READ-ONLY
    // =====================================================

    function getElementDescription(element){

        if(!element){

            return "";

        }


        const values = [

            element.innerText,

            element.textContent,

            element.getAttribute("aria-label"),

            element.getAttribute("title"),

            element.getAttribute("alt"),

            element.getAttribute("data-command"),

            element.getAttribute("data-action"),

            element.id,

            element.className

        ];


        for(
            const value of values
        ){

            if(
                value !== null &&
                value !== undefined &&
                String(value).trim()
            ){

                return String(value).trim();

            }

        }


        return "";

    }



    // =====================================================
    // GET CLICKABLE PARENT
    // READ-ONLY
    // =====================================================

    function getInteractiveElement(target){

        if(!target){

            return null;

        }


        if(
            typeof target.closest ===
            "function"
        ){

            const clickable =
                target.closest(

                    [
                        "button",
                        "a",
                        "input",
                        "select",
                        "textarea",
                        "label",
                        "[role='button']",
                        "[role='tab']",
                        "[onclick]",
                        "[data-action]",
                        "[data-command]"
                    ].join(",")

                );


            if(clickable){

                return clickable;

            }

        }


        return target;

    }



    // =====================================================
    // EXTRACT INTERACTION INFORMATION
    // =====================================================

    function buildInteraction(target, event){

        const element =
            getInteractiveElement(
                target
            );


        if(!element){

            return null;

        }


        const description =
            getElementDescription(
                element
            );


        const interaction = {

            element:
                element,

            tagName:
                element.tagName ||
                "",

            id:
                element.id ||
                "",

            className:
                typeof element.className ===
                "string"
                    ? element.className
                    : "",

            text:
                description,

            normalizedText:
                normalizeText(
                    description
                ),

            eventType:
                event?.type ||
                "",

            pointerType:
                event?.pointerType ||
                "",

            x:
                typeof event?.clientX ===
                "number"
                    ? event.clientX
                    : null,

            y:
                typeof event?.clientY ===
                "number"
                    ? event.clientY
                    : null,

            timestamp:
                Date.now()

        };


        return interaction;

    }



    // =====================================================
    // INTERACTION DUPLICATE PROTECTION
    // =====================================================

    function isDuplicateInteraction(interaction){

        if(!interaction){

            return true;

        }


        const signature =

            interaction.eventType +
            "|" +
            interaction.id +
            "|" +
            interaction.tagName +
            "|" +
            interaction.normalizedText;


        const now =
            Date.now();


        if(
            signature ===
                lastInteractionSignature &&

            now -
                lastInteractionTime <
                500
        ){

            return true;

        }


        lastInteractionSignature =
            signature;


        lastInteractionTime =
            now;


        return false;

    }



    // =====================================================
    // TARGET MATCHING
    // =====================================================
    // BLOCKS CAN GIVE THE BRIDGE SIMPLE WORDS SUCH AS:
    //
    // "Office"
    // "Ruban"
    // "Onglets"
    // "barre de titre"
    //
    // THE BRIDGE ONLY CHECKS WHAT IS ALREADY PRESENT
    // INSIDE THE SIMULATION.
    // =====================================================

    function interactionMatchesKeywords(
        interaction,
        keywords
    ){

        if(
            !interaction ||
            !Array.isArray(keywords) ||
            keywords.length === 0
        ){

            return false;

        }


        const targetText =
            normalizeText(

                [
                    interaction.text,
                    interaction.id,
                    interaction.className
                ].join(" ")

            );


        if(!targetText){

            return false;

        }


        const normalizedKeywords =

            keywords

                .filter(
                    keyword =>
                        keyword !== null &&
                        keyword !== undefined
                )

                .map(
                    keyword =>
                        normalizeText(keyword)
                )

                .filter(
                    keyword =>
                        keyword.length > 0
                );


        if(
            normalizedKeywords.length === 0
        ){

            return false;

        }


        for(
            const keyword
            of normalizedKeywords
        ){

            if(
                targetText.includes(
                    keyword
                )
            ){

                return true;

            }

        }


        return false;

    }



    // =====================================================
    // HANDLE SIMULATION INTERACTION
    // =====================================================

    function handleInteraction(event){

        if(!connected){

            return;

        }


        const interaction =
            buildInteraction(
                event.target,
                event
            );


        if(!interaction){

            return;

        }


        if(
            isDuplicateInteraction(
                interaction
            )
        ){

            return;

        }


        // ---------------------------------------------
        // IF A BLOCK IS CURRENTLY WAITING FOR AN ACTION
        // ---------------------------------------------

        if(
            actionWaiter &&
            typeof actionWaiter.resolve ===
            "function"
        ){

            const waiter =
                actionWaiter;


            if(
                interactionMatchesKeywords(
                    interaction,
                    waiter.keywords
                )
            ){

                actionWaiter = null;


                waiter.resolve({

                    success:
                        true,

                    interaction:
                        interaction

                });


                return;

            }

        }


        // ---------------------------------------------
        // GENERAL EVENT NOTIFICATION
        // ---------------------------------------------

        if(
            typeof window
                .RanisePracticeInteractionListener ===
            "function"
        ){

            try{

                window
                    .RanisePracticeInteractionListener(
                        interaction
                    );

            }catch(error){

                console.error(
                    "RANISE BRIDGE LISTENER ERROR:",
                    error
                );

            }

        }

    }



    // =====================================================
    // CONNECT EVENT LISTENERS
    // =====================================================

    function attachListeners(){

        if(
            !simulationDocument ||
            connected
        ){

            return false;

        }


        try{

            // -----------------------------------------
            // POINTER EVENTS
            // -----------------------------------------

            simulationDocument.addEventListener(
                "pointerup",
                handleInteraction,
                true
            );


            // -----------------------------------------
            // CLICK FALLBACK
            // -----------------------------------------

            simulationDocument.addEventListener(
                "click",
                handleInteraction,
                true
            );


            connected = true;


            return true;

        }catch(error){

            console.error(
                "RANISE BRIDGE: CONNECTION ERROR:",
                error
            );


            return false;

        }

    }



    // =====================================================
    // DISCONNECT EVENT LISTENERS
    // =====================================================

    function detachListeners(){

        if(
            !simulationDocument
        ){

            connected = false;

            return;

        }


        try{

            simulationDocument.removeEventListener(
                "pointerup",
                handleInteraction,
                true
            );


            simulationDocument.removeEventListener(
                "click",
                handleInteraction,
                true
            );

        }catch(error){}


        connected = false;

    }



    // =====================================================
    // CONNECT TO EXISTING SIMULATION
    // =====================================================

    function connect(){

        const campusContent =
            document.getElementById(
                "campusContent"
            );


        if(!campusContent){

            return false;

        }


        const frame =
            campusContent.querySelector(
                SIMULATION_SELECTOR
            );


        if(!frame){

            return false;

        }


        if(
            simulationFrame === frame &&
            connected
        ){

            return true;

        }


        detachListeners();


        simulationFrame =
            frame;


        try{

            const doc =
                frame.contentDocument ||
                frame.contentWindow.document;


            if(!doc){

                return false;

            }


            simulationDocument =
                doc;


            return attachListeners();

        }catch(error){

            console.error(
                "RANISE BRIDGE: impossible de lire la simulation:",
                error
            );


            simulationFrame = null;

            simulationDocument = null;

            connected = false;


            return false;

        }

    }



    // =====================================================
    // WAIT FOR SIMULATION
    // =====================================================

    function waitForConnection(){

        return new Promise(
            function(resolve){

                if(
                    connect()
                ){

                    resolve(true);

                    return;

                }


                let attempts = 0;


                const timer =
                    setInterval(
                        function(){

                            attempts++;


                            if(
                                connect()
                            ){

                                clearInterval(
                                    timer
                                );


                                resolve(true);

                                return;

                            }


                            if(
                                attempts >= 40
                            ){

                                clearInterval(
                                    timer
                                );


                                resolve(false);

                            }

                        },
                        250
                    );

            }
        );

    }



    // =====================================================
    // WAIT FOR A SPECIFIC STUDENT ACTION
    // =====================================================
    //
    // EXAMPLE:
    //
    // await Bridge.waitForAction([
    //     "Office"
    // ]);
    //
    // THE BRIDGE WAITS FOR THE STUDENT TO INTERACT
    // WITH AN ELEMENT WHOSE EXISTING TEXT / ID /
    // CLASS MATCHES ONE OF THE PROVIDED WORDS.
    // =====================================================

    function waitForAction(keywords){

        if(
            !Array.isArray(keywords)
        ){

            return Promise.resolve({

                success:
                    false

            });

        }


        cancelWaitingAction();


        return new Promise(
            function(resolve){

                actionWaiter = {

                    keywords:
                        keywords,

                    resolve:
                        resolve

                };

            }
        );

    }



    // =====================================================
    // CANCEL CURRENT ACTION WAIT
    // =====================================================

    function cancelWaitingAction(){

        if(
            !actionWaiter
        ){

            return;

        }


        const waiter =
            actionWaiter;


        actionWaiter = null;


        if(
            typeof waiter.resolve ===
            "function"
        ){

            waiter.resolve({

                success:
                    false,

                cancelled:
                    true

            });

        }

    }



    // =====================================================
    // OBSERVE CAMPUS CONTENT
    // =====================================================
    // THIS ONLY DETECTS WHEN THE EXISTING IFRAME
    // APPEARS OR IS REPLACED.
    // =====================================================

    function startCampusObserver(){

        const campusContent =
            document.getElementById(
                "campusContent"
            );


        if(
            !campusContent ||
            observer
        ){

            return;

        }


        observer =
            new MutationObserver(
                function(){

                    if(
                        reconnectTimer
                    ){

                        clearTimeout(
                            reconnectTimer
                        );

                    }


                    reconnectTimer =
                        setTimeout(
                            function(){

                                connect();

                            },
                            50
                        );

                }
            );


        observer.observe(
            campusContent,
            {

                childList:
                    true,

                subtree:
                    true

            }
        );

    }



    // =====================================================
    // PUBLIC BRIDGE
    // =====================================================

    window.CampusWordPracticeBridge = {

        __raniseBridge:
            true,


        connect:
            connect,


        waitForConnection:
            waitForConnection,


        waitForAction:
            waitForAction,


        cancelWaitingAction:
            cancelWaitingAction,


        isConnected:
            function(){

                return connected;

            },


        getSimulationFrame:
            function(){

                return simulationFrame;

            },


        getSimulationDocument:
            function(){

                return simulationDocument;

            },


        getElementDescription:
            getElementDescription,


        normalizeText:
            normalizeText,


        matchesKeywords:
            interactionMatchesKeywords,


        stop:
            function(){

                cancelWaitingAction();


                if(
                    observer
                ){

                    observer.disconnect();

                    observer = null;

                }


                if(
                    reconnectTimer
                ){

                    clearTimeout(
                        reconnectTimer
                    );

                    reconnectTimer = null;

                }


                detachListeners();


                simulationFrame = null;

                simulationDocument = null;

            }

    };



    // =====================================================
    // START AUTOMATIC CONNECTION
    // =====================================================

    function initialize(){

        startCampusObserver();

        connect();

    }


    if(
        document.readyState ===
        "loading"
    ){

        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            {
                once:
                    true
            }
        );

    }else{

        initialize();

    }


})();










































// =========================================================
// BLOCK 8
// MICROSOFT WORD 2007 FORMATION
// RANISE MOISE INTERACTIVE PRACTICE ENGINE
// =========================================================
// ISOLATED ADD-ON
// USES EXISTING CHAPTER 1 PRACTICE DATA
// WAITS FOR BLOCK 7 TO FINISH
// DOES NOT MODIFY BLOCK 6
// DOES NOT MODIFY BLOCK 7
// DOES NOT MODIFY MARYTTS
// DOES NOT CONTROL AVATAR ANIMATION
// DOES NOT CREATE NEW PRACTICE CONTENT
// PRACTICE IS EXECUTED ONE STEP AT A TIME
// RANISE SPEAKS FRENCH ONLY
// =========================================================

(function(){

    "use strict";


    // =====================================================
    // INTERNAL STATE
    // =====================================================

    let practiceStarted = false;

    let block7Finished = false;

    let currentStepIndex = 0;

    let currentActivityIndex = 0;

    let waitingForStudentAction = false;

    let studentActionBeingProcessed = false;

    let simulationFrame = null;

    let simulationDocument = null;

    let observer = null;

    let scanTimer = null;



    // =====================================================
    // RANISE SPEAK
    // =====================================================
    // BLOCK 8 DOES NOT CONTROL AVATAR ANIMATION.
    // THE EXISTING RANISE ANIMATION SYSTEM REMAINS ISOLATED.
    // =====================================================

    async function speak(text){

        if(
            !text ||
            typeof text !== "string" ||
            !text.trim()
        ){

            return false;

        }


        if(
            typeof speakProfessorIAWithMaryTTS !==
            "function"
        ){

            console.error(
                "BLOCK 8: MaryTTS indisponible."
            );

            return false;

        }


        try{

            await speakProfessorIAWithMaryTTS(
                text.trim()
            );

            return true;

        }catch(error){

            console.error(
                "BLOCK 8: erreur MaryTTS:",
                error
            );

            return false;

        }

    }



    // =====================================================
    // GET CHAPTER 1 PRACTICE DATA
    // =====================================================

    function getPracticeData(){

        if(
            typeof microsoftWordCourse ===
            "undefined"
        ){

            return null;

        }


        if(
            !Array.isArray(
                microsoftWordCourse.chapters
            )
        ){

            return null;

        }


        const chapter =
            microsoftWordCourse.chapters.find(
                item =>
                    item &&
                    item.id === "chapitre1"
            );


        if(!chapter){

            return null;

        }


        if(
            !Array.isArray(
                chapter.practice
            ) ||
            chapter.practice.length === 0
        ){

            return null;

        }


        return chapter.practice;

    }



    // =====================================================
    // GET CURRENT ACTIVITY
    // =====================================================

    function getCurrentActivity(){

        const practice =
            getPracticeData();


        if(!practice){

            return null;

        }


        return (
            practice[
                currentActivityIndex
            ] || null
        );

    }



    // =====================================================
    // GET CURRENT STEP
    // =====================================================

    function getCurrentStep(){

        const activity =
            getCurrentActivity();


        if(!activity){

            return null;

        }


        if(
            !Array.isArray(
                activity.steps
            )
        ){

            return null;

        }


        return (
            activity.steps[
                currentStepIndex
            ] || null
        );

    }



    // =====================================================
    // NORMALIZE TEXT
    // =====================================================

    function normalizeText(text){

        if(
            typeof text !== "string"
        ){

            return "";

        }


        return text
            .toLowerCase()
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .replace(
                /[«»"'`]/g,
                " "
            )
            .replace(
                /[^\p{L}\p{N}]+/gu,
                " "
            )
            .replace(
                /\s+/g,
                " "
            )
            .trim();

    }



    // =====================================================
    // EXTRACT TARGET WORDS
    // =====================================================

    function extractKeywords(step){

        const text =
            normalizeText(step);


        if(!text){

            return [];

        }


        const ignoredWords = new Set([

            "identifier",
            "identifiez",
            "identifie",
            "cliquez",
            "clique",
            "cliquer",
            "sur",
            "dans",
            "avec",
            "pour",
            "faire",
            "faites",
            "faire",
            "creer",
            "creez",
            "creer",
            "nouveau",
            "nouvelle",
            "les",
            "des",
            "une",
            "un",
            "le",
            "la",
            "de",
            "du",
            "et",
            "ou",
            "en",
            "a",
            "au",
            "aux",
            "l",
            "word",
            "microsoft",
            "2007"

        ]);


        const words =
            text
                .split(" ")
                .filter(
                    word =>
                        word.length >= 3 &&
                        !ignoredWords.has(word)
                );


        return [
            ...new Set(words)
        ];

    }



    // =====================================================
    // TARGET WORDS FOR CURRENT STEP
    // =====================================================

    function findTargetKeywords(step){

        return extractKeywords(step);

    }



    // =====================================================
    // GET ELEMENT TEXT
    // =====================================================

    function getElementText(element){

        if(!element){

            return "";

        }


        const parts = [

            element.innerText,

            element.textContent,

            element.getAttribute(
                "aria-label"
            ),

            element.getAttribute(
                "title"
            ),

            element.getAttribute(
                "alt"
            ),

            element.getAttribute(
                "data-tooltip"
            ),

            element.getAttribute(
                "data-title"
            )

        ];


        return normalizeText(
            parts
                .filter(
                    value =>
                        typeof value ===
                        "string" &&
                        value.trim()
                )
                .join(" ")
        );

    }



    // =====================================================
    // CHECK CURRENT STUDENT ACTION
    // =====================================================

    function actionMatchesStep(element){

        const step =
            getCurrentStep();


        if(!step || !element){

            return false;

        }


        const keywords =
            findTargetKeywords(
                step
            );


        if(
            keywords.length === 0
        ){

            return false;

        }


        const elementText =
            getElementText(
                element
            );


        if(!elementText){

            return false;

        }


        // ---------------------------------------------
        // TARGET ELEMENT MUST CONTAIN THE PRACTICE
        // TARGET WORD(S)
        // ---------------------------------------------

        for(
            const keyword of keywords
        ){

            if(
                elementText.includes(
                    keyword
                )
            ){

                return true;

            }

        }


        return false;

    }



    // =====================================================
    // FIND CLICKABLE ELEMENT
    // =====================================================

    function getClickableElement(target){

        if(!target){

            return null;

        }


        if(
            typeof target.closest !==
            "function"
        ){

            return target;

        }


        return (
            target.closest(
                "button, a, [role='button'], input, select, textarea, [onclick]"
            ) ||
            target
        );

    }



    // =====================================================
    // CORRECT ACTION
    // =====================================================

    async function handleCorrectAction(){

        if(
            !waitingForStudentAction ||
            studentActionBeingProcessed
        ){

            return;

        }


        studentActionBeingProcessed =
            true;


        waitingForStudentAction =
            false;


        const activity =
            getCurrentActivity();


        const step =
            getCurrentStep();


        if(
            !activity ||
            !step
        ){

            studentActionBeingProcessed =
                false;

            return;

        }


        // ---------------------------------------------
        // SUCCESS
        // ---------------------------------------------

        await speak(

            "Bravo ! Vous venez de réussir cette étape avec succès. Nous pouvons maintenant passer à l'étape suivante."

        );


        currentStepIndex++;


        // ---------------------------------------------
        // NEXT STEP IN SAME ACTIVITY
        // ---------------------------------------------

        if(
            Array.isArray(
                activity.steps
            ) &&
            currentStepIndex <
            activity.steps.length
        ){

            studentActionBeingProcessed =
                false;

            await startCurrentStep();

            return;

        }


        // ---------------------------------------------
        // CURRENT ACTIVITY FINISHED
        // ---------------------------------------------

        currentActivityIndex++;

        currentStepIndex = 0;


        const practice =
            getPracticeData();


        // ---------------------------------------------
        // NEXT PRACTICE ACTIVITY
        // ---------------------------------------------

        if(
            practice &&
            currentActivityIndex <
            practice.length
        ){

            await speak(

                "Excellent ! Cette partie pratique est terminée. Passons maintenant à l'activité suivante."

            );


            studentActionBeingProcessed =
                false;

            await startCurrentStep();

            return;

        }


        // ---------------------------------------------
        // ENTIRE PRACTICE SESSION FINISHED
        // ---------------------------------------------

        studentActionBeingProcessed =
            false;


        await finishPractice();

    }



    // =====================================================
    // INCORRECT ACTION
    // =====================================================

    async function handleIncorrectAction(){

        if(
            !waitingForStudentAction ||
            studentActionBeingProcessed
        ){

            return;

        }


        waitingForStudentAction =
            false;


        await speak(

            "Ce n'est pas l'action demandée. Reprenons cette étape. Cherchez l'élément indiqué dans l'instruction, puis effectuez l'action demandée."

        );


        // ---------------------------------------------
        // SAME STEP REMAINS ACTIVE
        // ---------------------------------------------

        waitingForStudentAction =
            true;

    }



    // =====================================================
    // SIMULATION CLICK LISTENER
    // =====================================================

    function handleSimulationClick(event){

        if(
            !waitingForStudentAction ||
            studentActionBeingProcessed
        ){

            return;

        }


        const target =
            event.target;


        if(!target){

            return;

        }


        const element =
            getClickableElement(
                target
            );


        if(
            actionMatchesStep(
                element
            )
        ){

            handleCorrectAction();

        }else{

            handleIncorrectAction();

        }

    }



    // =====================================================
    // CONNECT TO SIMULATION
    // =====================================================

    function connectToSimulation(){

        const campusContent =
            document.getElementById(
                "campusContent"
            );


        if(!campusContent){

            return false;

        }


        const frame =
            campusContent.querySelector(
                'iframe[src*="campusword2007simulation"]'
            );


        if(!frame){

            return false;

        }


        simulationFrame =
            frame;


        try{

            const doc =
                frame.contentDocument ||
                frame.contentWindow.document;


            if(!doc){

                return false;

            }


            simulationDocument =
                doc;


            if(
                !doc.__raniseBlock8Connected
            ){

                doc.addEventListener(
                    "click",
                    handleSimulationClick,
                    true
                );


                doc.__raniseBlock8Connected =
                    true;

            }


            return true;

        }catch(error){

            console.error(
                "BLOCK 8: impossible de connecter la simulation:",
                error
            );


            return false;

        }

    }



    // =====================================================
    // WAIT FOR SIMULATION
    // =====================================================

    function waitForSimulation(){

        if(
            connectToSimulation()
        ){

            if(scanTimer){

                clearInterval(
                    scanTimer
                );

                scanTimer = null;

            }


            return true;

        }


        return false;

    }



    // =====================================================
    // START CURRENT PRACTICE STEP
    // =====================================================

    async function startCurrentStep(){

        const activity =
            getCurrentActivity();


        const step =
            getCurrentStep();


        if(
            !activity ||
            !step
        ){

            return;

        }


        waitingForStudentAction =
            false;


        // ---------------------------------------------
        // ACTIVITY INTRODUCTION
        // ONLY ON FIRST STEP OF ACTIVITY
        // ---------------------------------------------

        if(
            currentStepIndex === 0 &&
            activity.title
        ){

            await speak(

                "Nous allons maintenant pratiquer : " +
                activity.title

            );

        }


        // ---------------------------------------------
        // CURRENT PRACTICE INSTRUCTION
        // ---------------------------------------------

        await speak(

            "Étape " +
            (currentStepIndex + 1) +
            ". " +
            step +
            " Prenez votre temps et effectuez cette action dans la simulation."

        );


        // ---------------------------------------------
        // ONLY NOW WAIT FOR STUDENT ACTION
        // ---------------------------------------------

        waitingForStudentAction =
            true;

    }



    // =====================================================
    // START PRACTICE
    // =====================================================

    async function start(){

        // ---------------------------------------------
        // NEVER START TWICE
        // ---------------------------------------------

        if(practiceStarted){

            return;

        }


        // ---------------------------------------------
        // BLOCK 8 MUST WAIT FOR BLOCK 7
        // ---------------------------------------------

        if(!block7Finished){

            return;

        }


        const practice =
            getPracticeData();


        if(!practice){

            console.error(
                "BLOCK 8: aucune donnée pratique disponible."
            );

            return;

        }


        practiceStarted =
            true;


        currentActivityIndex =
            0;


        currentStepIndex =
            0;


        waitingForStudentAction =
            false;


        // ---------------------------------------------
        // WAIT FOR EXISTING SIMULATION
        // ---------------------------------------------

        if(
            !waitForSimulation()
        ){

            scanTimer =
                setInterval(
                    function(){

                        if(
                            waitForSimulation()
                        ){

                            clearInterval(
                                scanTimer
                            );

                            scanTimer =
                                null;


                            startCurrentStep();

                        }

                    },
                    300
                );

        }else{

            await startCurrentStep();

        }

    }



    // =====================================================
    // FINISH ENTIRE PRACTICE SESSION
    // =====================================================

    async function finishPractice(){

        waitingForStudentAction =
            false;


        await speak(

            "Félicitations ! Vous avez terminé avec succès toutes les étapes pratiques de cette séance. Excellent travail !"

        );


        practiceStarted =
            false;

    }



    // =====================================================
    // BLOCK 7 → BLOCK 8 HANDSHAKE
    // =====================================================
    // BLOCK 8 DOES NOT GUESS WHEN BLOCK 7 FINISHES.
    // IT WAITS FOR THE REAL FINISH SIGNAL.
    // =====================================================

    function receiveBlock7Finished(){

        if(block7Finished){

            return;

        }


        block7Finished =
            true;


        start();

    }


    window.addEventListener(
        "ranise:block7:finished",
        receiveBlock7Finished
    );



    // =====================================================
    // PUBLIC ISOLATED ENGINE
    // =====================================================

    window.RaniseMoiseInteractivePracticeEngine = {

        start: start,


        notifyBlock7Finished:
            receiveBlock7Finished,


        stop: function(){

            waitingForStudentAction =
                false;


            practiceStarted =
                false;


            studentActionBeingProcessed =
                false;


            if(scanTimer){

                clearInterval(
                    scanTimer
                );

                scanTimer =
                    null;

            }

        }

    };



    // =====================================================
    // OBSERVE CAMPUS CONTENT
    // =====================================================
    // THIS ONLY PREPARES THE SIMULATION CONNECTION.
    // IT DOES NOT START PRACTICE.
    // BLOCK 7 FINISH SIGNAL IS STILL REQUIRED.
    // =====================================================

    const campusContent =
        document.getElementById(
            "campusContent"
        );


    if(campusContent){

        observer =
            new MutationObserver(
                function(){

                    if(
                        practiceStarted
                    ){

                        return;

                    }


                    const frame =
                        campusContent.querySelector(
                            'iframe[src*="campusword2007simulation"]'
                        );


                    if(frame){

                        simulationFrame =
                            frame;

                        connectToSimulation();

                    }

                }
            );


        observer.observe(
            campusContent,
            {

                childList: true,

                subtree: true

            }
        );

    }



})();














// =========================================================
// RANISE DYNAMIC PRACTICE BRIDGE
// MICROSOFT WORD 2007 SIMULATION
// =========================================================
// CENTRAL BRIDGE FOR RANISE PRACTICE AUDIO
//
// PURPOSE:
// CONNECT BLOCK 7 → BLOCK 8 → BLOCK 9 → BLOCK 10...
//
// IMPORTANT:
// - DOES NOT REPLACE BLOCK 7
// - DOES NOT REPLACE BLOCK 8
// - DOES NOT MODIFY MARYTTS
// - DOES NOT MODIFY AVATAR ANIMATION
// - DOES NOT CREATE PRACTICE CONTENT
// - DOES NOT MODIFY MICROSOFT WORD COURSE DATA
// - DOES NOT MODIFY THE SIMULATION IFRAME
// - FRENCH AUDIO REMAINS CONTROLLED BY EXISTING SYSTEM
// =========================================================

(function(){

    "use strict";


    // =====================================================
    // PRIVATE BRIDGE STATE
    // =====================================================

    let bridgeStarted = false;

    let currentBlock = null;

    let audioRunning = false;

    let firstPracticeAudioFinished = false;

    let originalMaryTTS = null;

    let maryTTSWrapped = false;


    // =====================================================
    // BLOCK REGISTRY
    // =====================================================

    const registeredBlocks = new Map();


    // =====================================================
    // SIMULATION DETECTION
    // =====================================================

    function simulationIsOpen(){

        const campusContent =
            document.getElementById(
                "campusContent"
            );


        if(!campusContent){

            return false;

        }


        return !!campusContent.querySelector(
            'iframe[src*="campusword2007simulation"]'
        );

    }



    // =====================================================
    // BRIDGE EVENT DISPATCHER
    // =====================================================

    function emit(eventName, detail){

        try{

            document.dispatchEvent(

                new CustomEvent(
                    eventName,
                    {
                        detail:
                            detail || {}
                    }
                )

            );

        }catch(error){

            console.error(
                "RANISE BRIDGE EVENT ERROR:",
                error
            );

        }

    }



    // =====================================================
    // REGISTER A FUTURE PRACTICE BLOCK
    // =====================================================

    function registerBlock(
        blockId,
        startFunction
    ){

        if(
            !blockId ||
            typeof startFunction !== "function"
        ){

            return false;

        }


        registeredBlocks.set(
            blockId,
            startFunction
        );


        return true;

    }



    // =====================================================
    // START REGISTERED BLOCK
    // =====================================================

    async function startBlock(blockId){

        const block =
            registeredBlocks.get(
                blockId
            );


        if(
            typeof block !== "function"
        ){

            return false;

        }


        currentBlock =
            blockId;


        emit(
            "ranise:practice:block-start",
            {
                block:
                    blockId
            }
        );


        try{

            await block();

            return true;

        }catch(error){

            console.error(
                "RANISE BRIDGE BLOCK ERROR:",
                blockId,
                error
            );

            return false;

        }

    }



    // =====================================================
    // COMPLETE CURRENT BLOCK
    // =====================================================

    function completeBlock(blockId){

        if(!blockId){

            return;

        }


        emit(
            "ranise:practice:block-complete",
            {
                block:
                    blockId
            }
        );


        currentBlock =
            null;

    }



    // =====================================================
    // MARYTTS AUDIO MONITOR
    // =====================================================
    // THIS DOES NOT REPLACE MARYTTS.
    // IT ONLY OBSERVES THE EXISTING FUNCTION.
    // =====================================================

    function installMaryTTSBridge(){

        if(maryTTSWrapped){

            return;

        }


        if(
            typeof window.speakProfessorIAWithMaryTTS !==
            "function"
        ){

            return;

        }


        originalMaryTTS =
            window.speakProfessorIAWithMaryTTS;


        window.speakProfessorIAWithMaryTTS =
            async function(text){

                if(
                    text &&
                    typeof text === "string" &&
                    text.trim()
                ){

                    audioRunning = true;


                    emit(
                        "ranise:practice:audio-start",
                        {
                            text:
                                text.trim()
                        }
                    );

                }


                try{

                    return await originalMaryTTS.apply(
                        this,
                        arguments
                    );

                }finally{

                    audioRunning = false;


                    emit(
                        "ranise:practice:audio-end",
                        {
                            text:
                                text || ""
                        }
                    );


                    handleAudioFinished(
                        text
                    );

                }

            };


        maryTTSWrapped =
            true;

    }



    // =====================================================
    // FIRST PRACTICE AUDIO FINISHED
    // =====================================================

    function handleAudioFinished(text){

        if(!simulationIsOpen()){

            return;

        }


        emit(
            "ranise:practice:audio-finished",
            {
                text:
                    text || ""
            }
        );


        // ---------------------------------------------
        // BLOCK 7 → BLOCK 8
        // ---------------------------------------------

        if(
            !firstPracticeAudioFinished &&
            !currentBlock
        ){

            firstPracticeAudioFinished =
                true;


            emit(
                "ranise:practice:block7-finished",
                {
                    reason:
                        "Ranise welcome audio finished"
                }
            );


            startInteractivePracticeBlock();

        }

    }



    // =====================================================
    // START BLOCK 8
    // =====================================================

    async function startInteractivePracticeBlock(){

        if(!simulationIsOpen()){

            return;

        }


        // ---------------------------------------------
        // IF BLOCK 8 ALREADY STARTED,
        // DO NOT START IT AGAIN.
        // ---------------------------------------------

        if(
            window.RaniseMoiseInteractivePracticeEngine &&
            typeof
            window.RaniseMoiseInteractivePracticeEngine.start ===
            "function"
        ){

            currentBlock =
                "block8";


            emit(
                "ranise:practice:block8-ready",
                {}
            );


            try{

                await
                window.RaniseMoiseInteractivePracticeEngine
                    .start();

            }catch(error){

                console.error(
                    "RANISE BRIDGE: BLOCK 8 ERROR:",
                    error
                );

            }

        }

    }



    // =====================================================
    // PUBLIC BRIDGE API
    // =====================================================

    window.RanisePracticeBridge = {

        start:function(){

            if(bridgeStarted){

                return;

            }


            bridgeStarted =
                true;


            installMaryTTSBridge();


            emit(
                "ranise:practice:bridge-ready",
                {}
            );

        },


        registerBlock:
            registerBlock,


        startBlock:
            startBlock,


        completeBlock:
            completeBlock,


        isSimulationOpen:
            simulationIsOpen,


        isAudioRunning:function(){

            return audioRunning;

        },


        getCurrentBlock:function(){

            return currentBlock;

        },


        reset:function(){

            firstPracticeAudioFinished =
                false;

            currentBlock =
                null;

            audioRunning =
                false;

        }

    };



    // =====================================================
    // SIMULATION OBSERVER
    // =====================================================
    // THE BRIDGE BECOMES ACTIVE WHEN THE EXISTING
    // WORD SIMULATION APPEARS.
    // =====================================================

    function watchSimulation(){

        const campusContent =
            document.getElementById(
                "campusContent"
            );


        if(!campusContent){

            return;

        }


        const observer =
            new MutationObserver(

                function(){

                    if(
                        simulationIsOpen()
                    ){

                        installMaryTTSBridge();


                        emit(
                            "ranise:practice:simulation-open",
                            {}
                        );

                    }

                }

            );


        observer.observe(
            campusContent,
            {
                childList:true,
                subtree:true
            }

        );


        if(
            simulationIsOpen()
        ){

            installMaryTTSBridge();

        }

    }



    // =====================================================
    // AUTOMATIC INITIALIZATION
    // =====================================================

    function initializeBridge(){

        installMaryTTSBridge();

        watchSimulation();

        emit(
            "ranise:practice:bridge-initialized",
            {}
        );

    }



    // =====================================================
    // DOM READY
    // =====================================================

    if(
        document.readyState ===
        "loading"
    ){

        document.addEventListener(
            "DOMContentLoaded",
            initializeBridge,
            {
                once:true
            }
        );

    }else{

        initializeBridge();

    }



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
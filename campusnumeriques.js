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





   

// =====================================
// CHAPITRE 2
// MAITRISE DE L'ONGLET HOME (ACCUEIL)
// MICROSOFT WORD 2007
// =====================================

{

    id:"chapitre2",

    title:
    "Chapitre 2 - Maîtrise de l’onglet Home (Accueil) de Microsoft Word 2007",



    theory:[

        {

            title:
            "Présentation générale de l’onglet Home (Accueil) de Microsoft Word 2007",

            content:
            "L’onglet Home (Accueil) regroupe les principales commandes utilisées pour créer, modifier et mettre en forme un document professionnel. Il contient plusieurs groupes essentiels : Presse-papiers (Clipboard), Police (Font), Paragraphe (Paragraph), Style et Modification (Editing)."

        },


        {

            title:
            "Rôle de l’onglet Home (Accueil)",

            content:
            "L’onglet Home (Accueil) permet à l’utilisateur d’effectuer les opérations courantes de traitement de texte comme copier, couper, coller, modifier la police, organiser les paragraphes et rechercher du contenu."

        }

    ],



    practice:[

        {

            title:
            "Pratique : Découvrir les groupes de commandes de l’onglet Home (Accueil)",


            steps:[

                "Ouvrir Microsoft Word Simulator.",

                "Identifier l’onglet Home (Accueil).",

                "Identifier le groupe Presse-papiers (Clipboard).",

                "Identifier le groupe Police (Font).",

                "Identifier le groupe Paragraphe (Paragraph).",

                "Identifier le groupe Style.",

                "Identifier le groupe Modification (Editing)."

            ]

        }

    ],



    exercises:[

        "Identifier les différents groupes de commandes de l’onglet Home (Accueil).",

        "Expliquer le rôle des commandes principales de mise en forme.",

        "Réaliser une première manipulation avec les outils Home."

    ],



    homework:

    "Créer un document professionnel en utilisant plusieurs commandes de l’onglet Home (Accueil).",



    evaluation:[

        "Identifier les groupes de commandes de l’onglet Home.",

        "Utiliser correctement les fonctions principales de mise en forme.",

        "Réaliser une production professionnelle dans Microsoft Word Simulator."

    ],



    objective:[

        "Comprendre l’organisation de l’onglet Home (Accueil).",

        "Maîtriser progressivement les commandes essentielles.",

        "Utiliser les outils Home dans un contexte professionnel."

    ],



    aiContext:{

        role:
        "Professeur IA CampusNumérique FOBAS",


        mission:
        "Accompagner l’étudiant dans l’apprentissage progressif de l’onglet Home (Accueil) de Microsoft Word 2007.",


        teachingMethod:[

            "Expliquer les notions avec des exemples professionnels.",

            "Guider l’étudiant pendant les manipulations dans le Simulator.",

            "Identifier les erreurs fréquentes.",

            "Adapter les explications selon le niveau de l’étudiant.",

            "Valider les compétences avant le passage à l’évaluation."

        ],


        supportedLanguages:[

            "Français",

            "English",

            "Español",

            "Kreyòl"

        ]

    },



    groups:[


        {

            id:
            "clipboard",


            title:
            "Groupe Presse-papiers (Clipboard)",


            buttons:[

                {

                    id:
                    "paste",


                    title:
                    "Paste (Coller)",


                    theory:{

                        definition:
                        "Le bouton Paste (Coller) permet d’insérer dans un document un élément précédemment placé dans le Presse-papiers (Clipboard).",


                        role:
                        "Il permet de récupérer un contenu copié ou coupé afin de le placer à un nouvel emplacement dans le document.",


                        functionality:
                        "L’utilisateur utilise d’abord Copy (Copier) ou Cut (Couper), puis utilise Paste (Coller) pour insérer le contenu.",


                        whenToUse:
                        "Utiliser Paste (Coller) lorsqu’un élément doit être réutilisé ou déplacé dans un document.",


                        professionalExample:
                        "Un assistant administratif peut réutiliser rapidement une partie d’un rapport existant dans un nouveau document."

                    },


                    practice:{

                        instructions:[

                            "Créer un nouveau document Word.",

                            "Écrire un paragraphe de plusieurs lignes.",

                            "Sélectionner une partie du texte.",

                            "Utiliser Copy (Copier).",

                            "Placer le curseur à un nouvel emplacement.",

                            "Cliquer sur Paste (Coller)."

                        ],


                        expectedResult:
                        "Le texte sélectionné apparaît dans le nouvel emplacement du document."

                    },


                    exercise:{

                        task:
                        "Créer un paragraphe de cinq lignes puis reproduire une partie du texte avec Copy (Copier) et Paste (Coller)."

                    },


                    homework:{

                        task:
                        "Créer un document professionnel contenant un titre et deux paragraphes utilisant les fonctions du Presse-papiers."

                    },


                    aiContext:{

                        learningGoal:
                        "Comprendre le fonctionnement du Presse-papiers (Clipboard).",


                        commonErrors:[

                            "L’étudiant utilise Paste (Coller) sans avoir copié un élément.",

                            "L’étudiant confond Copy (Copier) et Cut (Couper)."

                        ],


                        aiAction:
                        "Expliquer l’erreur et guider l’étudiant étape par étape."

                    },


                    validation:{

                        skills:[

                            "Comprendre le rôle de Paste (Coller).",

                            "Réaliser une opération de collage.",

                            "Utiliser correctement le Presse-papiers."

                        ]

                    }

                }

            ]

        },










// =====================================
// GROUPE POLICE (FONT)
// =====================================

{

    id:
    "font",


    title:
    "Groupe Police (Font)",


    buttons:[


        {

            id:
            "font-family",


            title:
            "Font (Police)",


            theory:{

                definition:
                "Le bouton Font (Police) permet de choisir le type de caractères utilisé dans un document Microsoft Word 2007.",


                role:
                "Il permet de modifier l’apparence du texte afin d’obtenir une présentation adaptée au contexte professionnel.",


                functionality:
                "L’utilisateur sélectionne un texte puis choisit une police disponible dans la liste Font (Police).",


                whenToUse:
                "Utiliser Font (Police) lorsqu’il est nécessaire de changer le style visuel d’un texte.",


                professionalExample:
                "Un professionnel peut utiliser une police claire et adaptée pour créer un rapport, une lettre ou un document administratif."

            },


            practice:{

                instructions:[

                    "Créer un nouveau document Word.",

                    "Écrire un titre et un paragraphe.",

                    "Sélectionner le texte à modifier.",

                    "Ouvrir la liste Font (Police).",

                    "Choisir une nouvelle police."

                ],


                expectedResult:
                "Le texte sélectionné apparaît avec la nouvelle police choisie."

            },


            exercise:{

                task:
                "Créer un document contenant un titre et un paragraphe puis appliquer différentes polices pour comparer les résultats."

            },


            homework:{

                task:
                "Créer un document professionnel en utilisant une police adaptée au type de document réalisé."

            },


            aiContext:{

                learningGoal:
                "Comprendre le rôle des polices dans la mise en forme professionnelle.",


                commonErrors:[

                    "L’étudiant change la police sans sélectionner le texte.",

                    "L’étudiant utilise une police difficile à lire dans un document professionnel."

                ],


                aiAction:
                "Expliquer le choix des polices et guider l’étudiant vers une présentation professionnelle."

            },


            validation:{

                skills:[

                    "Comprendre le rôle de Font (Police).",

                    "Modifier la police d’un texte.",

                    "Choisir une police adaptée au contexte professionnel."

                ]

            }

        }

    ]

},









// =====================================
// BOUTON TAILLE DE POLICE (FONT SIZE)
// =====================================

{

    id:
    "font-size",


    title:
    "Font Size (Taille de police)",


    theory:{

        definition:
        "Le bouton Font Size (Taille de police) permet de modifier la grandeur des caractères dans un document Microsoft Word 2007.",


        role:
        "Il permet d’adapter la taille du texte selon son importance et sa présentation professionnelle.",


        functionality:
        "L’utilisateur sélectionne un texte puis choisit une valeur de taille dans la liste Font Size (Taille de police).",


        whenToUse:
        "Utiliser Font Size (Taille de police) pour créer une hiérarchie visuelle entre les titres, sous-titres et paragraphes.",


        professionalExample:
        "Un rapport professionnel utilise généralement une taille plus grande pour les titres et une taille standard pour le contenu."

    },


    practice:{

        instructions:[

            "Créer un document Word.",

            "Écrire un titre et un paragraphe.",

            "Sélectionner le titre.",

            "Modifier la taille avec Font Size (Taille de police).",

            "Comparer le résultat avec le texte normal."

        ],


        expectedResult:
        "Le texte sélectionné change de taille selon la valeur choisie."

    },


    exercise:{

        task:
        "Créer un document avec un titre, un sous-titre et un paragraphe puis appliquer différentes tailles de police."

    },


    homework:{

        task:
        "Créer une page professionnelle en utilisant plusieurs tailles de caractères pour organiser les informations."

    },


    aiContext:{

        learningGoal:
        "Comprendre l’utilisation professionnelle des tailles de texte.",


        commonErrors:[

            "L’étudiant modifie la taille sans sélectionner le texte.",

            "L’étudiant utilise des tailles excessives qui rendent le document difficile à lire."

        ],


        aiAction:
        "Expliquer comment choisir une taille adaptée selon le rôle du texte."

    },


    validation:{

        skills:[

            "Comprendre le rôle de Font Size (Taille de police).",

            "Modifier la taille d’un texte.",

            "Créer une présentation lisible."

        ]

    }

}



    ]

};



















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





    let chaptersHTML = "";




    microsoftWordCourse.chapters.forEach(

        chapter => {



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







            chaptersHTML += `


                <section class="microsoft-word-chapter">


                    <h2>

                        ${chapter.title}

                    </h2>





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





                </section>


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
        ai.innerHTML =
            "<h3>Professeur IA</h3>";

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

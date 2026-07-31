🎡 Lucky Wheel Management

Application web de tirage au sort et de roue de la fortune pour les animations marketing et les campagnes promotionnelles — développée dans le cadre d'un stage (juillet 2026).

📋 Contexte

L'application permet d'importer une liste de participants (Excel/CSV), de lancer un tirage au sort via une roue de la fortune animée, de désigner automatiquement un gagnant unique et de conserver l'historique complet des gains.

✨ Fonctionnalités


 Import des participants (fichier .xlsx / .csv) avec détection des doublons
 Tirage au sort totalement aléatoire (un participant ne peut gagner qu'une seule fois)
 Roue de la fortune animée affichant les cadeaux disponibles
 Gestion des cadeaux (ajout, modification, activation/désactivation, quantités)
 Historique des gagnants (recherche, filtre par date, export Excel)
 Tableau de bord (statistiques en temps réel)
 Bonus : authentification admin, confettis, animation sonore, mode plein écran


🛠️ Stack technique

CoucheTechnologieFront-endAngular 22Back-endLaravel (API REST)Base de donnéesMySQLOutilsLaragon, Postman, Git

📁 Structure du projet

lucky-wheel-management/
├── backend/            # API Laravel
├── frontend/           # Application Angular
├── docs/
│   ├── journal/        # Journal de bord quotidien
│   ├── rapport/        # Rapport de stage
│   ├── demo-data/      # Jeux de données fictifs pour les tests
│   └── uml/            # Diagrammes (cas d'utilisation,classes,Architecture)
│   └── manuel-utilisateur    #manuel-utilisateur
├── .gitignore
└── README.md

🚀 Installation & lancement


Cette section sera complétée au fil du développement.



Back-end (API Laravel)

bashcd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve        # → http://localhost:8000

Front-end (Angular)

bashcd frontend
npm install
ng serve                 # → http://localhost:4200

⚠️ Données personnelles

Aucune liste réelle de participants (noms, numéros de téléphone) ne doit être versionnée dans ce dépôt. Seuls des jeux de données fictifs sont utilisés pour le développement et les démonstrations (docs/demo-data/).

👤 Auteur

Trifi Yakine— Stagiaire chez AZIZA
Encadrant : Wael Gazzahi
Période : Juillet 2026
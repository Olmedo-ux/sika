SikaGreen - Plateforme d'Économie Circulaire



SikaGreen est une application web (PWA) qui connecte les citoyens, les collecteurs et les recycleurs à Lomé pour optimiser la gestion des déchets.



Fonctionnalités Clés

\- Citoyens : Demande de collecte, suivi des gains (Wallet), carte des points de recyclage.

\- Collecteurs : Optimisation des tournées, achat de matières.

\- Recycleurs : Sourcing de matières premières, marketplace B2B.

\- Transverse : Messagerie temps réel, Géolocalisation, Authentification sécurisée (Sanctum).



 🛠️ Stack Technique

\- Frontend : React 18, TypeScript, Tailwind CSS, Shadcn/UI, Vite.

\- Backend : Laravel 11, PHP 8.2, MySQL/SQLite.

\- Tests : Vitest (Front), PHPUnit (Back).



 📦 Installation

1\. Backend :

   ```bash

   cd backend

   composer install

   cp .env.example .env

   php artisan key:generate

   php artisan migrate --seed

   php artisan serve



2\. Frontend :

&nbsp;  ```Bash

&nbsp;  cd frontend

&nbsp;  npm install

&nbsp;  npm run dev



&nbsp;🧪 Tests

Le projet est couvert par une suite de tests automatisés.



Backend : php artisan test (100% Pass)



Frontend : npm run test (100% Pass)


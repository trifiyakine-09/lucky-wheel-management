# 🎡 Lucky Wheel Management

Application web full-stack de tirage au sort promotionnel, développée dans le cadre d'un stage chez **Aziza** (juillet 2026).

L'application permet d'importer une liste de participants, de lancer un tirage au sort via une roue de la fortune animée, de désigner un gagnant unique et de conserver l'historique complet des gains et des actions réalisées.

---

## 🛠️ Stack technique

| Couche | Technologie |
|---|---|
| Front-end | Angular 22 (TypeScript, SCSS) |
| Back-end | Laravel — API REST |
| Authentification | Laravel Sanctum + OTP par e-mail |
| Base de données | MySQL |
| Outils | Laragon, Postman, Git |

---

## ✨ Fonctionnalités

### Gestion des participants
- Import de fichiers `.xlsx` / `.csv` avec détection des doublons
- Volume supporté : jeux de données de plus de 80 000 participants

### Tirage au sort
- Roue de la fortune animée affichant les cadeaux disponibles
- Tirage exécuté **côté serveur**, garantie d'unicité du gagnant (voir ci-dessous)
- Mode plein écran, confettis et animation sonore pour les événements

### Gestion des cadeaux
- Ajout, modification, activation / désactivation
- Suivi des quantités en stock

### Historique et pilotage
- Historique des gagnants : recherche, filtre par date, export Excel
- Tableau de bord avec statistiques en temps réel
- Journal d'audit de l'ensemble des actions

---

## 🔐 Sécurité

### Authentification par OTP

L'accès administrateur est protégé par une **authentification à usage unique par e-mail (OTP)**, mise en place à la demande d'Aziza plutôt qu'un simple couple identifiant / mot de passe.

La chaîne complète :

| Côté | Mise en œuvre |
|---|---|
| API | `OtpService` pour la génération et la validation du code, jetons Laravel Sanctum |
| Angular | `auth.guard.ts` (protection des routes) et `auth.interceptor.ts` (injection du jeton sur chaque requête) |

### Journal d'audit

Toutes les actions sensibles sont enregistrées (`ActionLog`) : tirages, imports de participants, modifications de cadeaux.

L'objectif est la **traçabilité** — conserver une trace vérifiable de qui a fait quoi et quand, ce qui est essentiel sur une opération promotionnelle où des lots réels sont attribués.

### Protection des données personnelles

Aucune liste réelle de participants n'est versionnée dans ce dépôt. Les jeux de données présents dans `docs/demo-data/` sont **entièrement synthétiques**, générés pour les tests et les démonstrations.

---

## 🎯 Garantie d'unicité du gagnant

Le tirage est exécuté côté serveur, sur l'endpoint `POST /api/tirages`. Un participant ne peut gagner qu'une seule fois, et cette règle est garantie à **trois niveaux** :

**1. Au niveau applicatif** — la sélection ne porte que sur les participants n'ayant encore rien gagné :

```php
$participant = Participant::whereDoesntHave('gagnant')
    ->inRandomOrder()
    ->first();
```

**2. Au niveau base de données** — une contrainte `UNIQUE` sur `participant_id` dans la table `gagnants` rend un double gain impossible, même en cas de requêtes concurrentes.

**3. Au niveau transactionnel** — l'attribution du lot et la décrémentation du stock s'exécutent dans une même transaction, ce qui garantit la cohérence entre l'historique et l'état des cadeaux.

---

## 🏗️ Architecture

Le front-end Angular est organisé **par features**, chacune disposant de son propre service :

```
frontend/src/app/
├── core/
│   ├── guards/          # auth.guard.ts
│   ├── interceptors/    # auth.interceptor.ts
│   └── services/        # auth.service.ts
├── features/
│   ├── roue/            # roue de la fortune + service sonore
│   ├── participants/    # import et gestion
│   ├── cadeaux/         # gestion des lots
│   ├── historique/      # gagnants, filtres, export
│   ├── dashboard/       # statistiques
│   ├── journal/         # journal d'audit
│   └── login/           # authentification OTP
└── layout/shell/
```

Côté Laravel : contrôleurs dédiés (`ParticipantController`, `CadeauController`, `GagnantController`, `DashboardController`, `ActionLogController`, `AuthController`), modèles Eloquent et migrations incrémentales datées.

---

## 📁 Structure du projet

```
lucky-wheel-management/
├── backend/              # API Laravel
├── frontend/             # Application Angular
├── docs/
│   ├── journal/          # Journal de bord quotidien du stage
│   ├── rapport/          # Rapport de stage
│   ├── demo-data/        # Jeux de données synthétiques
│   ├── uml/              # Diagrammes (cas d'utilisation, classes, architecture)
│   └── manuel-utilisateur-lucky-wheel.docx
├── .gitignore
└── README.md
```

---

## 🚀 Installation

**Prérequis :** PHP 8.2+, Composer, Node.js 20+, MySQL

### Back-end (API Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve          # → http://localhost:8000
```

### Front-end (Angular)

```bash
cd frontend
npm install
ng serve                   # → http://localhost:4200
```

---

## 📐 Documentation

Le dossier `docs/` contient les diagrammes UML (cas d'utilisation, classes, architecture), le manuel utilisateur et le journal de bord tenu quotidiennement pendant le stage.

---

## 👤 Auteur

**Trifi Yakine** — Stagiaire chez Aziza
Encadrant : Wael Gazzahi
Période : juillet 2026
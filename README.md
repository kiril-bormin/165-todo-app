# 📝 todo-app - Application de Gestion de Tâches

Une application complète de gestion de tâches moderne utilisant une architecture full-stack avec **MongoDB**, **Redis**, **Node.js/Express** et **Vue3**.

**Projet pédagogique** : Migration d'une base de données MySQL vers MongoDB avec optimisation par cache Redis.

---

## Description

**todo-app** est une application web permettant aux utilisateurs de :

- Créer, modifier et supprimer des tâches
- Gérer les tâches par date
- Rechercher parmi les tâches (recherche full-text MongoDB)
- Gérer leur profil utilisateur
- Basculer entre thème clair et sombre
- Authentification sécurisée avec JWT

---

## Technologies

### Frontend

- **Vue 3** - Framework JavaScript réactif
- **TypeScript** - Typage statique pour la robustesse
- **Tailwind CSS** - Framework CSS utilitaire
- **Vitest** - Framework de test
- **Cypress** - Tests E2E

### Backend

- **Node.js 20+** - Runtime JavaScript serveur
- **Express.js** - Framework web léger
- **MongoDB** - Base de données NoSQL documentaire
- **Redis** - Cache applicatif en mémoire
- **JWT** - Authentification sans état

### Infrastructure

- **Docker** - Conteneurisation
- **MongoDB 8.0.6** - Base de données
- **Redis Stack 7.2** - Cache et monitoring

---

## Installation Locale

### Prérequis

- **Docker** et **Docker Compose** (ou Node.js 20+, npm, MongoDB et Redis localement)

### 1. Cloner le Repository

```bash
git clone https://github.com/kiril-bormin/165-todo-app.git
```

### 2. Configurer les Variables d'Environnement

Copier `.env.example` en `.env` :

```bash
cp .env.example .env
```

Le fichier `.env` contient :

```env
# MongoDB
MONGO_ROOT_USERNAME=admin_user
MONGO_ROOT_PASSWORD=admin_pwd
MONGO_APP_PASSWORD=app_backend_secure_password
MONGO_ADMIN_PASSWORD=admin_app_secure_password
MONGO_BACKUP_PASSWORD=backup_user_secure_password
DB_URL=mongodb://app_backend:app_backend_secure_password@localhost:27017/db_todoapp?authSource=db_todoapp

# Redis
REDIS_PASSWORD=admin_pwd
```

Changer les variables

### 3. Démarrer les Containers Docker

```bash
docker-compose up -d
```

Cela démarre :

- MongoDB sur `localhost:27017`
- Redis sur `localhost:6379`

### 4. Installer les Dépendances

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd ../frontend
npm install
```

### 5. Démarrer l'Application

#### Backend (terminal 1)

```bash
cd backend
npm run dev
# lien: http://localhost:3000
```

#### Frontend (terminal 2)

```bash
cd frontend
npm run dev
# lien: http://localhost:5173
```

---

## MongoDB

### Structure de la Base de Données

**Base** : `db_todoapp`

**Collections** :

- `users` - Utilisateurs enregistrés
- `todos` - Tâches

### Les 3 Utilisateurs MongoDB

| Utilisateur     | Rôle                   | Permissions                          | Usage              |
| --------------- | ---------------------- | ------------------------------------ | ------------------ |
| **app_backend** | `readWrite`, `dbOwner` | CRUD complet + gestion indexes       | API application    |
| **admin_app**   | `dbAdmin`, `userAdmin` | Admin limité + création utilisateurs | Maintenance        |
| **backup_user** | `read`                 | Lecture seule globale                | Sauvegarde/Restore |

### Initialisation MongoDB

Le fichier `data/mongo/docker-entrypoint-initdb.d/mongo-init.js` initialise automatiquement :

- Base de données `db_todoapp`
- Collections avec schémas de validation
- Indexes (recherche texte, performance)
- 3 utilisateurs avec rôles

Voir [README-MONGODB.md](./README-MONGODB.md) pour les détails complets.

---

## Usage de l'IA

### Choses sur lesquels j'ai utilisé de l'IA

#### 1. **Backend**

- Schémas Mongoose avec validation
- Routes API Express

#### 2. **Configuration Docker**

- Script mongo-init.js

#### 3. **Documentation & Commandes**

- README
- Commandes MongoDB

---

## Sécurité de l'app

- Mots de passe hachés (bcrypt)
- JWT pour authentification sans état
- Permissions MongoDB granulaires
- Variables d'environnement pour secrets
- Validation de schéma MongoDB
- Middleware d'authentification Express

---

**Auteur** : Kiril Bormin
**Dates de réalisation** : Du 30.03.2026 au 18.05.2026

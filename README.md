# 📝 todo-app - Application de Gestion de Tâches

Une application complète de gestion de tâches moderne utilisant une architecture full-stack avec **MongoDB**, **Redis**, **Node.js/Express** et **Vue3**.

🎯 **Projet pédagogique** : Migration d'une base de données MySQL vers MongoDB avec optimisation par cache Redis.

---

## 📋 Table des Matières

- [Description](#description)
- [Technologies](#technologies)
- [Installation Locale](#installation-locale)
- [Démarrage de l'Application](#démarrage-de-lapplication)
- [Gestion MongoDB](#gestion-mongodb)
- [Sauvegarde et Restauration](#sauvegarde-et-restauration)
- [Usage de l'IA](#usage-de-lia)
- [Conclusion](#conclusion)

---

## 📖 Description

**todo-app** est une application web permettant aux utilisateurs de :

- ✅ Créer, modifier et supprimer des tâches
- ✅ Gérer les tâches par date
- ✅ Rechercher parmi les tâches (recherche full-text MongoDB)
- ✅ Gérer leur profil utilisateur
- ✅ Basculer entre thème clair et sombre
- ✅ Authentification sécurisée avec JWT

### Evolution du Projet

**Phase 1** (Original) : Application avec MySQL  
**Phase 2** (Actuelle) : Migration vers MongoDB + Optimisation Redis

---

## 🛠 Technologies

### Frontend

- **Vue 3** - Framework JavaScript réactif
- **TypeScript** - Typage statique pour la robustesse
- **Tailwind CSS** - Framework CSS utilitaire
- **Pinia** - Gestion d'état (alternative à Vuex)
- **Vite** - Bundler moderne et rapide
- **Vitest** - Framework de test
- **Cypress** - Tests E2E

### Backend

- **Node.js 20+** - Runtime JavaScript serveur
- **Express.js** - Framework web léger
- **MongoDB** - Base de données NoSQL documentaire
- **Mongoose** - ODM (Object Data Mapping) pour MongoDB
- **Redis** - Cache applicatif en mémoire
- **JWT** - Authentification sans état
- **bcrypt** - Hachage des mots de passe

### Infrastructure

- **Docker** - Conteneurisation
- **Docker Compose** - Orchestration locale
- **MongoDB 8.0.6** - Base de données
- **Redis Stack 7.2** - Cache et monitoring

---

## 💾 Installation Locale

### Prérequis

- **Docker** et **Docker Compose** (ou Node.js 20+, npm, MongoDB et Redis localement)
- **Git**
- **VS Code** (recommandé)

### 1️⃣ Cloner le Repository

```bash
git clone https://github.com/kiril-bormin/165-todo-app.git
cd 165-todo-app
```

### 2️⃣ Configurer les Variables d'Environnement

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

⚠️ **Important** : Changer les mots de passe en production !

### 3️⃣ Démarrer les Containers Docker

```bash
docker-compose up -d
```

Cela démarre :

- 🐳 MongoDB sur `localhost:27017`
- 🚀 Redis sur `localhost:6379`

### 4️⃣ Installer les Dépendances

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

### 5️⃣ Démarrer l'Application

#### Backend (terminal 1)

```bash
cd backend
npm run dev
# Écoute sur http://localhost:3000
```

#### Frontend (terminal 2)

```bash
cd frontend
npm run dev
# Écoute sur http://localhost:5173
```

#### Accéder à l'Application

```
http://localhost:5173
```

---

## 🚀 Démarrage de l'Application

### Mode Développement

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Mode Production

```bash
# Build frontend
cd frontend && npm run build

# Lancer backend
cd backend && npm run dev
```

### Vérifier la Santé de MongoDB

```bash
./scripts/verify-mongodb.sh
```

---

## 🔐 Gestion MongoDB

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

### Chaînes de Connexion

**Application (app_backend)** :

```
mongodb://app_backend:app_backend_secure_password@localhost:27017/db_todoapp?authSource=db_todoapp
```

**Administration (admin_app)** :

```
mongodb://admin_app:admin_app_secure_password@localhost:27017/db_todoapp?authSource=db_todoapp
```

**Sauvegarde (backup_user)** :

```
mongodb://backup_user:backup_user_secure_password@localhost:27017/db_todoapp?authSource=db_todoapp
```

### Initialisation MongoDB

Le fichier `data/mongo/docker-entrypoint-initdb.d/mongo-init.js` initialise automatiquement :
✅ Base de données `db_todoapp`  
✅ Collections avec schémas de validation  
✅ Indexes (recherche texte, performance)  
✅ 3 utilisateurs avec rôles

Voir [README-MONGODB.md](./README-MONGODB.md) pour les détails complets.

---

## 💾 Sauvegarde et Restauration

### 📥 Backup Complet (Optimisé)

```bash
mongodump \
  --uri="mongodb://backup_user:backup_user_secure_password@localhost:27017/db_todoapp?authSource=db_todoapp" \
  --out=./data/mongo/backupdb/dump_$(date +%Y%m%d_%H%M%S)
```

**Avantages** :

- Format BSON compressible (70% moins lourd que JSON)
- Préserve les types de données exactement
- Backup atomique et cohérent

### 📋 Export en JSON (Visualisation)

```bash
mongoexport \
  --uri="mongodb://backup_user:backup_user_secure_password@localhost:27017/db_todoapp" \
  --collection=users \
  --out=./data/mongo/backupdb/users_$(date +%Y%m%d).json

mongoexport \
  --uri="mongodb://backup_user:backup_user_secure_password@localhost:27017/db_todoapp" \
  --collection=todos \
  --out=./data/mongo/backupdb/todos_$(date +%Y%m%d).json
```

### 🔄 Restore Complet

```bash
mongorestore \
  --uri="mongodb://app_backend:app_backend_secure_password@localhost:27017/db_todoapp?authSource=db_todoapp" \
  --dir=./data/mongo/backupdb/dump_20260504_143025 \
  --drop
```

⚠️ L'option `--drop` supprime les collections existantes avant restauration.

### 📊 Stratégie de Backup Recommandée

```bash
# Backup quotidien avec horodatage
0 2 * * * mongodump \
  --uri="mongodb://backup_user:backup_user_secure_password@localhost:27017/db_todoapp?authSource=db_todoapp" \
  --out=/backupdb/dump_$(date +\%Y\%m\%d)

# Nettoyage des backups anciens (>30 jours)
0 3 * * * find /backupdb -name "dump_*" -mtime +30 -exec rm -rf {} \;
```

Pour plus d'informations, voir [README-MONGODB.md](./README-MONGODB.md).

---

## 🤖 Usage de l'IA

Ce projet a bénéficié de l'assistance d'outils d'IA (GitHub Copilot) pour accélérer le développement tout en maintenant la qualité.

### Domaines où l'IA a Assisté :

#### 1. **Génération de Code Backend**

- ✅ Schémas Mongoose avec validation
- ✅ Routes API Express
- ✅ Controllers avec logique CRUD
- ✅ Middleware d'authentification JWT

**Approche** : Prompts spécifiques + révision manuelle de chaque ligne

#### 2. **Architecture Frontend Vue3**

- ✅ Composants réutilisables
- ✅ Store Pinia
- ✅ Services d'API
- ✅ Formulaires réactifs

**Approche** : Génération de templates + intégration TypeScript

#### 3. **Configuration Docker & DevOps**

- ✅ Docker Compose
- ✅ Script mongo-init.js
- ✅ Variables d'environnement
- ✅ Volumes et réseaux

**Approche** : Documentation + ajustements manuels

#### 4. **Documentation & Commandes**

- ✅ README complet
- ✅ Commandes MongoDB
- ✅ Scripts de vérification
- ✅ Instructions de déploiement

**Approche** : Génération initiale + vérification technique

### Apprentissages Clés

1. **L'IA accélère mais ne remplace pas** : Les prompts flous produisent du code médiocre
2. **Vérifier systématiquement** : Tester chaque suggestion sur la machine
3. **Contextualiser les prompts** : Inclure le schéma, l'architecture, les contraintes
4. **Itérer et améliorer** : Rarement parfait du premier coup

### Contrôle de Qualité

✅ Tous les prompts documentés dans les commits  
✅ Code généré par l'IA explicitement marqué  
✅ Tests manuels avant merge  
✅ Conventional Commits respectés

---

## 📊 Résumé Technique

| Aspect               | Détail                              |
| -------------------- | ----------------------------------- |
| **Base de Données**  | MongoDB 8.0.6 (NoSQL documentaire)  |
| **Cache**            | Redis Stack 7.2 (en-mémoire)        |
| **API**              | REST avec JWT                       |
| **Authentification** | Stateless JWT + bcrypt              |
| **Recherche**        | Full-text MongoDB `$text`           |
| **Infrastructure**   | Docker Compose (local)              |
| **Versioning**       | Git + GitHub (Conventional Commits) |

---

## 🔒 Sécurité

✅ Mots de passe hachés (bcrypt)  
✅ JWT pour authentification sans état  
✅ Permissions MongoDB granulaires  
✅ Variables d'environnement pour secrets  
✅ Validation de schéma MongoDB  
✅ Middleware d'authentification Express

---

## 📚 Documentation Additionnelle

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [MongoDB & Permissions](./README-MONGODB.md)

---

## 📂 Structure du Projet

```
165-todo-app/
├── backend/                    # API Node.js/Express
│   ├── app.js
│   ├── config/                # Configuration DB/Redis
│   ├── models/                # Schémas Mongoose
│   ├── controllers/           # Logique métier
│   ├── routes/                # Endpoints API
│   ├── middlewares/           # Auth, validation
│   └── package.json
├── frontend/                  # Application Vue3
│   ├── src/
│   │   ├── components/        # Composants Vue
│   │   ├── views/             # Pages
│   │   ├── stores/            # Pinia stores
│   │   ├── services/          # Appels API
│   │   └── App.vue
│   └── package.json
├── data/
│   └── mongo/                 # Volumes MongoDB
│       └── docker-entrypoint-initdb.d/
│           └── mongo-init.js  # Initialisation
├── scripts/
│   └── verify-mongodb.sh      # Vérification santé
├── docker-compose.yaml        # Orchestration
├── .env.example              # Variables exemple
└── README.md                 # Ce fichier
```

---

## 🎯 Conclusion

Cette implémentation démontre une migration réussie d'une application monolithique vers une architecture moderne avec :

✅ **MongoDB** pour la flexibilité documentaire  
✅ **Redis** pour la performance (cache)  
✅ **Vue3** pour une UI réactive et moderne  
✅ **Docker** pour la reproductibilité  
✅ **Permissions granulaires** pour la sécurité

Le projet respecte les bonnes pratiques DevOps, de sécurité et de maintenabilité. Il est prêt pour une utilisation pédagogique et peut servir de base pour une montée en production avec ajustements mineurs.

### Points Forts

1. ✅ Architecture séparation Backend/Frontend claire
2. ✅ Gestion complète des utilisateurs MongoDB
3. ✅ Cache Redis intégré
4. ✅ Authentification JWT robuste
5. ✅ Tests documentés
6. ✅ Docker pour l'environnement reproductible

### Points d'Amélioration Futurs

1. 🔄 Tests E2E exhaustifs
2. 🔄 CI/CD (GitHub Actions)
3. 🔄 Monitoring (Prometheus, Grafana)
4. 🔄 Logging centralisé (ELK)
5. 🔄 Déploiement Kubernetes

---

**Auteur** : Kiril Bormin  
**Projet** : ETML P_DB_165  
**Dernière mise à jour** : 2026-05-04

---

Pour plus de détails techniques, consultez [README-MONGODB.md](./README-MONGODB.md) et les README spécifiques du backend et frontend.

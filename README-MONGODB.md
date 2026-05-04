# 📦 MongoDB - Gestion et Configuration

Ce document explique la configuration MongoDB de l'application todo-app, y compris la gestion des utilisateurs, permissions et les procédures de sauvegarde/restauration.

---

## 🔍 Qu'est-ce que `mongo-init.js` ?

Le fichier `mongo-init.js` est un **script d'initialisation Docker** qui s'exécute automatiquement au premier démarrage du container MongoDB. Il effectue :

✅ Création automatique de la base de données `db_todoapp`  
✅ Création des collections (`users`, `todos`) avec validation de schéma  
✅ Création des indexes pour optimiser les performances  
✅ Création de 3 utilisateurs MongoDB avec rôles spécifiques  
✅ Configuration des permissions de sécurité

**Localisation** : `./data/mongo/docker-entrypoint-initdb.d/mongo-init.js`

---

## 👤 Gestion des Utilisateurs et Permissions

### 1️⃣ **app_backend** - Application Backend

**Rôles** : `readWrite`, `dbOwner`  
**Permissions** :

- ✅ CRUD complet (Create, Read, Update, Delete)
- ✅ Gestion des indexes
- ✅ Création de collections
- ✅ Suppression de la base de données

**Utilisation** : Connexion de l'API backend  
**Chaîne de connexion** :

```
mongodb://app_backend:app_backend_secure_password@localhost:27017/db_todoapp?authSource=db_todoapp
```

**Cas d'usage** : Opérations courantes de l'application

---

### 2️⃣ **admin_app** - Administrateur Limité

**Rôles** : `dbAdmin`, `userAdmin`  
**Permissions** :

- ✅ Création et gestion des indexes
- ✅ Consultation des statistiques
- ✅ Gestion des schémas
- ✅ Création/modification/suppression des utilisateurs
- ❌ Ne peut pas modifier les données

**Utilisation** : Maintenance et administration  
**Chaîne de connexion** :

```
mongodb://admin_app:admin_app_secure_password@localhost:27017/db_todoapp?authSource=db_todoapp
```

**Cas d'usage** : Monitoring, gestion d'indexes, ajout d'utilisateurs

---

### 3️⃣ **backup_user** - Sauvegarde/Export (Lecture seule)

**Rôles** : `read` sur `db_todoapp` et `admin`  
**Permissions** :

- ✅ Lecture seule sur toutes les données
- ✅ Export avec `mongoexport`
- ✅ Dump avec `mongodump`
- ❌ Aucune modification possible

**Utilisation** : Sauvegarde et audit  
**Chaîne de connexion** :

```
mongodb://backup_user:backup_user_secure_password@localhost:27017/db_todoapp?authSource=db_todoapp
```

**Cas d'usage** : Backups automatisés, rapports, archivage

---

## 💾 Backup / Restore - Procédures Détaillées

### 📥 **Backup Complet** (Minimal, optimisé pour la compression)

#### Commande :

```bash
mongodump \
  --uri="mongodb://backup_user:backup_user_secure_password@localhost:27017/db_todoapp?authSource=db_todoapp" \
  --out=/backupdb/dump_$(date +%Y%m%d_%H%M%S)
```

#### Explication :

- `mongodump` : Outil natif MongoDB qui exporte les données au format BSON
- `--uri` : Chaîne de connexion avec utilisateur `backup_user` (lecture seule)
- `--out` : Répertoire de sortie avec timestamp pour archivage multiple
- `date +%Y%m%d_%H%M%S` : Génère un répertoire unique : `dump_20260504_143025`

#### Avantages :

✅ Format BSON compressible (70% moins lourd que JSON)  
✅ Préserve les types de données exacts  
✅ Plus rapide qu'une exportation JSON  
✅ Backup atomique et cohérent

---

### 📤 **Backup en JSON** (Pour visualisation et portabilité)

```bash
mongoexport \
  --uri="mongodb://backup_user:backup_user_secure_password@localhost:27017/db_todoapp" \
  --collection=users \
  --out=/backupdb/users_backup_$(date +%Y%m%d).json

mongoexport \
  --uri="mongodb://backup_user:backup_user_secure_password@localhost:27017/db_todoapp" \
  --collection=todos \
  --out=/backupdb/todos_backup_$(date +%Y%m%d).json
```

#### Explication :

- `mongoexport` : Exporte par collection
- `--collection` : Spécifie quelle collection exporter
- Produit un fichier JSON lisible et portable

---

### 🔄 **Restore Complet**

```bash
mongorestore \
  --uri="mongodb://app_backend:app_backend_secure_password@localhost:27017/db_todoapp?authSource=db_todoapp" \
  --dir=/backupdb/dump_20260504_143025 \
  --drop
```

#### Explication :

- `mongorestore` : Restaure les données depuis un dump
- `--dir` : Chemin du répertoire de backup
- `--drop` : Supprime les collections existantes avant restauration (⚠️ À utiliser avec prudence)

#### ⚠️ Alternative sans suppression :

```bash
mongorestore \
  --uri="mongodb://app_backend:app_backend_secure_password@localhost:27017/db_todoapp?authSource=db_todoapp" \
  --dir=/backupdb/dump_20260504_143025
```

---

### 📋 **Restore Sélectif** (Collections spécifiques)

```bash
mongorestore \
  --uri="mongodb://app_backend:app_backend_secure_password@localhost:27017/db_todoapp?authSource=db_todoapp" \
  --nsInclude="db_todoapp.users" \
  --dir=/backupdb/dump_20260504_143025 \
  --drop
```

#### Explication :

- `--nsInclude` : Filtre pour ne restaurer que certaines collections
- Utile pour restauration parielle ou tests

---

## 🚀 Démarrage et Vérification

### 1. Démarrer les containers

```bash
docker-compose up -d
```

### 2. Vérifier que les utilisateurs sont créés

```bash
docker exec -it mongo mongosh --authenticationDatabase admin \
  --username admin_user --password admin_pwd \
  --eval "use db_todoapp; db.getUsers()"
```

**Résultat attendu** : Affiche les 3 utilisateurs (app_backend, admin_app, backup_user)

### 3. Tester la connexion avec app_backend

```bash
docker exec -it mongo mongosh \
  "mongodb://app_backend:app_backend_secure_password@localhost:27017/db_todoapp?authSource=db_todoapp" \
  --eval "db.users.countDocuments()"
```

### 4. Vérifier les indexes

```bash
docker exec -it mongo mongosh \
  "mongodb://admin_app:admin_app_secure_password@localhost:27017/db_todoapp?authSource=db_todoapp" \
  --eval "db.todos.getIndexes()"
```

---

## 📊 Taille des Backups Comparée

| Format                   | Taille estimée | Compression         | Restauration |
| ------------------------ | -------------- | ------------------- | ------------ |
| **BSON** (`mongodump`)   | ~5-10 MB       | ✅ Excellent (gzip) | ⚡ Rapide    |
| **JSON** (`mongoexport`) | ~20-30 MB      | ⚠️ Moyen            | 🐢 Plus lent |
| **JSON + gzip**          | ~2-5 MB        | ✅ Très bon         | 🐢 Lent      |

**Recommandation** : Utiliser `mongodump` pour les backups réguliers (production)

---

## 🔒 Sécurité - Points Importants

1. **Ne jamais utiliser `admin_user` pour l'application** → Utiliser `app_backend`
2. **Ne jamais modifier les mots de passe** dans le docker-compose.yaml
3. **Utiliser des variables d'environnement** chargées depuis `.env`
4. **Sauvegarder régulièrement** avec `backup_user` (utilisateur dédié, lecture seule)
5. **Changer les mots de passe** en production (ne pas garder les valeurs par défaut)

---

## 📝 Modification des Mots de Passe

Pour changer les mots de passe en production :

1. Modifier `.env` :

```env
MONGO_APP_PASSWORD=nouveau_mot_de_passe_secure
MONGO_ADMIN_PASSWORD=nouveau_admin_secure
MONGO_BACKUP_PASSWORD=nouveau_backup_secure
```

2. Supprimer le volume MongoDB (⚠️ Données perdues) :

```bash
docker-compose down -v
```

3. Redémarrer :

```bash
docker-compose up -d
```

**Alternative** : Modifier directement dans MongoDB avec les commandes `db.changeUserPassword()`.

---

## 🐛 Dépannage

### Erreur "Authentication failed"

```
→ Vérifier que les mots de passe dans `.env` correspondent à `mongo-init.js`
```

### Erreur "mongodump not found"

```bash
docker exec -it mongo mongosh  # Utiliser mongosh au lieu
```

### Container ne démarre pas

```bash
docker logs mongo  # Voir les logs
docker-compose down -v && docker-compose up --build  # Reconstruire
```

---

## 📚 Ressources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [MongoDB Best Practices](https://docs.mongodb.com/manual/administration/security-checklist/)
- [mongodump / mongorestore](https://docs.mongodb.com/database-tools/mongodump/)
- [mongoexport / mongoimport](https://docs.mongodb.com/database-tools/mongoexport/)

---

**Dernière mise à jour** : 2026-05-04

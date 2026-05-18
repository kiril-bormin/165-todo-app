# MongoDB - Gestion et configuration

Ce document résume la configuration MongoDB du projet et les commandes utiles pour l'initialisation, la sauvegarde et la restauration.

## Script d'initialisation

Le fichier [mongo-init.js](data/mongo/docker-entrypoint-initdb.d/mongo-init.js) s'exécute automatiquement au premier démarrage du conteneur MongoDB.

Il crée :

- la base `db_todoapp`
- les collections `users` et `todos`
- les indexes utiles à la recherche
- les 3 utilisateurs MongoDB du projet

## Utilisateurs MongoDB

| Utilisateur   | Rôle                   | Usage                 |
| ------------- | ---------------------- | --------------------- |
| `app_backend` | `readWrite`, `dbOwner` | connexion de l'API    |
| `admin_app`   | `dbAdmin`, `userAdmin` | administration locale |
| `backup_user` | `read`                 | sauvegarde et export  |

## Connexions

```bash
mongodb://app_backend:app_backend_secure_password@localhost:27017/db_todoapp?authSource=db_todoapp
mongodb://admin_app:admin_app_secure_password@localhost:27017/db_todoapp?authSource=db_todoapp
mongodb://backup_user:backup_user_secure_password@localhost:27017/db_todoapp?authSource=db_todoapp
```

## Sauvegarde

```bash
docker exec mongo mongodump \
  --username backup_user \
  --password backup_user_secure_password \
  --authenticationDatabase admin \
  --db db_todoapp \
  --archive=//backupdb/todo-backup.gz \
  --gzip
```

## Restauration

```bash
docker exec mongo mongorestore \
  --username app_backend \
  --password app_backend_secure_password \
  --authenticationDatabase db_todoapp \
  --db db_todoapp \
  --archive=//backupdb/todo-backup.gz \
  --gzip \
  --drop
```

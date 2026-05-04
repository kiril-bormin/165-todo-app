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
mongodump \
  --uri="mongodb://backup_user:backup_user_secure_password@localhost:27017/db_todoapp?authSource=db_todoapp" \
  --out=/backupdb/dump_$(date +%Y%m%d_%H%M%S)
```

## Restauration

```bash
mongorestore \
  --uri="mongodb://app_backend:app_backend_secure_password@localhost:27017/db_todoapp?authSource=db_todoapp" \
  --dir=/backupdb/dump_20260504_143025 \
  --drop
```

## Vérification

Après le démarrage, le script de vérification peut être lancé avec :

```bash
./scripts/verify-mongodb.sh
```

Il contrôle la présence du conteneur MongoDB, la connexion et les utilisateurs créés.

## Remarques

- les mots de passe sont lus depuis `.env`
- les volumes Docker conservent les données entre deux démarrages
- pour réinitialiser complètement, utiliser `docker compose down -v`

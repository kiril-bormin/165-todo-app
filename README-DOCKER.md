# Docker - Services du projet

Ce document résume le démarrage local du projet avec Docker Compose.

## Services

- `mongo` : base de données MongoDB
- `redis` : cache applicatif
- `backend` : API Node.js / Express
- `frontend` : interface Vue 3

## Variables d'environnement

Toutes les valeurs sont lues depuis le fichier `.env` à la racine du projet.

Pour partir de la configuration par défaut :

```bash
cp .env.example .env
```

Les variables importantes sont :

| Variable                | Rôle                                     |
| ----------------------- | ---------------------------------------- |
| `MONGO_ROOT_USERNAME`   | utilisateur root MongoDB                 |
| `MONGO_ROOT_PASSWORD`   | mot de passe root MongoDB                |
| `MONGO_APP_PASSWORD`    | mot de passe de l'utilisateur applicatif |
| `MONGO_ADMIN_PASSWORD`  | mot de passe de l'administrateur MongoDB |
| `MONGO_BACKUP_PASSWORD` | mot de passe de l'utilisateur backup     |
| `REDIS_PASSWORD`        | mot de passe Redis                       |

## Démarrage

```bash
docker compose up -d
```

## Arrêt

```bash
docker compose down
```

## Réinitialisation complète

Cette commande supprime aussi les volumes Docker :

```bash
docker compose down -v
```

## Données persistantes

Les données MongoDB et Redis sont stockées dans des volumes Docker. Elles restent donc disponibles après un simple `down`.

## Vérification

Le script suivant permet de vérifier la configuration MongoDB après le démarrage :

```bash
./scripts/verify-mongodb.sh
```

## Valeurs par défaut

Les valeurs exactes sont documentées dans `.env.example`. Il faut les changer si le projet est déployé hors environnement local.

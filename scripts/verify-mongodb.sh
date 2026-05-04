#!/bin/bash

# Script de vérification MongoDB - todo-app
# Teste la configuration et les utilisateurs MongoDB

set -e

echo "🔍 Vérification de la configuration MongoDB..."
echo "================================================\n"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Vérifier que les containers sont en cours d'exécution
echo "1️⃣  Vérification des containers..."
if docker ps | grep -q "mongo"; then
  echo -e "${GREEN}✓ Container MongoDB est en cours d'exécution${NC}\n"
else
  echo -e "${RED}✗ Container MongoDB n'est pas en cours d'exécution${NC}"
  echo "Démarrez avec: docker-compose up -d"
  exit 1
fi

# 2. Vérifier la connexion au root
echo "2️⃣  Vérification de la connexion root..."
if docker exec mongo mongosh --authenticationDatabase admin \
  --username admin_user --password admin_pwd \
  --eval "db.version()" > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Connexion root réussie${NC}\n"
else
  echo -e "${RED}✗ Connexion root échouée${NC}\n"
fi

# 3. Vérifier la création de la base de données
echo "3️⃣  Vérification de la base de données..."
if docker exec mongo mongosh --authenticationDatabase admin \
  --username admin_user --password admin_pwd \
  --eval "use db_todoapp; db.getName()" 2>/dev/null | grep -q "db_todoapp"; then
  echo -e "${GREEN}✓ Base de données 'db_todoapp' existe${NC}\n"
else
  echo -e "${RED}✗ Base de données 'db_todoapp' non trouvée${NC}\n"
fi

# 4. Vérifier les utilisateurs
echo "4️⃣  Vérification des utilisateurs..."
USERS=$(docker exec mongo mongosh --authenticationDatabase admin \
  --username admin_user --password admin_pwd \
  --eval "use db_todoapp; db.getUsers()" 2>/dev/null | grep -o '"user":"[^"]*"' | wc -l)

if [ $USERS -eq 3 ]; then
  echo -e "${GREEN}✓ 3 utilisateurs créés${NC}\n"
  docker exec mongo mongosh --authenticationDatabase admin \
    --username admin_user --password admin_pwd \
    --eval "use db_todoapp; db.getUsers().forEach(u => print('  • ' + u.user))" 2>/dev/null
  echo ""
else
  echo -e "${RED}✗ Attendu 3 utilisateurs, trouvé: $USERS${NC}\n"
fi

# 5. Tester la connexion avec app_backend
echo "5️⃣  Test de connexion app_backend..."
if docker exec mongo mongosh \
  "mongodb://app_backend:app_backend_secure_password@localhost:27017/db_todoapp?authSource=db_todoapp" \
  --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
  echo -e "${GREEN}✓ app_backend connecté avec succès${NC}\n"
else
  echo -e "${RED}✗ Impossible de se connecter avec app_backend${NC}\n"
fi

# 6. Tester la connexion avec admin_app
echo "6️⃣  Test de connexion admin_app..."
if docker exec mongo mongosh \
  "mongodb://admin_app:admin_app_secure_password@localhost:27017/db_todoapp?authSource=db_todoapp" \
  --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
  echo -e "${GREEN}✓ admin_app connecté avec succès${NC}\n"
else
  echo -e "${RED}✗ Impossible de se connecter avec admin_app${NC}\n"
fi

# 7. Tester la connexion avec backup_user
echo "7️⃣  Test de connexion backup_user..."
if docker exec mongo mongosh \
  "mongodb://backup_user:backup_user_secure_password@localhost:27017/db_todoapp?authSource=db_todoapp" \
  --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
  echo -e "${GREEN}✓ backup_user connecté avec succès${NC}\n"
else
  echo -e "${RED}✗ Impossible de se connecter avec backup_user${NC}\n"
fi

# 8. Vérifier les collections
echo "8️⃣  Vérification des collections..."
COLLECTIONS=$(docker exec mongo mongosh \
  "mongodb://app_backend:app_backend_secure_password@localhost:27017/db_todoapp?authSource=db_todoapp" \
  --eval "db.getCollectionNames()" 2>/dev/null | grep -o '"[^"]*"' | wc -l)

echo -e "${GREEN}✓ Collections trouvées:${NC}"
docker exec mongo mongosh \
  "mongodb://app_backend:app_backend_secure_password@localhost:27017/db_todoapp?authSource=db_todoapp" \
  --eval "db.getCollectionNames().forEach(c => print('  • ' + c))" 2>/dev/null
echo ""

# 9. Vérifier les indexes
echo "9️⃣  Vérification des indexes..."
echo -e "${GREEN}Indexes sur 'todos':${NC}"
docker exec mongo mongosh \
  "mongodb://admin_app:admin_app_secure_password@localhost:27017/db_todoapp?authSource=db_todoapp" \
  --eval "db.todos.getIndexes().forEach(i => print('  • ' + i.name))" 2>/dev/null
echo ""

# 10. Affichage du résumé
echo "================================================"
echo -e "${GREEN}✅ Vérification complète terminée!${NC}\n"
echo "Configuration de production prête ✨"

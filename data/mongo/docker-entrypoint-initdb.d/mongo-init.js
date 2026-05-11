db = db.getSiblingDB("db_todoapp");

// 1. Utilisateur "app_backend" : CRUD complet + gestion des collections et index
db.createUser({
  user: "app_backend",
  pwd: "app_backend_secure_password", // MONGO_APP_PASSWORD dans .env
  roles: [
    { role: "readWrite", db: "db_todoapp" },
    { role: "dbAdmin", db: "db_todoapp" },
  ],
});

// 2. Utilisateur "admin_app" : Gestion des utilisateurs, index et statistiques sur la DB locale
db.createUser({
  user: "admin_app",
  pwd: "admin_app_secure_password", // MONGO_ADMIN_PASSWORD dans .env
  roles: [
    { role: "userAdmin", db: "db_todoapp" },
    { role: "dbAdmin", db: "db_todoapp" },
  ],
});

// 3. Utilisateur "backup_user", droits : Lecture seule globale pour les sauvegardes
db.getSiblingDB("admin").createUser({
  user: "backup_user",
  pwd: "backup_user_secure_password", // MONGO_BACKUP_PASSWORD dans .env
  roles: [{ role: "readAnyDatabase", db: "admin" }],
});

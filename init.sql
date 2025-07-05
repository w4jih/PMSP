-- Facultatif, mais \c peut être ignoré dans certains contextes
--\c mydb_test;

-- 1. Créer la table d'abord
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100)
);

-- 2. Insérer des données
INSERT INTO users (name) VALUES ('Test User 1'), ('Test User 2');

-- 3. Créer l'utilisateur
CREATE USER IF NOT EXISTS test_user WITH PASSWORD 'test_password';

-- 4. Donner les droits
GRANT ALL PRIVILEGES ON DATABASE mydb_test TO test_user;
ALTER TABLE users OWNER TO test_user;

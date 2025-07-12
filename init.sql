-- init.sql  (version corrigée)
-- Ici, l’utilisateur et la base existent déjà car créés par les variables d’environnement.

\connect mydb_test

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100)
);

INSERT INTO users (name) VALUES ('Test User 1'), ('Test User 2');

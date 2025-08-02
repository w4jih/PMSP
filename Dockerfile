# Étape 1 : Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier tout le projet
COPY . .

# Générer Prisma client
RUN npx prisma generate

# Étape 2 : Image finale
FROM node:20-alpine

WORKDIR /app

# Définir l'argument pour passer depuis Jenkins
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Copier uniquement ce qui est nécessaire
COPY --from=builder /app ./

# Définir les variables d'environnement
ENV NODE_ENV=production

# Exposer le port
EXPOSE 3000

# Démarrer l'application
CMD ["npm", "start"]

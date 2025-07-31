# Use official Node image
FROM node:20

# Create app directory
WORKDIR /app

# Copy package.json and lock file first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the code
COPY . .

# Prisma generate & build
RUN npx prisma generate
RUN npm run build

# Expose app port (adjust if different)
EXPOSE 3000

# Start app
CMD ["npm", "run", "start"]

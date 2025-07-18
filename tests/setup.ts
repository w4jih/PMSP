import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

// Fonction pour vider la base
export async function resetDatabase() {
  const models = [
    'PaymentIntent',
    'Reservation',
    'Trajectory',
    'Vehicule',
    'Passager',
    'Conducteur',
    'Employer',
    'Admin'
  ];

  try {
    // Méthode 1 (SQL direct - le plus rapide)
    await prisma.$executeRaw`TRUNCATE TABLE ${models.map(m => `"${m}"`).join(', ')} RESTART IDENTITY CASCADE`;
    
    // Alternative si échec :
    // await prisma.$transaction(models.map(model => prisma[model.toLowerCase()].deleteMany()));
  } catch (error) {
    console.error('Échec du reset de la base :', error);
    process.exit(1);
  }
}

// Applique les migrations avant tous les tests
beforeAll(async () => {
  execSync('npx prisma migrate dev --name test_init --skip-generate', { stdio: 'inherit' });
  await resetDatabase();
});

// Nettoie la base après chaque test
afterEach(async () => {
  await resetDatabase();
});

// Ferme la connexion après tous les tests
afterAll(async () => {
  await prisma.$disconnect();
});

// Exporte prisma pour les tests
export { prisma };
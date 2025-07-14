import { prisma, resetDatabase } from '../setup';
import { createPassager } from '../../app/services/passager.service';

describe('Passager Service', () => {
  it('crée un nouveau passager', async () => {
    const passager = await createPassager({
      name: 'Jean',
      lastname: 'Dupont',
      Cin: 'JC123456',
      email: 'jean@example.com',
      password: 's3cr3t'
    });

    expect(passager).toHaveProperty('id', 1); // Les IDs recommencent à 1
  });
});
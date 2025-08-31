import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@psicopront.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  // Criar usuário admin
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin',
      passwordHash,
      role: 'ADMIN',
    },
  });
  console.log('Admin criado:', admin);

  // Criar usuário terapeuta de exemplo
  const therapistPassword = await bcrypt.hash('therapist123', 10);
  const therapist = await prisma.user.upsert({
    where: { email: 'therapist@psicopront.com' },
    update: {},
    create: {
      email: 'therapist@psicopront.com',
      name: 'Dr. João Silva',
      phone: '(11) 99999-9999',
      specialty: 'Psicologia Clínica',
      passwordHash: therapistPassword,
      role: 'THERAPIST',
    },
  });
  console.log('Terapeuta criado:', therapist);

  // Criar salas de exemplo
  const sala1 = await prisma.room.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Sala 1 - Terapia Individual',
      capacity: 2,
      resources: ['Ar condicionado', 'Som ambiente'],
      openingTime: '07:00',
      closingTime: '20:00',
      description: 'Sala para atendimentos individuais',
    },
  });
  console.log('Sala 1 criada:', sala1);

  const sala2 = await prisma.room.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Sala 2 - Terapia em Grupo',
      capacity: 8,
      resources: ['Ar condicionado', 'Projetor', 'Cadeiras em círculo'],
      openingTime: '07:00',
      closingTime: '20:00',
      description: 'Sala para terapias em grupo',
    },
  });
  console.log('Sala 2 criada:', sala2);

  console.log('Seed concluído!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



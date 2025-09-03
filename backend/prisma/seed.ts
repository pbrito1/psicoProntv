import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function getFutureDate(daysFromNow: number, hour: number = 9): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, 0, 0, 0);
  return date;
}

function getPastDate(daysAgo: number, hour: number = 9): Date {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, 0, 0, 0);
  return date;
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@psicopront.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Administrador',
      passwordHash,
      role: 'ADMIN',
      phone: '+5511999999999',
      specialty: 'Administração'
    },
  });
  console.log('Admin criado:', admin);

  const therapist = await prisma.user.upsert({
    where: { email: 'terapeuta@psicopront.com' },
    update: {},
    create: {
      email: 'terapeuta@psicopront.com',
      name: 'Dr. Carlos Silva',
      passwordHash: await bcrypt.hash('terapeuta123', 10),
      role: 'THERAPIST',
      phone: '+5511888888888',
      specialty: 'Psicologia Clínica'
    },
  });
  console.log('Terapeuta criado:', therapist);

  const therapist2 = await prisma.user.upsert({
    where: { email: 'terapeuta2@psicopront.com' },
    update: {},
    create: {
      email: 'terapeuta2@psicopront.com',
      name: 'Dra. Ana Santos',
      passwordHash: await bcrypt.hash('terapeuta123', 10),
      role: 'THERAPIST',
      phone: '+5511777777777',
      specialty: 'Terapia Ocupacional'
    },
  });
  console.log('Terapeuta 2 criado:', therapist2);

  const therapist3 = await prisma.user.upsert({
    where: { email: 'terapeuta3@psicopront.com' },
    update: {},
    create: {
      email: 'terapeuta3@psicopront.com',
      name: 'Dr. Paulo Costa',
      passwordHash: await bcrypt.hash('terapeuta123', 10),
      role: 'THERAPIST',
      phone: '+5511666666666',
      specialty: 'Fonoaudiologia'
    },
  });
  console.log('Terapeuta 3 criado:', therapist3);

  const sala1 = await prisma.room.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Sala de Terapia 1',
      capacity: 4,
      resources: ['Cadeiras confortáveis', 'Mesa de trabalho', 'Material terapêutico'],
      openingTime: '08:00',
      closingTime: '18:00',
      description: 'Sala principal para sessões individuais e pequenos grupos'
    },
  });
  console.log('Sala 1 criada:', sala1);

  const sala2 = await prisma.room.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Sala de Grupo',
      capacity: 12,
      resources: ['Cadeiras em círculo', 'Projetor', 'Quadro branco'],
      openingTime: '08:00',
      closingTime: '20:00',
      description: 'Sala para sessões em grupo e workshops'
    },
  });
  console.log('Sala 2 criada:', sala2);

  const sala3 = await prisma.room.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: 'Sala de Terapia Ocupacional',
      capacity: 6,
      resources: ['Mesa de atividades', 'Material sensorial', 'Jogos terapêuticos'],
      openingTime: '08:00',
      closingTime: '17:00',
      description: 'Sala especializada para terapia ocupacional'
    },
  });
  console.log('Sala 3 criada:', sala3);

  const client1 = await prisma.client.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'João Silva',
      email: 'joao.silva@email.com',
      phone: '+5511555555555',
      birthDate: new Date('2015-03-15'),
      address: 'Rua das Flores, 123 - São Paulo, SP',
      emergencyContact: 'Maria Silva',
      emergencyPhone: '+5511444444444',
      medicalHistory: 'TDAH diagnosticado aos 7 anos',
      currentMedications: 'Ritalina 10mg',
      allergies: 'Nenhuma conhecida'
    },
  });
  console.log('Cliente 1 criado:', client1);

  const client2 = await prisma.client.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Maria Silva',
      email: 'maria.silva@email.com',
      phone: '+5511333333333',
      birthDate: new Date('2016-07-22'),
      address: 'Rua das Flores, 123 - São Paulo, SP',
      emergencyContact: 'João Silva',
      emergencyPhone: '+5511222222222',
      medicalHistory: 'Atraso no desenvolvimento da fala',
      currentMedications: 'Nenhum',
      allergies: 'Nenhuma conhecida'
    },
  });
  console.log('Cliente 2 criado:', client2);

  const client3 = await prisma.client.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: 'Pedro Costa',
      email: 'pedro.costa@email.com',
      phone: '+5511111111111',
      birthDate: new Date('2014-11-08'),
      address: 'Av. Paulista, 456 - São Paulo, SP',
      emergencyContact: 'Ana Costa',
      emergencyPhone: '+5511000000000',
      medicalHistory: 'TEA (Transtorno do Espectro Autista)',
      currentMedications: 'Nenhum',
      allergies: 'Nenhuma conhecida'
    },
  });
  console.log('Cliente 3 criado:', client3);

  const client4 = await prisma.client.upsert({
    where: { id: 4 },
    update: {},
    create: {
      name: 'Sofia Lima',
      email: 'sofia.lima@email.com',
      phone: '+5511999999998',
      birthDate: new Date('2013-05-12'),
      address: 'Rua Augusta, 789 - São Paulo, SP',
      emergencyContact: 'Carlos Lima',
      emergencyPhone: '+5511999999997',
      medicalHistory: 'Paralisia cerebral leve',
      currentMedications: 'Nenhum',
      allergies: 'Nenhuma conhecida'
    },
  });
  console.log('Cliente 4 criado:', client4);

  const client5 = await prisma.client.upsert({
    where: { id: 5 },
    update: {},
    create: {
      name: 'Ana Ferreira',
      email: 'ana.ferreira@email.com',
      phone: '+5511999999996',
      birthDate: new Date('1995-09-30'),
      address: 'Rua Oscar Freire, 321 - São Paulo, SP',
      emergencyContact: 'Roberto Ferreira',
      emergencyPhone: '+5511999999995',
      medicalHistory: 'Fobia social, ansiedade generalizada',
      currentMedications: 'Sertralina 50mg',
      allergies: 'Nenhuma conhecida'
    },
  });
  console.log('Cliente 5 criado:', client5);

  const client6 = await prisma.client.upsert({
    where: { id: 6 },
    update: {},
    create: {
      name: 'Roberto Lima',
      email: 'roberto.lima@email.com',
      phone: '+5511999999994',
      birthDate: new Date('1988-12-03'),
      address: 'Rua Haddock Lobo, 654 - São Paulo, SP',
      emergencyContact: 'Patrícia Lima',
      emergencyPhone: '+5511999999993',
      medicalHistory: 'Estresse pós-traumático, insônia',
      currentMedications: 'Zolpidem 10mg',
      allergies: 'Nenhuma conhecida'
    },
  });
  console.log('Cliente 6 criado:', client6);

  const guardian1 = await prisma.guardian.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Carlos Silva',
      email: 'carlos.silva@email.com',
      phone: '+5511888888888',
      cpf: '12345678901',
      relationship: 'Pai',
      passwordHash: await bcrypt.hash('senha123', 10),
      isActive: true
    },
  });
  console.log('Guardião 1 criado:', guardian1);

  const guardian2 = await prisma.guardian.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Ana Costa',
      email: 'ana.costa@email.com',
      phone: '+5511777777777',
      cpf: '98765432109',
      relationship: 'Mãe',
      passwordHash: await bcrypt.hash('senha123', 10),
      isActive: true
    },
  });
  console.log('Guardião 2 criado:', guardian2);

  const guardian3 = await prisma.guardian.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: 'Carlos Lima',
      email: 'carlos.lima@email.com',
      phone: '+5511666666666',
      cpf: '45678912345',
      relationship: 'Pai',
      passwordHash: await bcrypt.hash('senha123', 10),
      isActive: true
    },
  });
  console.log('Guardião 3 criado:', guardian3);

  await prisma.guardian.update({
    where: { id: guardian1.id },
    data: {
      clients: {
        connect: [{ id: client1.id }, { id: client2.id }],
      },
    },
  });

  await prisma.guardian.update({
    where: { id: guardian2.id },
    data: {
      clients: {
        connect: [{ id: client3.id }],
      },
    },
  });

  await prisma.guardian.update({
    where: { id: guardian3.id },
    data: {
      clients: {
        connect: [{ id: client4.id }],
      },
    },
  });

  await prisma.clientTherapist.upsert({
    where: { id: 1 },
    update: {},
    create: {
      clientId: client1.id,
      therapistId: therapist2.id,
      isPrimary: true,
      startDate: new Date('2024-01-15')
    },
  });

  await prisma.clientTherapist.upsert({
    where: { id: 2 },
    update: {},
    create: {
      clientId: client2.id,
      therapistId: therapist3.id,
      isPrimary: true,
      startDate: new Date('2024-02-01')
    },
  });

  await prisma.clientTherapist.upsert({
    where: { id: 3 },
    update: {},
    create: {
      clientId: client3.id,
      therapistId: therapist2.id,
      isPrimary: true,
      startDate: new Date('2024-01-20')
    },
  });

  await prisma.clientTherapist.upsert({
    where: { id: 4 },
    update: {},
    create: {
      clientId: client4.id,
      therapistId: therapist.id,
      isPrimary: true,
      startDate: new Date('2024-02-10')
    },
  });

  await prisma.clientTherapist.upsert({
    where: { id: 5 },
    update: {},
    create: {
      clientId: client5.id,
      therapistId: therapist.id,
      isPrimary: true,
      startDate: new Date('2024-01-05')
    },
  });

  await prisma.clientTherapist.upsert({
    where: { id: 6 },
    update: {},
    create: {
      clientId: client6.id,
      therapistId: therapist.id,
      isPrimary: true,
      startDate: new Date('2024-01-10')
    },
  });

  const childBooking1 = await prisma.booking.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: 'Sessão de Terapia Ocupacional - João Silva',
      start: getFutureDate(1, 14),
      end: getFutureDate(1, 15),
      status: 'CONFIRMED',
      description: 'Sessão de terapia ocupacional para melhorar concentração',
      roomId: sala3.id,
      therapistId: therapist2.id,
      clientId: client1.id,
    },
  });
  console.log('Agendamento criança 1 criado:', childBooking1);

  const childBooking2 = await prisma.booking.upsert({
    where: { id: 2 },
    update: {},
    create: {
      title: 'Avaliação Fonoaudiológica - Maria Silva',
      start: getFutureDate(2, 10),
      end: getFutureDate(2, 11),
      status: 'PENDING',
      description: 'Avaliação para desenvolvimento da fala',
      roomId: sala1.id,
      therapistId: therapist3.id,
      clientId: client2.id,
    },
  });
  console.log('Agendamento criança 2 criado:', childBooking2);

  const childBooking3 = await prisma.booking.upsert({
    where: { id: 3 },
    update: {},
    create: {
      title: 'Sessão de Terapia Ocupacional - Pedro Costa',
      start: getFutureDate(1, 16),
      end: getFutureDate(1, 17),
      status: 'CONFIRMED',
      description: 'Sessão de terapia ocupacional para TEA',
      roomId: sala3.id,
      therapistId: therapist2.id,
      clientId: client3.id,
    },
  });
  console.log('Agendamento criança 3 criado:', childBooking3);

  const childBooking4 = await prisma.booking.upsert({
    where: { id: 4 },
    update: {},
    create: {
      title: 'Sessão de Fisioterapia - Sofia Lima',
      start: getFutureDate(3, 9),
      end: getFutureDate(3, 10),
      status: 'CONFIRMED',
      description: 'Sessão de fisioterapia para coordenação motora',
      roomId: sala1.id,
      therapistId: therapist.id,
      clientId: client4.id,
    },
  });
  console.log('Agendamento criança 4 criado:', childBooking4);

  const booking5 = await prisma.booking.upsert({
    where: { id: 5 },
    update: {},
    create: {
      title: 'Sessão Individual - Ana Ferreira',
      start: getFutureDate(3, 16),
      end: getFutureDate(3, 17),
      status: 'CONFIRMED',
      description: 'Sessão de terapia para fobia social',
      roomId: sala1.id,
      therapistId: therapist.id,
      clientId: client5.id,
    },
  });
  console.log('Agendamento 5 criado:', booking5);

  const booking6 = await prisma.booking.upsert({
    where: { id: 6 },
    update: {},
    create: {
      title: 'Sessão Individual - Roberto Lima',
      start: getFutureDate(1, 11),
      end: getFutureDate(1, 12),
      status: 'CONFIRMED',
      description: 'Sessão intensiva para estresse pós-traumático',
      roomId: sala1.id,
      therapistId: therapist.id,
      clientId: client6.id,
    },
  });
  console.log('Agendamento 6 criado:', booking6);

  const groupBooking = await prisma.booking.upsert({
    where: { id: 7 },
    update: {},
    create: {
      title: 'Terapia em Grupo - Ansiedade',
      start: getFutureDate(5, 19),
      end: getFutureDate(5, 21),
      status: 'PENDING',
      description: 'Sessão de terapia em grupo para ansiedade',
      roomId: sala2.id,
      therapistId: therapist.id,
    },
  });
  console.log('Agendamento em Grupo criado:', groupBooking);

  const pastBooking1 = await prisma.booking.upsert({
    where: { id: 8 },
    update: {},
    create: {
      title: 'Sessão de Terapia Ocupacional - João Silva',
      start: getPastDate(7, 14),
      end: getPastDate(7, 15),
      status: 'CONFIRMED',
      description: 'Sessão de terapia ocupacional para melhorar concentração',
      roomId: sala3.id,
      therapistId: therapist2.id,
      clientId: client1.id,
    },
  });
  console.log('Agendamento passado 1 criado:', pastBooking1);

  const pastBooking2 = await prisma.booking.upsert({
    where: { id: 9 },
    update: {},
    create: {
      title: 'Avaliação Fonoaudiológica - Maria Silva',
      start: getPastDate(14, 10),
      end: getPastDate(14, 11),
      status: 'CONFIRMED',
      description: 'Avaliação para desenvolvimento da fala',
      roomId: sala1.id,
      therapistId: therapist3.id,
      clientId: client2.id,
    },
  });
  console.log('Agendamento passado 2 criado:', pastBooking2);

  const pastBooking3 = await prisma.booking.upsert({
    where: { id: 10 },
    update: {},
    create: {
      title: 'Sessão de Terapia Ocupacional - Pedro Costa',
      start: getPastDate(7, 16),
      end: getPastDate(7, 17),
      status: 'CONFIRMED',
      description: 'Sessão de terapia ocupacional para TEA',
      roomId: sala3.id,
      therapistId: therapist2.id,
      clientId: client3.id,
    },
  });
  console.log('Agendamento passado 3 criado:', pastBooking3);

  const pastBooking4 = await prisma.booking.upsert({
    where: { id: 11 },
    update: {},
    create: {
      title: 'Sessão de Fisioterapia - Sofia Lima',
      start: getPastDate(14, 9),
      end: getPastDate(14, 10),
      status: 'CONFIRMED',
      description: 'Sessão de fisioterapia para coordenação motora',
      roomId: sala1.id,
      therapistId: therapist.id,
      clientId: client4.id,
    },
  });
  console.log('Agendamento passado 4 criado:', pastBooking4);

  const pastBooking5 = await prisma.booking.upsert({
    where: { id: 12 },
    update: {},
    create: {
      title: 'Sessão Individual - Ana Ferreira',
      start: getPastDate(21, 16),
      end: getPastDate(21, 17),
      status: 'CONFIRMED',
      description: 'Sessão de terapia para fobia social',
      roomId: sala1.id,
      therapistId: therapist.id,
      clientId: client5.id,
    },
  });
  console.log('Agendamento passado 5 criado:', pastBooking5);

  const pastBooking6 = await prisma.booking.upsert({
    where: { id: 13 },
    update: {},
    create: {
      title: 'Sessão Individual - Roberto Lima',
      start: getPastDate(28, 11),
      end: getPastDate(28, 12),
      status: 'CONFIRMED',
      description: 'Sessão intensiva para estresse pós-traumático',
      roomId: sala1.id,
      therapistId: therapist.id,
      clientId: client6.id,
    },
  });
  console.log('Agendamento passado 6 criado:', pastBooking6);

  const medicalRecord1 = await prisma.medicalRecord.upsert({
    where: { id: 1 },
    update: {},
    create: {
      clientId: client1.id,
      therapistId: therapist2.id,
      bookingId: pastBooking1.id,
      sessionDate: getPastDate(7, 14),
             sessionType: 'INDIVIDUAL',
       sessionDuration: 60,
       subjective: 'João apresentou dificuldade de concentração durante atividades escolares',
       objective: 'João demonstrou dificuldade para manter foco em atividades escolares',
       assessment: 'TDAH com prejuízo na atenção sustentada',
       plan: 'Continuar exercícios de concentração e coordenação motora',
       notes: 'Cliente respondeu bem aos exercícios propostos',
       nextSessionDate: getFutureDate(1, 14)
    },
  });
  console.log('Prontuário 1 criado:', medicalRecord1);

  const medicalRecord2 = await prisma.medicalRecord.upsert({
    where: { id: 2 },
    update: {},
    create: {
      clientId: client2.id,
      therapistId: therapist3.id,
      bookingId: pastBooking2.id,
      sessionDate: getPastDate(14, 10),
      sessionType: 'INDIVIDUAL',
      sessionDuration: 45,
      subjective: 'Maria tem dificuldade para pronunciar algumas consoantes',
      objective: 'Maria demonstrou dificuldade na articulação de consoantes específicas',
      assessment: 'Atraso no desenvolvimento da fala',
      plan: 'Exercícios de articulação e respiração',
      notes: 'Cliente demonstrou interesse nas atividades',
      nextSessionDate: getFutureDate(2, 10)
    },
  });
  console.log('Prontuário 2 criado:', medicalRecord2);

  const medicalRecord3 = await prisma.medicalRecord.upsert({
    where: { id: 3 },
    update: {},
    create: {
      clientId: client3.id,
      therapistId: therapist2.id,
      bookingId: pastBooking3.id,
      sessionDate: getPastDate(7, 16),
      sessionType: 'INDIVIDUAL',
      sessionDuration: 60,
      subjective: 'Pedro apresentou comportamentos repetitivos e dificuldade de interação',
      objective: 'Pedro demonstrou comportamentos repetitivos e dificuldade de interação social',
      assessment: 'TEA com prejuízo na comunicação social',
      plan: 'Trabalhar habilidades sociais e comunicação',
      notes: 'Cliente respondeu bem ao uso de pictogramas',
      nextSessionDate: getFutureDate(1, 16)
    },
  });
  console.log('Prontuário 3 criado:', medicalRecord3);

  const medicalRecord4 = await prisma.medicalRecord.upsert({
    where: { id: 4 },
    update: {},
    create: {
      clientId: client4.id,
      therapistId: therapist.id,
      bookingId: pastBooking4.id,
      sessionDate: getPastDate(14, 9),
      sessionType: 'INDIVIDUAL',
      sessionDuration: 45,
      subjective: 'Sofia apresentou dificuldade de coordenação motora',
      objective: 'Sofia demonstrou dificuldade na coordenação motora fina e grossa',
      assessment: 'Paralisia cerebral leve com prejuízo motor',
      plan: 'Exercícios de coordenação e equilíbrio',
      notes: 'Cliente demonstrou melhora na marcha',
      nextSessionDate: getFutureDate(3, 9)
    },
  });
  console.log('Prontuário 4 criado:', medicalRecord4);

  const medicalRecord5 = await prisma.medicalRecord.upsert({
    where: { id: 5 },
    update: {},
    create: {
      clientId: client5.id,
      therapistId: therapist.id,
      bookingId: pastBooking5.id,
      sessionDate: getPastDate(21, 16),
      sessionType: 'INDIVIDUAL',
      sessionDuration: 50,
      subjective: 'Ana relatou ansiedade em situações sociais',
      objective: 'Ana demonstrou sintomas de ansiedade em situações sociais',
      assessment: 'Fobia social com sintomas de ansiedade',
      plan: 'Técnicas de exposição gradual e relaxamento',
      notes: 'Cliente demonstrou progresso na exposição social',
      nextSessionDate: getFutureDate(3, 16)
    },
  });
  console.log('Prontuário 5 criado:', medicalRecord5);

  const medicalRecord6 = await prisma.medicalRecord.upsert({
    where: { id: 6 },
    update: {},
    create: {
      clientId: client6.id,
      therapistId: therapist.id,
      bookingId: pastBooking6.id,
      sessionDate: getPastDate(28, 11),
      sessionType: 'INDIVIDUAL',
      sessionDuration: 60,
      subjective: 'Roberto relatou pesadelos e insônia',
      objective: 'Roberto demonstrou sintomas de estresse pós-traumático',
      assessment: 'Estresse pós-traumático com sintomas de ansiedade',
      plan: 'EMDR e técnicas de processamento do trauma',
      notes: 'Cliente demonstrou abertura para o tratamento',
      nextSessionDate: getFutureDate(1, 11)
    },
  });
  console.log('Prontuário 6 criado:', medicalRecord6);

  const notification1 = await prisma.notification.upsert({
    where: { id: 1 },
    update: {},
    create: {
      type: 'BOOKING_CREATED',
      title: 'Novo Agendamento',
      message: 'Novo agendamento marcado para João Silva com Dra. Ana Santos em Sala de Terapia Ocupacional no dia 15/01/2024 às 14:00.',
      priority: 'NORMAL',
      guardianId: guardian1.id,
      bookingId: childBooking1.id,
      clientId: client1.id,
      therapistId: therapist2.id,
      isRead: false
    },
  });
  console.log('Notificação 1 criada:', notification1);

  const notification2 = await prisma.notification.upsert({
    where: { id: 2 },
    update: {},
    create: {
      type: 'BOOKING_REMINDER',
      title: 'Lembrete de Agendamento',
      message: 'Lembrete: amanhã às 14:00 você tem agendamento com Dra. Ana Santos em Sala de Terapia Ocupacional.',
      priority: 'HIGH',
      guardianId: guardian1.id,
      bookingId: childBooking1.id,
      clientId: client1.id,
      therapistId: therapist2.id,
      isRead: false
    },
  });
  console.log('Notificação 2 criada:', notification2);

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



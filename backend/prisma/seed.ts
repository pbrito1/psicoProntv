import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Função para gerar datas futuras para agendamentos
function getFutureDate(daysFromNow: number, hour: number = 9): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, 0, 0, 0);
  return date;
}

// Função para gerar datas passadas para histórico
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

  // Criar clientes de exemplo
  const client1 = await prisma.client.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Maria Silva Santos',
      email: 'maria.silva@email.com',
      phone: '(11) 98888-7777',
      birthDate: new Date('1990-05-15'),
      address: 'Rua das Flores, 123 - Vila Madalena, São Paulo - SP',
      emergencyContact: 'João Silva (Pai)',
      emergencyPhone: '(11) 97777-6666',
      medicalHistory: 'Ansiedade e estresse no trabalho',
      currentMedications: 'Nenhum',
      allergies: 'Nenhuma',
    },
  });
  console.log('Cliente 1 criado:', client1);

  const client2 = await prisma.client.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Pedro Oliveira Costa',
      email: 'pedro.costa@email.com',
      phone: '(11) 96666-5555',
      birthDate: new Date('1985-08-22'),
      address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
      emergencyContact: 'Ana Costa (Esposa)',
      emergencyPhone: '(11) 95555-4444',
      medicalHistory: 'Depressão leve',
      currentMedications: 'Nenhum',
      allergies: 'Nenhuma',
    },
  });
  console.log('Cliente 2 criado:', client2);

  const client3 = await prisma.client.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: 'Ana Beatriz Ferreira',
      email: 'ana.ferreira@email.com',
      phone: '(11) 94444-3333',
      birthDate: new Date('1995-03-10'),
      address: 'Rua Augusta, 500 - Consolação, São Paulo - SP',
      emergencyContact: 'Carlos Ferreira (Irmão)',
      emergencyPhone: '(11) 93333-2222',
      medicalHistory: 'Fobia social',
      currentMedications: 'Nenhum',
      allergies: 'Nenhuma',
    },
  });
  console.log('Cliente 3 criado:', client3);

  const client4 = await prisma.client.upsert({
    where: { id: 4 },
    update: {},
    create: {
      name: 'Roberto Almeida Lima',
      email: 'roberto.lima@email.com',
      phone: '(11) 92222-1111',
      birthDate: new Date('1978-12-03'),
      address: 'Rua Oscar Freire, 200 - Jardins, São Paulo - SP',
      emergencyContact: 'Lucia Lima (Filha)',
      emergencyPhone: '(11) 91111-0000',
      medicalHistory: 'Estresse pós-traumático',
      currentMedications: 'Nenhum',
      allergies: 'Nenhuma',
    },
  });
  console.log('Cliente 4 criado:', client4);

  // Criar agendamentos de exemplo
  const booking1 = await prisma.booking.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: 'Sessão Individual - Maria Silva',
      start: getFutureDate(1, 9), // Amanhã às 9h
      end: getFutureDate(1, 10), // Amanhã às 10h
      status: 'CONFIRMED',
      description: 'Sessão de terapia para ansiedade e estresse no trabalho',
      roomId: sala1.id,
      therapistId: therapist.id,
      clientId: client1.id,
    },
  });
  console.log('Agendamento 1 criado:', booking1);

  const booking2 = await prisma.booking.upsert({
    where: { id: 2 },
    update: {},
    create: {
      title: 'Sessão Individual - Pedro Costa',
      start: getFutureDate(2, 14), // Depois de amanhã às 14h
      end: getFutureDate(2, 15), // Depois de amanhã às 15h
      status: 'PENDING',
      description: 'Sessão de terapia para depressão leve',
      roomId: sala1.id,
      therapistId: therapist.id,
      clientId: client2.id,
    },
  });
  console.log('Agendamento 2 criado:', booking2);

  const booking3 = await prisma.booking.upsert({
    where: { id: 3 },
    update: {},
    create: {
      title: 'Sessão Individual - Ana Ferreira',
      start: getFutureDate(3, 16), // Em 3 dias às 16h
      end: getFutureDate(3, 17), // Em 3 dias às 17h
      status: 'CONFIRMED',
      description: 'Sessão de terapia para fobia social',
      roomId: sala1.id,
      therapistId: therapist.id,
      clientId: client3.id,
    },
  });
  console.log('Agendamento 3 criado:', booking3);

  const booking4 = await prisma.booking.upsert({
    where: { id: 4 },
    update: {},
    create: {
      title: 'Sessão Individual - Roberto Lima',
      start: getFutureDate(1, 11), // Amanhã às 11h
      end: getFutureDate(1, 12), // Amanhã às 12h
      status: 'CONFIRMED',
      description: 'Sessão intensiva para estresse pós-traumático',
      roomId: sala1.id,
      therapistId: therapist.id,
      clientId: client4.id,
    },
  });
  console.log('Agendamento 4 criado:', booking4);

  // Criar agendamento em grupo
  const groupBooking = await prisma.booking.upsert({
    where: { id: 5 },
    update: {},
    create: {
      title: 'Terapia em Grupo - Ansiedade',
      start: getFutureDate(5, 19), // Em 5 dias às 19h
      end: getFutureDate(5, 21), // Em 5 dias às 21h
      status: 'PENDING',
      description: 'Sessão de terapia em grupo para ansiedade',
      roomId: sala2.id,
      therapistId: therapist.id,
      // Não vinculado a cliente específico (grupo)
    },
  });
  console.log('Agendamento em Grupo criado:', groupBooking);

  // Criar agendamentos passados (histórico)
  const pastBooking1 = await prisma.booking.upsert({
    where: { id: 6 },
    update: {},
    create: {
      title: 'Sessão Individual - Maria Silva (Histórico)',
      start: getPastDate(7, 9), // Há 7 dias às 9h
      end: getPastDate(7, 10), // Há 7 dias às 10h
      status: 'CONFIRMED',
      description: 'Sessão anterior de terapia para ansiedade',
      roomId: sala1.id,
      therapistId: therapist.id,
      clientId: client1.id,
    },
  });
  console.log('Agendamento Histórico 1 criado:', pastBooking1);

  const pastBooking2 = await prisma.booking.upsert({
    where: { id: 7 },
    update: {},
    create: {
      title: 'Sessão Individual - Pedro Costa (Histórico)',
      start: getPastDate(14, 14), // Há 14 dias às 14h
      end: getPastDate(14, 15), // Há 14 dias às 15h
      status: 'CONFIRMED',
      description: 'Sessão anterior de terapia para depressão',
      roomId: sala1.id,
      therapistId: therapist.id,
      clientId: client2.id,
    },
  });
  console.log('Agendamento Histórico 2 criado:', pastBooking2);

  // Criar prontuários médicos de exemplo
  const medicalRecord1 = await prisma.medicalRecord.upsert({
    where: { id: 1 },
    update: {},
    create: {
      clientId: client1.id,
      therapistId: therapist.id,
      sessionDate: getPastDate(7, 9), // Há 7 dias às 9h
      sessionType: 'INDIVIDUAL',
      sessionDuration: 60,
      subjective: 'Paciente relata ansiedade intensa no trabalho, dificuldade para dormir e irritabilidade',
      objective: 'Paciente apresenta sinais de estresse: mãos trêmulas, respiração acelerada, fala rápida',
      assessment: 'Ansiedade generalizada com sintomas de estresse ocupacional',
      plan: 'Técnicas de respiração, mindfulness e estratégias de enfrentamento do estresse',
      notes: 'Paciente respondeu bem às técnicas de relaxamento',
      nextSessionDate: getFutureDate(1, 9), // Amanhã às 9h
      bookingId: pastBooking1.id,
    },
  });
  console.log('Prontuário 1 criado:', medicalRecord1);

  const medicalRecord2 = await prisma.medicalRecord.upsert({
    where: { id: 2 },
    update: {},
    create: {
      clientId: client2.id,
      therapistId: therapist.id,
      sessionDate: getPastDate(14, 14), // Há 14 dias às 14h
      sessionType: 'INDIVIDUAL',
      sessionDuration: 60,
      subjective: 'Paciente relata tristeza persistente, falta de energia e perda de interesse',
      objective: 'Paciente apresenta postura fechada, fala monótona e expressão facial triste',
      assessment: 'Depressão leve com sintomas de anedonia e fadiga',
      plan: 'Terapia cognitivo-comportamental, exercícios físicos e agenda de atividades',
      notes: 'Paciente demonstrou melhora na motivação após exercícios',
      nextSessionDate: getFutureDate(2, 14), // Depois de amanhã às 14h
      bookingId: pastBooking2.id,
    },
  });
  console.log('Prontuário 2 criado:', medicalRecord2);

  const medicalRecord3 = await prisma.medicalRecord.upsert({
    where: { id: 3 },
    update: {},
    create: {
      clientId: client3.id,
      therapistId: therapist.id,
      sessionDate: getPastDate(21, 16), // Há 21 dias às 16h
      sessionType: 'INDIVIDUAL',
      sessionDuration: 60,
      subjective: 'Paciente relata medo intenso de situações sociais e isolamento',
      objective: 'Paciente apresenta sudorese, taquicardia e evita contato visual',
      assessment: 'Fobia social com sintomas de ansiedade em situações interpessoais',
      plan: 'Exposição gradual, técnicas de relaxamento e habilidades sociais',
      notes: 'Paciente iniciou processo de exposição com sucesso',
      nextSessionDate: getFutureDate(3, 16), // Em 3 dias às 16h
    },
  });
  console.log('Prontuário 3 criado:', medicalRecord3);

  const medicalRecord4 = await prisma.medicalRecord.upsert({
    where: { id: 4 },
    update: {},
    create: {
      clientId: client4.id,
      therapistId: therapist.id,
      sessionDate: getPastDate(28, 11), // Há 28 dias às 11h
      sessionType: 'INDIVIDUAL',
      sessionDuration: 90,
      subjective: 'Paciente relata flashbacks, pesadelos e hipervigilância',
      objective: 'Paciente apresenta tensão muscular, sobressaltos e dificuldade de concentração',
      assessment: 'Estresse pós-traumático com sintomas de reexperiência e hiperexcitação',
      plan: 'EMDR, técnicas de grounding e estratégias de enfrentamento',
      notes: 'Paciente demonstrou redução significativa nos sintomas de hipervigilância',
      nextSessionDate: getFutureDate(1, 11), // Amanhã às 11h
    },
  });
  console.log('Prontuário 4 criado:', medicalRecord4);

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



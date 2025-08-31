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

  // Criar mais terapeutas para variedade
  const therapist2 = await prisma.user.upsert({
    where: { email: 'ana.santos@psicopront.com' },
    update: {},
    create: {
      email: 'ana.santos@psicopront.com',
      name: 'Dra. Ana Santos',
      phone: '(11) 88888-7777',
      specialty: 'Terapia Ocupacional',
      passwordHash: therapistPassword,
      role: 'THERAPIST',
    },
  });
  console.log('Terapeuta 2 criado:', therapist2);

  const therapist3 = await prisma.user.upsert({
    where: { email: 'carlos.mendes@psicopront.com' },
    update: {},
    create: {
      email: 'carlos.mendes@psicopront.com',
      name: 'Dr. Carlos Mendes',
      phone: '(11) 77777-6666',
      specialty: 'Fonoaudiologia',
      passwordHash: therapistPassword,
      role: 'THERAPIST',
    },
  });
  console.log('Terapeuta 3 criado:', therapist3);

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

  const sala3 = await prisma.room.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: 'Sala 3 - Terapia Ocupacional',
      capacity: 4,
      resources: ['Ar condicionado', 'Materiais de terapia ocupacional', 'Espelhos'],
      openingTime: '07:00',
      closingTime: '20:00',
      description: 'Sala especializada em terapia ocupacional',
    },
  });
  console.log('Sala 3 criada:', sala3);

  // Criar clientes de exemplo (crianças)
  const child1 = await prisma.client.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'João Silva Santos',
      email: 'joao.silva@email.com',
      phone: '(11) 98888-7777',
      birthDate: new Date('2018-05-15'),
      address: 'Rua das Flores, 123 - Vila Madalena, São Paulo - SP',
      emergencyContact: 'Maria Silva (Mãe)',
      emergencyPhone: '(11) 97777-6666',
      medicalHistory: 'Dificuldades de concentração e interação social',
      currentMedications: 'Nenhum',
      allergies: 'Nenhuma',
    },
  });
  console.log('Criança 1 criada:', child1);

  const child2 = await prisma.client.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Maria Silva Santos',
      email: 'maria.silva@email.com',
      phone: '(11) 96666-5555',
      birthDate: new Date('2020-03-22'),
      address: 'Rua das Flores, 123 - Vila Madalena, São Paulo - SP',
      emergencyContact: 'João Silva (Pai)',
      emergencyPhone: '(11) 95555-4444',
      medicalHistory: 'Atraso no desenvolvimento da fala',
      currentMedications: 'Nenhum',
      allergies: 'Nenhuma',
    },
  });
  console.log('Criança 2 criada:', child2);

  // Adicionar mais crianças para teste
  const child3 = await prisma.client.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: 'Pedro Oliveira Costa',
      email: 'pedro.costa@email.com',
      phone: '(11) 94444-3333',
      birthDate: new Date('2019-08-10'),
      address: 'Rua Augusta, 500 - Consolação, São Paulo - SP',
      emergencyContact: 'Lucia Costa (Mãe)',
      emergencyPhone: '(11) 93333-2222',
      medicalHistory: 'Transtorno do espectro autista (TEA)',
      currentMedications: 'Nenhum',
      allergies: 'Nenhuma',
    },
  });
  console.log('Criança 3 criada:', child3);

  const child4 = await prisma.client.upsert({
    where: { id: 4 },
    update: {},
    create: {
      name: 'Sofia Rodrigues Lima',
      email: 'sofia.lima@email.com',
      phone: '(11) 92222-1111',
      birthDate: new Date('2017-12-03'),
      address: 'Rua Oscar Freire, 200 - Jardins, São Paulo - SP',
      emergencyContact: 'Roberto Lima (Pai)',
      emergencyPhone: '(11) 91111-0000',
      medicalHistory: 'Dificuldades de coordenação motora',
      currentMedications: 'Nenhum',
      allergies: 'Nenhuma',
    },
  });
  console.log('Criança 4 criada:', child4);

  // Clientes adultos (não crianças)
  const client5 = await prisma.client.upsert({
    where: { id: 5 },
    update: {},
    create: {
      name: 'Ana Beatriz Ferreira',
      email: 'ana.ferreira@email.com',
      phone: '(11) 90000-9999',
      birthDate: new Date('1995-03-10'),
      address: 'Rua Augusta, 500 - Consolação, São Paulo - SP',
      emergencyContact: 'Carlos Ferreira (Irmão)',
      emergencyPhone: '(11) 99999-8888',
      medicalHistory: 'Fobia social',
      currentMedications: 'Nenhum',
      allergies: 'Nenhuma',
    },
  });
  console.log('Cliente 5 criado:', client5);

  const client6 = await prisma.client.upsert({
    where: { id: 6 },
    update: {},
    create: {
      name: 'Roberto Almeida Lima',
      email: 'roberto.lima@email.com',
      phone: '(11) 98888-7777',
      birthDate: new Date('1978-12-03'),
      address: 'Rua Oscar Freire, 200 - Jardins, São Paulo - SP',
      emergencyContact: 'Lucia Lima (Filha)',
      emergencyPhone: '(11) 97777-6666',
      medicalHistory: 'Estresse pós-traumático',
      currentMedications: 'Nenhum',
      allergies: 'Nenhuma',
    },
  });
  console.log('Cliente 6 criado:', client6);

  // Criar guardiões de exemplo
  const guardianPassword = await bcrypt.hash('guardian123', 10);
  const guardian1 = await prisma.guardian.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Maria Silva Santos',
      email: 'maria.silva@email.com',
      phone: '(11) 97777-6666',
      cpf: '123.456.789-00',
      relationship: 'Mãe',
      isPrimary: true,
      passwordHash: guardianPassword,
      canViewRecords: true,
      canBookSessions: true,
      canCancelSessions: false,
      canViewBilling: false,
    },
  });
  console.log('Guardião 1 criado:', guardian1);

  const guardian2 = await prisma.guardian.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'João Silva Santos',
      email: 'joao.silva@email.com',
      phone: '(11) 96666-5555',
      cpf: '987.654.321-00',
      relationship: 'Pai',
      isPrimary: false,
      passwordHash: guardianPassword,
      canViewRecords: true,
      canBookSessions: true,
      canCancelSessions: false,
      canViewBilling: false,
    },
  });
  console.log('Guardião 2 criado:', guardian2);

  // Adicionar mais guardiões para teste
  const guardian3 = await prisma.guardian.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: 'Lucia Costa Oliveira',
      email: 'lucia.costa@email.com',
      phone: '(11) 95555-4444',
      cpf: '111.222.333-44',
      relationship: 'Mãe',
      isPrimary: true,
      passwordHash: guardianPassword,
      canViewRecords: true,
      canBookSessions: true,
      canCancelSessions: false,
      canViewBilling: false,
    },
  });
  console.log('Guardião 3 criado:', guardian3);

  const guardian4 = await prisma.guardian.upsert({
    where: { id: 4 },
    update: {},
    create: {
      name: 'Roberto Lima Rodrigues',
      email: 'roberto.lima@email.com',
      phone: '(11) 94444-3333',
      cpf: '555.666.777-88',
      relationship: 'Pai',
      isPrimary: true,
      passwordHash: guardianPassword,
      canViewRecords: true,
      canBookSessions: true,
      canCancelSessions: false,
      canViewBilling: false,
    },
  });
  console.log('Guardião 4 criado:', guardian4);

  // Vincular guardiões às crianças
  await prisma.guardian.update({
    where: { id: guardian1.id },
    data: {
      clients: {
        connect: [{ id: child1.id }, { id: child2.id }],
      },
    },
  });

  await prisma.guardian.update({
    where: { id: guardian2.id },
    data: {
      clients: {
        connect: [{ id: child1.id }, { id: child2.id }],
      },
    },
  });

  await prisma.guardian.update({
    where: { id: guardian3.id },
    data: {
      clients: {
        connect: [{ id: child3.id }],
      },
    },
  });

  await prisma.guardian.update({
    where: { id: guardian4.id },
    data: {
      clients: {
        connect: [{ id: child4.id }],
      },
    },
  });

  console.log('Guardiões vinculados às crianças');

  // Criar agendamentos de exemplo para crianças
  const childBooking1 = await prisma.booking.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: 'Sessão de Terapia Ocupacional - João Silva',
      start: getFutureDate(1, 14), // Amanhã às 14h
      end: getFutureDate(1, 15), // Amanhã às 15h
      status: 'CONFIRMED',
      description: 'Sessão de terapia ocupacional para melhorar concentração',
      roomId: sala3.id,
      therapistId: therapist2.id,
      clientId: child1.id,
    },
  });
  console.log('Agendamento criança 1 criado:', childBooking1);

  const childBooking2 = await prisma.booking.upsert({
    where: { id: 2 },
    update: {},
    create: {
      title: 'Avaliação Fonoaudiológica - Maria Silva',
      start: getFutureDate(2, 10), // Depois de amanhã às 10h
      end: getFutureDate(2, 11), // Depois de amanhã às 11h
      status: 'PENDING',
      description: 'Avaliação para desenvolvimento da fala',
      roomId: sala1.id,
      therapistId: therapist3.id,
      clientId: child2.id,
    },
  });
  console.log('Agendamento criança 2 criado:', childBooking2);

  const childBooking3 = await prisma.booking.upsert({
    where: { id: 3 },
    update: {},
    create: {
      title: 'Sessão de Terapia Ocupacional - Pedro Costa',
      start: getFutureDate(1, 16), // Amanhã às 16h
      end: getFutureDate(1, 17), // Amanhã às 17h
      status: 'CONFIRMED',
      description: 'Sessão de terapia ocupacional para TEA',
      roomId: sala3.id,
      therapistId: therapist2.id,
      clientId: child3.id,
    },
  });
  console.log('Agendamento criança 3 criado:', childBooking3);

  const childBooking4 = await prisma.booking.upsert({
    where: { id: 4 },
    update: {},
    create: {
      title: 'Sessão de Fisioterapia - Sofia Lima',
      start: getFutureDate(3, 9), // Em 3 dias às 9h
      end: getFutureDate(3, 10), // Em 3 dias às 10h
      status: 'CONFIRMED',
      description: 'Sessão de fisioterapia para coordenação motora',
      roomId: sala1.id,
      therapistId: therapist.id,
      clientId: child4.id,
    },
  });
  console.log('Agendamento criança 4 criado:', childBooking4);

  // Agendamentos para clientes adultos
  const booking5 = await prisma.booking.upsert({
    where: { id: 5 },
    update: {},
    create: {
      title: 'Sessão Individual - Ana Ferreira',
      start: getFutureDate(3, 16), // Em 3 dias às 16h
      end: getFutureDate(3, 17), // Em 3 dias às 17h
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
      start: getFutureDate(1, 11), // Amanhã às 11h
      end: getFutureDate(1, 12), // Amanhã às 12h
      status: 'CONFIRMED',
      description: 'Sessão intensiva para estresse pós-traumático',
      roomId: sala1.id,
      therapistId: therapist.id,
      clientId: client6.id,
    },
  });
  console.log('Agendamento 6 criado:', booking6);

  // Criar agendamento em grupo
  const groupBooking = await prisma.booking.upsert({
    where: { id: 7 },
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

  // Criar agendamentos passados (histórico) para crianças
  const pastChildBooking1 = await prisma.booking.upsert({
    where: { id: 8 },
    update: {},
    create: {
      title: 'Sessão de Terapia Ocupacional - João Silva (Histórico)',
      start: getPastDate(7, 14), // Há 7 dias às 14h
      end: getPastDate(7, 15), // Há 7 dias às 15h
      status: 'CONFIRMED',
      description: 'Sessão anterior de terapia ocupacional',
      roomId: sala3.id,
      therapistId: therapist2.id,
      clientId: child1.id,
    },
  });
  console.log('Agendamento Histórico Criança 1 criado:', pastChildBooking1);

  const pastChildBooking2 = await prisma.booking.upsert({
    where: { id: 9 },
    update: {},
    create: {
      title: 'Avaliação Fonoaudiológica - Maria Silva (Histórico)',
      start: getPastDate(14, 10), // Há 14 dias às 10h
      end: getPastDate(14, 11), // Há 14 dias às 11h
      status: 'CONFIRMED',
      description: 'Avaliação anterior para desenvolvimento da fala',
      roomId: sala1.id,
      therapistId: therapist3.id,
      clientId: child2.id,
    },
  });
  console.log('Agendamento Histórico Criança 2 criado:', pastChildBooking2);

  const pastChildBooking3 = await prisma.booking.upsert({
    where: { id: 10 },
    update: {},
    create: {
      title: 'Sessão de Terapia Ocupacional - Pedro Costa (Histórico)',
      start: getPastDate(7, 16), // Há 7 dias às 16h
      end: getPastDate(7, 17), // Há 7 dias às 17h
      status: 'CONFIRMED',
      description: 'Sessão anterior de terapia ocupacional para TEA',
      roomId: sala3.id,
      therapistId: therapist2.id,
      clientId: child3.id,
    },
  });
  console.log('Agendamento Histórico Criança 3 criado:', pastChildBooking3);

  const pastChildBooking4 = await prisma.booking.upsert({
    where: { id: 11 },
    update: {},
    create: {
      title: 'Sessão de Fisioterapia - Sofia Lima (Histórico)',
      start: getPastDate(14, 9), // Há 14 dias às 9h
      end: getPastDate(14, 10), // Há 14 dias às 10h
      status: 'CONFIRMED',
      description: 'Sessão anterior de fisioterapia para coordenação motora',
      roomId: sala1.id,
      therapistId: therapist.id,
      clientId: child4.id,
    },
  });
  console.log('Agendamento Histórico Criança 4 criado:', pastChildBooking4);

  // Agendamentos históricos para clientes adultos
  const pastBooking5 = await prisma.booking.upsert({
    where: { id: 12 },
    update: {},
    create: {
      title: 'Sessão Individual - Ana Ferreira (Histórico)',
      start: getPastDate(21, 16), // Há 21 dias às 16h
      end: getPastDate(21, 17), // Há 21 dias às 17h
      status: 'CONFIRMED',
      description: 'Sessão anterior de terapia para fobia social',
      roomId: sala1.id,
      therapistId: therapist.id,
      clientId: client5.id,
    },
  });
  console.log('Agendamento Histórico 5 criado:', pastBooking5);

  const pastBooking6 = await prisma.booking.upsert({
    where: { id: 13 },
    update: {},
    create: {
      title: 'Sessão Individual - Roberto Lima (Histórico)',
      start: getPastDate(28, 11), // Há 28 dias às 11h
      end: getPastDate(28, 12), // Há 28 dias às 12h
      status: 'CONFIRMED',
      description: 'Sessão anterior para estresse pós-traumático',
      roomId: sala1.id,
      therapistId: therapist.id,
      clientId: client6.id,
    },
  });
  console.log('Agendamento Histórico 6 criado:', pastBooking6);

  // Criar prontuários médicos de exemplo para crianças
  const childMedicalRecord1 = await prisma.medicalRecord.upsert({
    where: { id: 1 },
    update: {},
    create: {
      clientId: child1.id,
      therapistId: therapist2.id,
      sessionDate: getPastDate(7, 14), // Há 7 dias às 14h
      sessionType: 'INDIVIDUAL',
      sessionDuration: 60,
      subjective: 'João demonstrou melhora na concentração e interação social',
      objective: 'Participou ativamente das atividades propostas, manteve foco por períodos mais longos',
      assessment: 'Progresso significativo nas habilidades sociais e cognitivas',
      plan: 'Continuar com exercícios de concentração e atividades em grupo',
      notes: 'Paciente respondeu bem às técnicas de terapia ocupacional',
      nextSessionDate: getFutureDate(1, 14), // Amanhã às 14h
      bookingId: pastChildBooking1.id,
    },
  });
  console.log('Prontuário Criança 1 criado:', childMedicalRecord1);

  const childMedicalRecord2 = await prisma.medicalRecord.upsert({
    where: { id: 2 },
    update: {},
    create: {
      clientId: child2.id,
      therapistId: therapist3.id,
      sessionDate: getPastDate(14, 10), // Há 14 dias às 10h
      sessionType: 'INDIVIDUAL',
      sessionDuration: 60,
      subjective: 'Maria apresentou melhora na articulação de palavras simples',
      objective: 'Conseguiu pronunciar corretamente 70% das palavras do teste',
      assessment: 'Progresso no desenvolvimento da fala e linguagem',
      plan: 'Continuar exercícios de articulação e introduzir palavras mais complexas',
      notes: 'Paciente demonstrou motivação e interesse nas atividades',
      nextSessionDate: getFutureDate(2, 10), // Depois de amanhã às 10h
      bookingId: pastChildBooking2.id,
    },
  });
  console.log('Prontuário Criança 2 criado:', childMedicalRecord2);

  const childMedicalRecord3 = await prisma.medicalRecord.upsert({
    where: { id: 3 },
    update: {},
    create: {
      clientId: child3.id,
      therapistId: therapist2.id,
      sessionDate: getPastDate(7, 16), // Há 7 dias às 16h
      sessionType: 'INDIVIDUAL',
      sessionDuration: 60,
      subjective: 'Pedro demonstrou interesse nas atividades sensoriais',
      objective: 'Manteve contato visual por períodos mais longos e respondeu a comandos simples',
      assessment: 'Melhora na interação social e redução de comportamentos repetitivos',
      plan: 'Continuar atividades sensoriais e introduzir jogos de interação social',
      notes: 'Paciente TEA respondeu bem às técnicas de terapia ocupacional',
      nextSessionDate: getFutureDate(1, 16), // Amanhã às 16h
      bookingId: pastChildBooking3.id,
    },
  });
  console.log('Prontuário Criança 3 criado:', childMedicalRecord3);

  const childMedicalRecord4 = await prisma.medicalRecord.upsert({
    where: { id: 4 },
    update: {},
    create: {
      clientId: child4.id,
      therapistId: therapist.id,
      sessionDate: getPastDate(14, 9), // Há 14 dias às 9h
      sessionType: 'INDIVIDUAL',
      sessionDuration: 45,
      subjective: 'Sofia apresentou melhora na coordenação motora fina',
      objective: 'Conseguiu realizar exercícios de coordenação com maior precisão',
      assessment: 'Progresso na coordenação motora e equilíbrio',
      plan: 'Continuar exercícios de coordenação e introduzir atividades mais complexas',
      notes: 'Paciente demonstrou determinação e melhorou a confiança',
      nextSessionDate: getFutureDate(3, 9), // Em 3 dias às 9h
      bookingId: pastChildBooking4.id,
    },
  });
  console.log('Prontuário Criança 4 criado:', childMedicalRecord4);

  // Prontuários para clientes adultos
  const medicalRecord5 = await prisma.medicalRecord.upsert({
    where: { id: 5 },
    update: {},
    create: {
      clientId: client5.id,
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
      bookingId: pastBooking5.id,
    },
  });
  console.log('Prontuário 5 criado:', medicalRecord5);

  const medicalRecord6 = await prisma.medicalRecord.upsert({
    where: { id: 6 },
    update: {},
    create: {
      clientId: client6.id,
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
      bookingId: pastBooking6.id,
    },
  });
  console.log('Prontuário 6 criado:', medicalRecord6);

  console.log('Seed concluído!');
  console.log('Dados de teste para o Portal dos Pais:');
  console.log('- Guardiões criados:', await prisma.guardian.count());
  console.log('- Crianças criadas:', await prisma.client.count());
  console.log('- Agendamentos criados:', await prisma.booking.count());
  console.log('- Prontuários criados:', await prisma.medicalRecord.count());
  console.log('');
  console.log('Credenciais para teste:');
  console.log('Guardião 1 (Maria Silva): maria.silva@email.com / guardian123');
  console.log('Guardião 2 (João Silva): joao.silva@email.com / guardian123');
  console.log('Guardião 3 (Lucia Costa): lucia.costa@email.com / guardian123');
  console.log('Guardião 4 (Roberto Lima): roberto.lima@email.com / guardian123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



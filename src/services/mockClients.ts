import type { Client, MedicalRecord } from './clients';

// Dados mock para clientes
export const mockClients: Client[] = [
  {
    id: 1,
    name: 'Maria Silva Santos',
    email: 'maria.silva@email.com',
    phone: '(11) 99999-1111',
    birthDate: '1985-03-15',
    address: 'Rua das Flores, 123 - São Paulo, SP',
    emergencyContact: 'João Silva',
    emergencyPhone: '(11) 88888-1111',
    medicalHistory: 'Histórico de ansiedade e depressão. Sem outras condições médicas significativas.',
    currentMedications: 'Sertralina 50mg (1x ao dia)',
    allergies: 'Nenhuma alergia conhecida',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    name: 'Carlos Eduardo Oliveira',
    email: 'carlos.oliveira@email.com',
    phone: '(11) 99999-2222',
    birthDate: '1990-07-22',
    address: 'Av. Paulista, 456 - São Paulo, SP',
    emergencyContact: 'Ana Oliveira',
    emergencyPhone: '(11) 88888-2222',
    medicalHistory: 'Transtorno de estresse pós-traumático. Sem outras condições médicas.',
    currentMedications: 'Nenhum medicamento',
    allergies: 'Penicilina',
    createdAt: '2024-02-10T14:30:00Z',
    updatedAt: '2024-02-10T14:30:00Z'
  },
  {
    id: 3,
    name: 'Ana Paula Costa',
    email: 'ana.costa@email.com',
    phone: '(11) 99999-3333',
    birthDate: '1978-11-08',
    address: 'Rua Augusta, 789 - São Paulo, SP',
    emergencyContact: 'Pedro Costa',
    emergencyPhone: '(11) 88888-3333',
    medicalHistory: 'Transtorno bipolar tipo II. Hipertensão controlada.',
    currentMedications: 'Lítio 300mg (2x ao dia), Losartana 50mg (1x ao dia)',
    allergies: 'Nenhuma alergia conhecida',
    createdAt: '2024-01-20T09:15:00Z',
    updatedAt: '2024-01-20T09:15:00Z'
  },
  {
    id: 4,
    name: 'Roberto Almeida',
    email: 'roberto.almeida@email.com',
    phone: '(11) 99999-4444',
    birthDate: '1982-05-12',
    address: 'Rua Oscar Freire, 321 - São Paulo, SP',
    emergencyContact: 'Lucia Almeida',
    emergencyPhone: '(11) 88888-4444',
    medicalHistory: 'Transtorno de ansiedade social. Diabetes tipo 2 controlada.',
    currentMedications: 'Metformina 500mg (2x ao dia)',
    allergies: 'Sulfa',
    createdAt: '2024-03-05T16:45:00Z',
    updatedAt: '2024-03-05T16:45:00Z'
  },
  {
    id: 5,
    name: 'Fernanda Lima',
    email: 'fernanda.lima@email.com',
    phone: '(11) 99999-5555',
    birthDate: '1995-09-30',
    address: 'Rua Haddock Lobo, 654 - São Paulo, SP',
    emergencyContact: 'Marcos Lima',
    emergencyPhone: '(11) 88888-5555',
    medicalHistory: 'Transtorno alimentar (anorexia). Sem outras condições médicas.',
    currentMedications: 'Nenhum medicamento',
    allergies: 'Nenhuma alergia conhecida',
    createdAt: '2024-02-28T11:20:00Z',
    updatedAt: '2024-02-28T11:20:00Z'
  }
];

// Dados mock para prontuários
export const mockMedicalRecords: MedicalRecord[] = [
  {
    id: 1,
    clientId: 1,
    therapistId: 1,
    sessionDate: '2024-08-15',
    sessionType: 'INDIVIDUAL',
    sessionDuration: 50,
    subjective: 'Cliente relata aumento da ansiedade nos últimos dias, especialmente no trabalho. Dificuldade para dormir e concentração reduzida.',
    objective: 'Cliente apresenta-se tensa, com fala acelerada e inquietação motora. Choro durante a sessão ao falar sobre pressão no trabalho.',
    assessment: 'Crise de ansiedade aguda, possivelmente relacionada ao estresse laboral. Sintomas de insônia e déficit de atenção.',
    plan: 'Técnicas de respiração e relaxamento muscular progressivo. Agendamento de sessão semanal. Considerar ajuste na medicação se sintomas persistirem.',
    notes: 'Cliente demonstrou boa aderência às técnicas ensinadas. Recomendado exercícios físicos regulares.',
    nextSessionDate: '2024-08-22',
    createdAt: '2024-08-15T10:00:00Z',
    updatedAt: '2024-08-15T10:00:00Z'
  },
  {
    id: 2,
    clientId: 1,
    therapistId: 1,
    sessionDate: '2024-08-08',
    sessionType: 'INDIVIDUAL',
    sessionDuration: 50,
    subjective: 'Cliente relata melhora na ansiedade após implementar técnicas de respiração. Dormindo melhor, mas ainda com dificuldades no trabalho.',
    objective: 'Cliente mais calma, fala mais pausadamente. Demonstra compreensão das técnicas aprendidas.',
    assessment: 'Progresso positivo no controle da ansiedade. Sintomas de insônia melhorando. Necessário trabalhar estratégias de enfrentamento no ambiente laboral.',
    plan: 'Continuar com técnicas de relaxamento. Trabalhar assertividade e limites no trabalho. Manter sessões semanais.',
    notes: 'Cliente comprometida com o tratamento. Boa evolução geral.',
    nextSessionDate: '2024-08-15',
    createdAt: '2024-08-08T10:00:00Z',
    updatedAt: '2024-08-08T10:00:00Z'
  },
  {
    id: 3,
    clientId: 2,
    therapistId: 1,
    sessionDate: '2024-08-14',
    sessionType: 'INDIVIDUAL',
    sessionDuration: 60,
    subjective: 'Cliente relata flashbacks recorrentes do evento traumático. Pesadelos frequentes e hipervigilância.',
    objective: 'Cliente apresenta-se tenso, com respiração acelerada ao falar do trauma. Evita contato visual e fala em tom baixo.',
    assessment: 'Sintomas de TEPT persistindo. Necessário trabalho específico com técnicas de dessensibilização e reprocessamento.',
    plan: 'Iniciar EMDR na próxima sessão. Técnicas de grounding para controle dos sintomas. Sessões duas vezes por semana.',
    notes: 'Cliente demonstra motivação para o tratamento, apesar da dificuldade.',
    nextSessionDate: '2024-08-17',
    createdAt: '2024-08-14T14:00:00Z',
    updatedAt: '2024-08-14T14:00:00Z'
  },
  {
    id: 4,
    clientId: 3,
    therapistId: 1,
    sessionDate: '2024-08-13',
    sessionType: 'FAMILY',
    sessionDuration: 80,
    subjective: 'Sessão familiar com foco na comunicação e estabelecimento de limites. Cliente em fase estável do transtorno bipolar.',
    objective: 'Família demonstra boa comunicação. Cliente estável, sem sintomas de humor. Cônjuge presente e colaborativo.',
    assessment: 'Fase eutímica mantida. Sistema familiar funcionando adequadamente. Necessário continuar com psicoeducação.',
    plan: 'Manter sessões familiares mensais. Continuar com medicação conforme prescrição psiquiátrica. Foco na prevenção de recaídas.',
    notes: 'Excelente aderência ao tratamento. Família bem estruturada.',
    nextSessionDate: '2024-09-13',
    createdAt: '2024-08-13T15:30:00Z',
    updatedAt: '2024-08-13T15:30:00Z'
  },
  {
    id: 5,
    clientId: 4,
    therapistId: 1,
    sessionDate: '2024-08-12',
    sessionType: 'GROUP',
    sessionDuration: 90,
    subjective: 'Sessão de grupo focada em habilidades sociais e exposição gradual. Cliente relata progresso na interação social.',
    objective: 'Cliente participa ativamente do grupo, demonstra melhora na comunicação. Ainda apresenta timidez, mas com progresso evidente.',
    assessment: 'Boa evolução no tratamento da ansiedade social. Habilidades sociais em desenvolvimento. Diabetes bem controlada.',
    plan: 'Continuar com sessões de grupo. Trabalhar exposição em situações mais desafiadoras. Manter controle médico da diabetes.',
    notes: 'Cliente muito comprometido com o tratamento. Boa integração no grupo.',
    nextSessionDate: '2024-08-19',
    createdAt: '2024-08-12T16:00:00Z',
    updatedAt: '2024-08-12T16:00:00Z'
  }
];

// Funções mock que simulam as APIs
export const mockListClients = (): Promise<Client[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockClients), 500);
  });
};

export const mockCreateClient = (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> => {
  return new Promise((resolve) => {
    const newClient: Client = {
      ...clientData,
      id: Math.max(...mockClients.map(c => c.id)) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockClients.push(newClient);
    setTimeout(() => resolve(newClient), 300);
  });
};

export const mockUpdateClient = (id: number, clientData: Partial<Client>): Promise<Client> => {
  return new Promise((resolve, reject) => {
    const index = mockClients.findIndex(c => c.id === id);
    if (index === -1) {
      reject(new Error('Cliente não encontrado'));
      return;
    }
    
    const updatedClient = {
      ...mockClients[index],
      ...clientData,
      updatedAt: new Date().toISOString()
    };
    mockClients[index] = updatedClient;
    setTimeout(() => resolve(updatedClient), 300);
  });
};

export const mockDeleteClient = (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const index = mockClients.findIndex(c => c.id === id);
    if (index === -1) {
      reject(new Error('Cliente não encontrado'));
      return;
    }
    
    mockClients.splice(index, 1);
    setTimeout(() => resolve(), 300);
  });
};

export const mockListMedicalRecords = (clientId?: string): Promise<MedicalRecord[]> => {
  return new Promise((resolve) => {
    let records = mockMedicalRecords;
    if (clientId) {
      records = mockMedicalRecords.filter(r => r.clientId === parseInt(clientId));
    }
    setTimeout(() => resolve(records), 500);
  });
};

export const mockGetClientBookings = (clientId: string): Promise<any[]> => {
  return new Promise((resolve) => {
    // Simular agendamentos para os clientes
    const mockBookings = [
      {
        id: 1,
        title: 'Sessão Individual - Maria Silva',
        start: '2024-08-15T10:00:00Z',
        end: '2024-08-15T10:50:00Z',
        status: 'CONFIRMED',
        description: 'Sessão de psicoterapia individual',
        room: { name: 'Sala 1' },
        medicalRecord: mockMedicalRecords.find(r => r.clientId === parseInt(clientId))
      },
      {
        id: 2,
        title: 'Sessão Individual - Maria Silva',
        start: '2024-08-22T10:00:00Z',
        end: '2024-08-22T10:50:00Z',
        status: 'PENDING',
        description: 'Sessão de psicoterapia individual',
        room: { name: 'Sala 1' },
        medicalRecord: null
      }
    ];
    
    setTimeout(() => resolve(mockBookings), 300);
  });
};

export const mockCreateMedicalRecord = (recordData: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<MedicalRecord> => {
  return new Promise((resolve) => {
    const newRecord: MedicalRecord = {
      ...recordData,
      id: Math.max(...mockMedicalRecords.map(r => r.id)) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockMedicalRecords.push(newRecord);
    setTimeout(() => resolve(newRecord), 300);
  });
};

export const mockUpdateMedicalRecord = (id: number, recordData: Partial<MedicalRecord>): Promise<MedicalRecord> => {
  return new Promise((resolve, reject) => {
    const index = mockMedicalRecords.findIndex(r => r.id === id);
    if (index === -1) {
      reject(new Error('Prontuário não encontrado'));
      return;
    }
    
    const updatedRecord = {
      ...mockMedicalRecords[index],
      ...recordData,
      updatedAt: new Date().toISOString()
    };
    mockMedicalRecords[index] = updatedRecord;
    setTimeout(() => resolve(updatedRecord), 300);
  });
};

export const mockDeleteMedicalRecord = (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const index = mockMedicalRecords.findIndex(r => r.id === id);
    if (index === -1) {
      reject(new Error('Prontuário não encontrado'));
      return;
    }
    
    mockMedicalRecords.splice(index, 1);
    setTimeout(() => resolve(), 300);
  });
};


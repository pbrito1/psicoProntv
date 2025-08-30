# Integração Clientes, Prontuários e Agendamentos - PsicoPront

## Visão Geral

Este documento descreve a integração completa entre o sistema de gestão de clientes, prontuários médicos e agendamentos, criando um fluxo de trabalho unificado para clínicas psicológicas.

## Arquitetura da Integração

### 1. Modelo de Dados (Prisma Schema)

```prisma
model Client {
  id               Int             @id @default(autoincrement())
  name             String
  email            String          @unique
  phone            String
  birthDate        DateTime
  address          String
  emergencyContact String
  emergencyPhone   String
  medicalHistory   String?
  currentMedications String?
  allergies        String?
  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt
  
  // Relacionamentos
  bookings         Booking[]       // Agendamentos do cliente
  medicalRecords   MedicalRecord[] // Prontuários do cliente
}

model Booking {
  id          Int           @id @default(autoincrement())
  title       String
  start       DateTime
  end         DateTime
  status      BookingStatus @default(PENDING)
  description String?
  roomId      Int
  room        Room          @relation(fields: [roomId], references: [id], onDelete: Cascade)
  therapistId Int
  therapist   User          @relation(fields: [therapistId], references: [id])
  
  // Novo campo para vincular ao cliente
  clientId    Int?
  client      Client?       @relation(fields: [clientId], references: [id], onDelete: SetNull)
  
  // Relacionamento com prontuário
  medicalRecord MedicalRecord?
  
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

model MedicalRecord {
  id               Int           @id @default(autoincrement())
  clientId         Int
  client           Client        @relation(fields: [clientId], references: [id], onDelete: Cascade)
  therapistId      Int
  therapist        User          @relation(fields: [therapistId], references: [id])
  sessionDate      DateTime
  sessionType      SessionType   @default(INDIVIDUAL)
  sessionDuration  Int           // em minutos
  
  // Estrutura SOAP
  subjective       String        // queixa principal
  objective       String        // observações objetivas
  assessment      String        // avaliação
  plan            String        // plano terapêutico
  notes           String?       // observações adicionais
  
  nextSessionDate  DateTime?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  // Relacionamento com agendamento
  bookingId       Int?          @unique
  booking         Booking?      @relation(fields: [bookingId], references: [id])
}
```

## Fluxo de Trabalho Integrado

### 1. Criação de Agendamento com Cliente

1. **No calendário**: Ao criar um agendamento, o terapeuta pode opcionalmente selecionar um cliente
2. **Vínculo automático**: O agendamento fica vinculado ao cliente selecionado
3. **Rastreabilidade**: Fica fácil rastrear todos os agendamentos de um cliente específico

### 2. Criação de Prontuário a partir do Agendamento

1. **Na aba de agendamentos**: Ao visualizar os agendamentos de um cliente
2. **Botão "Criar Prontuário"**: Aparece quando o agendamento não tem prontuário vinculado
3. **Vínculo automático**: O prontuário é criado e vinculado ao agendamento correspondente

### 3. Visualização Integrada

1. **Aba Clientes**: Lista todos os clientes cadastrados
2. **Aba Prontuários**: Mostra o histórico clínico completo do cliente selecionado
3. **Aba Agendamentos**: Exibe todos os agendamentos do cliente com status e vínculos

## Funcionalidades da Integração

### 1. Gestão de Clientes
- Cadastro completo com informações pessoais e médicas
- Histórico de agendamentos e prontuários
- Busca e filtros avançados

### 2. Gestão de Prontuários
- Estrutura SOAP completa (Subjective, Objective, Assessment, Plan)
- Vinculação automática com agendamentos
- Histórico de evolução clínica
- Diferentes tipos de sessão (Individual, Grupo, Familiar)

### 3. Gestão de Agendamentos
- Seleção opcional de cliente ao criar agendamento
- Vinculação automática com prontuários
- Status de agendamento (Pendente, Confirmado, Cancelado)
- Integração com salas e terapeutas

## Benefícios da Integração

### 1. **Rastreabilidade Completa**
- Todo agendamento pode ser vinculado a um cliente
- Todo prontuário pode ser vinculado a um agendamento
- Histórico completo de atendimentos por cliente

### 2. **Fluxo de Trabalho Otimizado**
- Criação de prontuário direto do agendamento
- Informações do cliente disponíveis no agendamento
- Redução de erros e duplicação de dados

### 3. **Relatórios e Análises**
- Estatísticas de atendimento por cliente
- Histórico de frequência e evolução
- Análise de eficácia terapêutica

### 4. **Gestão de Qualidade**
- Controle de sessões realizadas vs. agendadas
- Acompanhamento de evolução clínica
- Auditoria de atendimentos

## Como Usar a Integração

### 1. **Criando um Agendamento com Cliente**
1. Acesse o calendário
2. Clique em um horário disponível
3. Preencha os dados básicos (data, horário, sala, terapeuta)
4. **Opcionalmente** selecione um cliente da lista
5. Salve o agendamento

### 2. **Criando um Prontuário a partir do Agendamento**
1. Acesse a tela de clientes
2. Selecione um cliente
3. Vá para a aba "Agendamentos"
4. Clique em "Criar Prontuário" no agendamento desejado
5. Preencha o prontuário seguindo o formato SOAP
6. O prontuário será automaticamente vinculado ao agendamento

### 3. **Visualizando a Integração**
1. **Cliente**: Veja todos os dados pessoais e médicos
2. **Prontuários**: Histórico completo de sessões e evoluções
3. **Agendamentos**: Cronograma de atendimentos com status e vínculos

## Campos de Integração

### 1. **Booking (Agendamento)**
- `clientId`: ID do cliente (opcional)
- `client`: Relacionamento com o modelo Client
- `medicalRecord`: Relacionamento com o prontuário (se existir)

### 2. **MedicalRecord (Prontuário)**
- `clientId`: ID do cliente (obrigatório)
- `therapistId`: ID do terapeuta
- `bookingId`: ID do agendamento (opcional, para vinculação)

### 3. **Client (Cliente)**
- `bookings`: Lista de agendamentos do cliente
- `medicalRecords`: Lista de prontuários do cliente

## Validações e Regras de Negócio

### 1. **Criação de Agendamento**
- Cliente é opcional
- Sala e terapeuta são obrigatórios
- Verificação de conflitos de horário

### 2. **Criação de Prontuário**
- Cliente é obrigatório
- Terapeuta é obrigatório
- Vinculação com agendamento é opcional

### 3. **Exclusão e Atualização**
- Exclusão de cliente em cascata (prontuários e agendamentos)
- Atualização de agendamento mantém vínculos
- Prontuários podem ser editados independentemente

## Próximos Passos

### 1. **Backend**
- Implementar endpoints para clientes e prontuários
- Criar migrações do banco de dados
- Implementar validações e regras de negócio

### 2. **Frontend**
- Adicionar validações de formulário
- Implementar notificações de vínculos
- Criar relatórios integrados

### 3. **Funcionalidades Avançadas**
- Sistema de lembretes automáticos
- Relatórios de evolução clínica
- Integração com sistemas externos
- Backup e sincronização de dados

## Exemplos de Uso

### Cenário 1: Primeira Consulta
1. Cliente é cadastrado no sistema
2. Agendamento é criado com o cliente selecionado
3. Após a sessão, prontuário é criado e vinculado ao agendamento
4. Sistema mantém histórico completo

### Cenário 2: Acompanhamento
1. Cliente retorna para nova sessão
2. Novo agendamento é criado
3. Prontuário anterior é consultado para continuidade
4. Nova sessão é registrada com evolução

### Cenário 3: Gestão de Qualidade
1. Terapeuta visualiza histórico completo do cliente
2. Analisa evolução ao longo das sessões
3. Identifica padrões e progressos
4. Ajusta plano terapêutico conforme necessário

## Suporte e Manutenção

Para dúvidas sobre a integração ou problemas técnicos:
- Consulte a documentação técnica
- Entre em contato com a equipe de desenvolvimento
- Verifique os logs de erro do sistema
- Consulte o histórico de mudanças

# PsicoProntv

Sistema de gerenciamento de prontuários psicológicos com agendamento de sessões.

## Funcionalidades

### Autenticação e Autorização
- Login para terapeutas e administradores
- Portal para pais/responsáveis
- Controle de acesso baseado em roles
- JWT tokens com refresh

### Gestão de Clientes
- Cadastro completo de clientes
- Histórico médico e medicamentos
- Relacionamento com terapeutas
- Portal para pais/responsáveis

### Agendamento
- Sistema de agendamento de sessões
- Gestão de salas de atendimento
- Notificações automáticas
- Status de agendamentos (Pendente, Confirmado, Cancelado)

### Prontuários Médicos
- Estrutura SOAP (Subjetivo, Objetivo, Avaliação, Plano)
- Vinculação com agendamentos
- Histórico completo de sessões
- Controle de acesso por terapeuta

### Notificações
- Sistema de notificações em tempo real
- Diferentes tipos e prioridades
- Portal para pais/responsáveis

## Lógica de Creates Implementada

### Validações de Entrada

O sistema implementa uma lógica robusta de criação com validações completas para garantir a integridade dos dados:

#### 1. **Usuários (Terapeutas)**
- ✅ Validação de email único
- ✅ Validação de senha (mínimo 6 caracteres, complexidade)
- ✅ Validação de telefone (formato internacional)
- ✅ Validação de especialidade (mínimo 3 caracteres)
- ✅ Hash seguro da senha com bcrypt

#### 2. **Clientes**
- ✅ Validação de email único
- ✅ Validação de telefone e telefone de emergência
- ✅ Validação de data de nascimento (idade realista)
- ✅ Validação de endereço (mínimo 10 caracteres)
- ✅ Validação de contato de emergência
- ✅ Sanitização de dados (trim, lowercase)

#### 3. **Agendamentos**
- ✅ Validação de datas (início < fim)
- ✅ Verificação de conflitos de horário
- ✅ Validação de duração (15min - 4h)
- ✅ Verificação de existência de sala e terapeuta
- ✅ Verificação de relacionamento terapeuta-cliente
- ✅ Validação de horário de funcionamento da sala
- ✅ Criação automática de notificações

#### 4. **Prontuários Médicos**
- ✅ Verificação de existência de cliente e terapeuta
- ✅ Validação de datas de sessão
- ✅ Verificação de vinculação com agendamento
- ✅ Validação de estrutura SOAP
- ✅ Conversão de strings de data para Date

#### 5. **Salas**
- ✅ Validação de nome único
- ✅ Validação de capacidade (1-100 pessoas)
- ✅ Validação de horários de funcionamento
- ✅ Verificação de formato HH:MM
- ✅ Validação de horário de abertura < fechamento

#### 6. **Guardiões (Pais/Responsáveis)**
- ✅ Validação de email único
- ✅ Validação de CPF único e formato válido
- ✅ Validação de senha (complexidade)
- ✅ Validação de telefone
- ✅ Validação de relacionamento (lista predefinida)
- ✅ Validação de CPF com algoritmo oficial

#### 7. **Notificações**
- ✅ Verificação de existência de guardião
- ✅ Verificação de status ativo do guardião
- ✅ Validação de acesso a clientes/agendamentos
- ✅ Limite de notificações urgentes (5 por dia)
- ✅ Verificação de relacionamentos

### Validações de Negócio

#### **Agendamentos**
- **Conflitos de Horário**: Verifica sala, terapeuta e cliente
- **Relacionamentos**: Terapeuta deve ter relacionamento ativo com cliente
- **Horário de Funcionamento**: Respeita horários da sala
- **Duração Realista**: Entre 15 minutos e 4 horas

#### **Prontuários**
- **Vinculação**: Verifica se agendamento não tem prontuário
- **Datas**: Validação de datas de sessão e próximas sessões
- **Relacionamentos**: Cliente e terapeuta devem existir

#### **Usuários e Guardiões**
- **Senhas**: Complexidade mínima (maiúscula, minúscula, número)
- **CPF**: Validação com algoritmo oficial brasileiro
- **Emails**: Formato válido e unicidade
- **Telefones**: Formato internacional

### Sanitização de Dados

#### **Limpeza Automática**
- **Emails**: Convertidos para lowercase e trim
- **Nomes**: Aplicado trim
- **Telefones**: Remoção de caracteres especiais
- **Endereços**: Aplicado trim
- **Datas**: Conversão de string para Date

#### **Validações de Formato**
- **Email**: Regex para formato válido
- **Telefone**: Regex para formato internacional
- **CPF**: Algoritmo oficial brasileiro
- **Horários**: Formato HH:MM
- **Datas**: Conversão e validação de data válida

### Tratamento de Erros

#### **Hierarquia de Erros**
- **ConflictException**: Para dados duplicados
- **BadRequestException**: Para validações de entrada
- **NotFoundException**: Para recursos não encontrados
- **ForbiddenException**: Para permissões

#### **Mensagens Específicas**
- Cada validação tem mensagem clara e específica
- Mensagens em português
- Indicação do campo com problema
- Sugestões de correção quando aplicável

### Operações Automáticas

#### **Criação de Relacionamentos**
- **Agendamentos**: Cria notificações automáticas para pais
- **Prontuários**: Vincula automaticamente com agendamentos
- **Usuários**: Hash automático de senhas
- **Guardiões**: Hash automático de senhas

#### **Validações de Integridade**
- **Referências**: Verifica existência de entidades relacionadas
- **Relacionamentos**: Valida relacionamentos terapeuta-cliente
- **Permissões**: Verifica acesso de guardiões a clientes
- **Conflitos**: Detecta conflitos de horário e dados

## Lógica de Deletes Implementada

### Validações de Integridade

O sistema implementa uma lógica robusta de deletes com validações de integridade para garantir a consistência dos dados:

#### 1. **Usuários (Terapeutas)**
- ✅ Verifica agendamentos ativos antes de deletar
- ✅ Verifica prontuários médicos existentes
- ✅ Verifica relacionamentos ativos com clientes
- ✅ Limpa notificações pendentes
- ✅ Limpa tokens de refresh

#### 2. **Clientes**
- ✅ Verifica agendamentos ativos antes de deletar
- ✅ Verifica prontuários médicos existentes
- ✅ Verifica relacionamentos ativos com terapeutas
- ✅ Limpa notificações pendentes

#### 3. **Agendamentos**
- ✅ Verifica se já foi cancelado
- ✅ Verifica se a sessão já passou
- ✅ Cria notificações de cancelamento
- ✅ Desvincula prontuários relacionados

#### 4. **Prontuários Médicos**
- ✅ Verifica vinculação com agendamentos
- ✅ Verifica se a sessão já aconteceu
- ✅ Impede deleção de prontuários de sessões passadas

#### 5. **Salas**
- ✅ Verifica agendamentos ativos
- ✅ Verifica agendamentos futuros
- ✅ Impede deleção com conflitos

#### 6. **Guardiões (Pais/Responsáveis)**
- ✅ Soft delete (marca como inativo)
- ✅ Verifica clientes ativos
- ✅ Limpa notificações não lidas
- ✅ Limpa tokens de refresh

#### 7. **Notificações**
- ✅ Impede deleção de notificações urgentes
- ✅ Impede deleção de notificações muito recentes
- ✅ Validação de existência

### Operações de Manutenção

#### Endpoints de Sistema (Apenas Admin)
- `POST /cleanup` - Limpeza de dados antigos
- `GET /integrity` - Verificação de integridade
- `GET /stats` - Estatísticas do sistema

#### Limpeza Automática
- Notificações lidas com mais de 90 dias
- Agendamentos cancelados com mais de 1 ano

### Relacionamentos Terapeuta-Cliente

#### Gerenciamento de Relacionamentos
- `POST /clients/:id/therapists` - Adicionar terapeuta
- `DELETE /clients/:id/therapists/:therapistId` - Remover terapeuta
- Validações de agendamentos ativos
- Validações de prontuários recentes

## Tecnologias

### Backend
- **NestJS** - Framework Node.js
- **Prisma** - ORM com PostgreSQL
- **JWT** - Autenticação
- **Swagger** - Documentação da API
- **Jest** - Testes

### Frontend
- **React** - Interface do usuário
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **Tailwind CSS** - Estilização
- **React Router** - Navegação

## Estrutura do Banco de Dados

### Modelos Principais
- `User` - Terapeutas e administradores
- `Client` - Clientes/pacientes
- `Guardian` - Pais/responsáveis
- `Booking` - Agendamentos
- `MedicalRecord` - Prontuários
- `Room` - Salas de atendimento
- `Notification` - Notificações
- `ClientTherapist` - Relacionamentos

### Constraints de Delete
- **Cascade**: Relacionamentos que devem ser deletados automaticamente
- **Restrict**: Relacionamentos que impedem a deleção
- **SetNull**: Relacionamentos que são desvinculados

## Instalação e Execução

### Pré-requisitos
- Node.js 18+
- PostgreSQL
- npm ou yarn

### Backend
```bash
cd backend
npm install
npm run build
npm run start:dev
```

### Frontend
```bash
npm install
npm run dev
```

### Banco de Dados
```bash
cd backend
npx prisma migrate dev
npx prisma generate
npx prisma db seed
```

## Segurança

- Autenticação JWT
- Controle de acesso baseado em roles
- Validação de entrada em todos os endpoints
- Sanitização de dados
- Logs de auditoria
- Hash seguro de senhas
- Validação de CPF oficial

## Monitoramento

- Verificação de integridade de dados
- Estatísticas do sistema
- Limpeza automática de dados antigos
- Logs de operações críticas
- Validações de negócio em tempo real

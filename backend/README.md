# Backend - Sistema de Gestão Psicológica

Este é o backend do sistema de gestão psicológica, construído com NestJS, Prisma ORM e PostgreSQL.

## 🏗️ Estrutura do Projeto

```
backend/
├── README.md                           # Esta documentação consolidada
├── prisma/                             # Configuração do banco de dados
│   ├── schema.prisma                   # Schema do banco
│   └── seed.ts                         # Dados iniciais
├── src/
│   ├── app.module.ts                   # Módulo principal da aplicação
│   ├── main.ts                         # Ponto de entrada
│   ├── auth/                           # Módulo de autenticação
│   ├── users/                          # Módulo de usuários
│   ├── clients/                        # Módulo de clientes
│   ├── guardians/                      # Módulo de pais/responsáveis
│   ├── bookings/                       # Módulo de agendamentos
│   ├── medical-records/                # Módulo de prontuários
│   ├── rooms/                          # Módulo de salas
│   ├── notifications/                  # Módulo de notificações
│   ├── guards/                         # Guards de autorização
│   ├── interceptors/                   # Interceptadores
│   ├── filters/                        # Filtros de exceção
│   └── cache/                          # Sistema de cache
└── package.json                        # Dependências do projeto
```

## 🚀 Tecnologias Utilizadas

- **NestJS**: Framework para construção de aplicações escaláveis
- **Prisma**: ORM moderno para TypeScript e Node.js
- **PostgreSQL**: Banco de dados relacional
- **JWT**: Autenticação baseada em tokens
- **bcryptjs**: Hash de senhas
- **Swagger**: Documentação da API
- **Class Validator**: Validação de dados
- **Passport**: Estratégias de autenticação

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL 12+
- npm ou yarn

## ⚙️ Configuração

### 1. Instalação de Dependências
```bash
cd backend
npm install
```

### 2. Configuração do Banco de Dados
Copie o arquivo `.env.example` para `.env` e configure:
```bash
cp .env.example .env
```

Configure as variáveis de ambiente:
```env
# Banco de Dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/nome_do_banco"

# Servidor
PORT=3000
CORS_ORIGIN=http://localhost:3001

# JWT
JWT_SECRET=sua_chave_secreta_aqui
JWT_REFRESH_SECRET=sua_chave_refresh_aqui

# Cache
REDIS_URL=redis://localhost:6379

# Logs
LOG_LEVEL=info
```

### 3. Migração do Banco
```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Seed do Banco (Opcional)
```bash
npx prisma db seed
```

### 5. Executar a Aplicação
```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

## 🔐 Módulo de Autenticação (`/auth`)

### Funcionalidades
- **Autenticação de Usuários** (Terapeutas/Admins)
  - `POST /auth/login` - Login
  - `POST /auth/register` - Registro
  - `POST /auth/refresh` - Renovar token
  - `POST /auth/logout` - Logout

- **Autenticação de Pais/Responsáveis**
  - `POST /auth/guardian/register` - Registro de pai
  - `POST /auth/guardian/login` - Login de pai
  - `POST /auth/guardian/refresh` - Renovar token
  - `POST /auth/guardian/logout` - Logout de pai

### Segurança
- Hash de senhas com bcrypt (12 rounds)
- Tokens JWT com expiração configurável
- Refresh tokens com invalidação no logout
- Sistema de roles e permissões granulares

## 👥 Módulo de Usuários (`/users`)

### Funcionalidades
- **CRUD de Usuários**
  - `GET /users` - Listar usuários
  - `GET /users/:id` - Buscar usuário por ID
  - `POST /users` - Criar usuário
  - `PATCH /users/:id` - Atualizar usuário
  - `DELETE /users/:id` - Remover usuário

### Tipos de Usuário
- **ADMIN**: Acesso total ao sistema
- **THERAPIST**: Acesso às funcionalidades de terapia

## 👨‍👩‍👧‍👦 Módulo de Clientes (`/clients`)

### Funcionalidades
- **Gestão de Clientes**
  - `GET /clients` - Listar clientes
  - `GET /clients/:id` - Buscar cliente por ID
  - `POST /clients` - Criar cliente
  - `PATCH /clients/:id` - Atualizar cliente
  - `DELETE /clients/:id` - Remover cliente

- **Funcionalidades Específicas**
  - `GET /clients/:id/bookings` - Agendamentos do cliente
  - `GET /clients/:id/medical-records` - Prontuários do cliente
  - `GET /clients/:id/guardians` - Pais/responsáveis do cliente

## 🛡️ Módulo de Guardians (`/guardians`)

### Funcionalidades
- **Gestão de Pais/Responsáveis**
  - `GET /guardians` - Listar todos os guardians
  - `GET /guardians/:id` - Buscar guardian por ID
  - `POST /guardians` - Criar guardian
  - `PATCH /guardians/:id` - Atualizar guardian
  - `DELETE /guardians/:id` - Remover guardian

- **Funcionalidades para Pais Logados**
  - `GET /guardians/profile/me` - Perfil do pai logado
  - `GET /guardians/children/me` - Filhos do pai logado
  - `GET /guardians/children/:childId/sessions` - Sessões de um filho
  - `POST /guardians/children/:childId/book-session` - Agendar sessão
  - `GET /guardians/children/:childId/medical-records` - Prontuários do filho

- **Geração de Contas de Pais** (Para Terapeutas/Admins)
  - `POST /guardians/generate-parent-accounts` - Gerar contas de pais
  - `GET /guardians/client/:clientId/guardians` - Listar pais de um cliente
  - `DELETE /guardians/client/:clientId/guardian/:guardianId` - Desvincular pai
  - `POST /guardians/update-cpf/:guardianId` - Atualizar CPF

### Características Especiais
- Geração automática de senhas seguras
- CPFs temporários válidos durante criação
- Sistema de permissões granulares por pai
- Rollback automático em caso de erro

## 📅 Módulo de Agendamentos (`/bookings`)

### Funcionalidades
- **Gestão de Agendamentos**
  - `GET /bookings` - Listar agendamentos
  - `GET /bookings/:id` - Buscar agendamento por ID
  - `POST /bookings` - Criar agendamento
  - `PATCH /bookings/:id` - Atualizar agendamento
  - `DELETE /bookings/:id` - Remover agendamento

- **Funcionalidades Específicas**
  - `GET /bookings/client/:clientId` - Agendamentos de um cliente
  - `GET /bookings/therapist/:therapistId` - Agendamentos de um terapeuta
  - `GET /bookings/room/:roomId` - Agendamentos de uma sala
  - `POST /bookings/:id/confirm` - Confirmar agendamento
  - `POST /bookings/:id/cancel` - Cancelar agendamento

## 📋 Módulo de Prontuários (`/medical-records`)

### Funcionalidades
- **Gestão de Prontuários**
  - `GET /medical-records` - Listar prontuários
  - `GET /medical-records/:id` - Buscar prontuário por ID
  - `POST /medical-records` - Criar prontuário
  - `PATCH /medical-records/:id` - Atualizar prontuário
  - `DELETE /medical-records/:id` - Remover prontuário

- **Funcionalidades Específicas**
  - `GET /medical-records/client/:clientId` - Prontuários de um cliente
  - `GET /medical-records/therapist/:therapistId` - Prontuários de um terapeuta
  - `POST /medical-records/:id/attachments` - Adicionar anexos
  - `GET /medical-records/:id/history` - Histórico de alterações

## 🏠 Módulo de Salas (`/rooms`)

### Funcionalidades
- **Gestão de Salas**
  - `GET /rooms` - Listar salas
  - `GET /rooms/:id` - Buscar sala por ID
  - `POST /rooms` - Criar sala
  - `PATCH /rooms/:id` - Atualizar sala
  - `DELETE /rooms/:id` - Remover sala

- **Funcionalidades Específicas**
  - `GET /rooms/available` - Salas disponíveis
  - `GET /rooms/:id/schedule` - Agenda de uma sala
  - `POST /rooms/:id/maintenance` - Marcar manutenção

## 🔔 Módulo de Notificações (`/notifications`)

### Funcionalidades
- **Gestão de Notificações**
  - `GET /notifications` - Listar notificações
  - `GET /notifications/:id` - Buscar notificação por ID
  - `POST /notifications` - Criar notificação
  - `PATCH /notifications/:id` - Atualizar notificação
  - `DELETE /notifications/:id` - Remover notificação

- **Funcionalidades Específicas**
  - `GET /notifications/user/:userId` - Notificações de um usuário
  - `GET /notifications/guardian/:guardianId` - Notificações de um pai
  - `POST /notifications/:id/read` - Marcar como lida
  - `POST /notifications/bulk-send` - Envio em massa

## 🛡️ Sistema de Autorização

### Guards
- **JwtAuthGuard**: Protege rotas que requerem autenticação
- **RolesGuard**: Verifica permissões baseadas em roles
- **GuardianChildGuard**: Controla acesso de pais aos dados dos filhos

### Decorators
- **@Roles()**: Define quais roles podem acessar uma rota
- **@UseGuards()**: Aplica guards específicos às rotas

### Exemplo de Uso
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'THERAPIST')
@Get('protected-route')
protectedRoute() {
  return 'Rota protegida';
}
```

## 📊 Banco de Dados

### Modelos Principais
- **User**: Usuários do sistema (terapeutas/admins)
- **Client**: Clientes/pacientes
- **Guardian**: Pais/responsáveis
- **Booking**: Agendamentos de sessões
- **MedicalRecord**: Prontuários médicos
- **Room**: Salas de atendimento
- **Notification**: Sistema de notificações

### Relacionamentos
- Cliente pode ter múltiplos pais/responsáveis
- Pai pode ter múltiplos filhos
- Agendamentos vinculam cliente, terapeuta e sala
- Prontuários vinculam cliente e terapeuta
- Notificações podem ser para usuários ou pais

## 🔧 Configurações de Desenvolvimento

### Variáveis de Ambiente
```env
# Servidor
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3001

# Banco de Dados
DATABASE_URL=postgresql://usuario:senha@localhost:5432/banco_dev

# JWT
JWT_SECRET=chave_dev_secreta
JWT_REFRESH_SECRET=chave_refresh_dev

# Cache
REDIS_URL=redis://localhost:6379

# Logs
LOG_LEVEL=debug
```

### Scripts NPM
```json
{
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
```

## 🧪 Testes

### Executar Testes
```bash
# Testes unitários
npm run test

# Testes em modo watch
npm run test:watch

# Testes com cobertura
npm run test:cov

# Testes e2e
npm run test:e2e
```

## 📚 Documentação da API

### Swagger
A documentação da API está disponível em:
- **Desenvolvimento**: `http://localhost:3000/api`
- **Produção**: `https://seu-dominio.com/api`

### Endpoints Principais
- **Auth**: `/auth/*`
- **Users**: `/users/*`
- **Clients**: `/clients/*`
- **Guardians**: `/guardians/*`
- **Bookings**: `/bookings/*`
- **Medical Records**: `/medical-records/*`
- **Rooms**: `/rooms/*`
- **Notifications**: `/notifications/*`

## 🚀 Deploy

### Produção
```bash
# Build da aplicação
npm run build

# Configurar variáveis de ambiente de produção
# Executar migrações
npx prisma migrate deploy

# Iniciar aplicação
npm run start:prod
```

### Docker (Opcional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

## 🔍 Monitoramento e Logs

### Logs
- **Nível**: Configurável via `LOG_LEVEL`
- **Formato**: Estruturado em JSON
- **Rotação**: Automática por tamanho e tempo

### Métricas
- **Health Check**: `/health`
- **Status**: `/status`
- **Métricas**: `/metrics` (se configurado)

## 🤝 Contribuição

### Padrões de Código
- **ESLint**: Configuração padrão do NestJS
- **Prettier**: Formatação automática
- **Husky**: Hooks de git para validação

### Estrutura de Commits
```
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação
refactor: refatoração
test: testes
chore: tarefas de manutenção
```

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar a documentação da API
2. Consultar os logs da aplicação
3. Verificar as migrações do banco
4. Abrir uma issue no repositório

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

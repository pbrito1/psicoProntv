# 🧠 PsicoProntV - Sistema de Gestão para Clínicas Psicológicas

Sistema completo de gerenciamento de clínicas psicológicas com foco em atendimento infantil, incluindo agendamento, prontuários médicos, gestão de clientes e **portal exclusivo para pais/responsáveis**.

## ✨ Funcionalidades Principais

### 🏥 Portal dos Terapeutas
- **👥 Gestão de Clientes**: CRUD completo com busca e estatísticas
- **📅 Agendamentos**: Sistema de reservas com salas e horários
- **📋 Prontuários Médicos**: Documentação clínica SOAP
- **🏥 Gestão de Salas**: Controle de ambientes de atendimento
- **👨‍⚕️ Usuários e Terapeutas**: Sistema de autenticação e autorização
- **📊 Relatórios**: Estatísticas e métricas de atendimento

### 👨‍👩‍👧‍👦 Portal dos Pais (NOVO!)
- **👶 Visualização de Filhos**: Acesso aos dados das crianças
- **📚 Histórico de Sessões**: Acompanhamento do progresso terapêutico
- **📋 Prontuários Médicos**: Visualização de registros clínicos
- **📅 Agendamento de Sessões**: Marcação de consultas (quando permitido)
- **🔒 Controle de Acesso**: Permissões personalizadas por responsável

## 🚀 Como Executar

### 📋 Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- PostgreSQL (para o backend)
- Redis (opcional, para cache)

### 🏗️ Estrutura do Projeto
```
psicoprontv/
├── backend/          # API NestJS
├── src/              # Frontend React
├── prisma/           # Schema e migrações do banco
└── dist/             # Builds compilados
```

### 🔧 Backend (NestJS)

```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Gerar cliente Prisma
npm run prisma:generate

# Executar migrações
npm run prisma:migrate

# Executar seed (dados de teste)
npm run prisma:seed

# Iniciar em desenvolvimento
npm run start:dev

# Build para produção
npm run build
```

**Servidor rodando em:** http://localhost:3001

### 🎨 Frontend (React + Vite)

```bash
# Na raiz do projeto

# Instalar dependências
npm install

# Iniciar em desenvolvimento
npm run dev
# ou
npm run start:dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

**Aplicação rodando em:** http://localhost:3000

## 🆕 Novas Funcionalidades

### 🔍 Combobox com Autocomplete para Seleção de Clientes
- **Componente Combobox**: Substitui o Select tradicional por uma barra de busca inteligente
- **Autocomplete em Tempo Real**: Busca por nome enquanto o usuário digita
- **Interface Intuitiva**: Dropdown com opções filtradas e seleção visual
- **Implementado em**: Criação e edição de agendamentos no calendário

**Como usar:**
1. Clique no campo "Cliente" ao criar um agendamento
2. Digite o nome do cliente desejado
3. As opções são filtradas automaticamente
4. Selecione o cliente correto da lista

### 🧹 Limpeza de Dados Mock
- **Removidos todos os dados mock** do sistema
- **Implementadas chamadas reais** para a API do backend
- **Mantido apenas o login de administrador** para acesso ao sistema
- **Sistema preparado** para uso em produção com dados reais

## 🔐 Credenciais de Teste

### 👨‍⚕️ Administrador
- **Admin**: admin@psicopront.com / admin123

> **Nota**: Todos os dados mock foram removidos do sistema. O sistema agora está configurado para usar apenas dados reais do backend.

### 👑 Admin
- **Admin**: admin@psicopront.com / admin123

## 🗄️ Banco de Dados

### 🏗️ Estrutura Principal
- **Users**: Terapeutas e administradores
- **Clients**: Pacientes (crianças e adultos)
- **Guardians**: Pais e responsáveis (NOVO!)
- **Rooms**: Salas de atendimento
- **Bookings**: Agendamentos
- **MedicalRecords**: Prontuários médicos

### 🔄 Migrações
```bash
# Criar nova migração
npx prisma migrate dev --name nome_da_migracao

# Aplicar migrações em produção
npx prisma migrate deploy

# Resetar banco (desenvolvimento)
npx prisma migrate reset
```

### 🚀 Desenvolvimento Local (SQLite)

```bash
# Instalar dependências
cd backend
npm install

# Configurar ambiente local
cp env.local.example .env

# Gerar cliente Prisma
npx prisma generate

# Executar migrações
npx prisma migrate dev

# Popular com dados de teste
npx prisma db seed

# Abrir Prisma Studio
npx prisma studio
```

### ☁️ Produção com NeonDB

```bash
# Configurar NeonDB
cp env.neon.example .env

# Editar .env com suas credenciais do NeonDB
# DATABASE_URL="postgresql://username:password@ep-xxx-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require"

# Gerar cliente Prisma
npx prisma generate

# Executar migrações
npx prisma migrate deploy

# Popular com dados de teste
npx prisma db seed
```

### 🔧 Configuração Automática (Windows)

```powershell
# Configurar ambiente de desenvolvimento
.\setup-neon.ps1 dev

# Configurar ambiente de produção
.\setup-neon.ps1 prod

# Migrar do SQLite para NeonDB
.\migrate-to-neon.ps1
```

## 🚀 Sistema de Cache

O PsicoPront implementa um sistema de cache inteligente em múltiplas camadas:

### **Camadas de Cache:**
- **🌐 Navegador**: Headers HTTP para recursos estáticos e APIs
- **🖥️ Servidor**: Redis para dados frequentemente acessados  
- **🧠 Inteligente**: Invalidação automática baseada em operações

### **Configuração:**
```bash
# Instalar dependências de cache
npm install @nestjs/cache-manager cache-manager cache-manager-redis-store redis

# Configurar variáveis de ambiente
REDIS_HOST=localhost
REDIS_PORT=6379
CACHE_TTL=300
```

### **Como Usar:**
```typescript
// Cache automático
@Get()
@CacheMedium('clients:all')
findAll() { return this.service.findAll(); }

// Invalidação automática
@Post()
@InvalidateClientCache()
create(dto) { return this.service.create(dto); }
```

## 📚 Documentação da API

- **Swagger UI**: http://localhost:3001/docs
- **Documentação Completa**: Este README contém todas as informações necessárias
- **Schema do Banco**: `backend/prisma/schema.prisma`
- **Seed de Dados**: `backend/prisma/seed.ts`

## 🏗️ Arquitetura

### Backend
- **Framework**: NestJS (Node.js)
- **Banco**: SQLite (dev) + NeonDB/PostgreSQL (prod) + Prisma ORM
- **Autenticação**: JWT + Passport
- **Validação**: class-validator + class-transformer
- **Documentação**: Swagger/OpenAPI
- **Cache**: Redis + NestJS Cache Manager

### Frontend
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **UI Components**: Shadcn/ui + Tailwind CSS
- **Estado**: React Context + Hooks
- **Roteamento**: React Router DOM

## 🔐 Autenticação e Autorização

O sistema usa JWT com diferentes níveis de acesso:

- **ADMIN**: Acesso total ao sistema
- **THERAPIST**: Pode gerenciar apenas seus próprios clientes e prontuários
- **GUARDIAN**: Acesso ao portal dos pais (NOVO!)

### 🔒 Sistema de Permissões para Terapeutas
- **Isolamento de Dados**: Cada terapeuta só pode ver e gerenciar seus próprios clientes
- **Prontuários Restritos**: Acesso apenas aos prontuários dos clientes responsável
- **Agendamentos Filtrados**: Visualização apenas dos agendamentos próprios
- **Relacionamento Cliente-Terapeuta**: Sistema de atribuição e remoção de responsabilidades

### 🔒 Sistema de Permissões para Pais
- **canViewRecords**: Visualizar prontuários médicos
- **canBookSessions**: Agendar sessões
- **canCancelSessions**: Cancelar sessões
- **canViewBilling**: Visualizar faturas

## 📋 Estrutura SOAP

Os prontuários seguem a metodologia SOAP:

- **S (Subjective)**: Queixa principal do paciente
- **O (Objective)**: Observações objetivas
- **A (Assessment)**: Avaliação e diagnóstico
- **P (Plan)**: Plano terapêutico

## 🛡️ Segurança e Isolamento de Dados

### 🔒 Guards de Acesso
- **TherapistAccessGuard**: Verifica se o terapeuta tem acesso aos dados do cliente
- **MedicalRecordAccessGuard**: Controla acesso aos prontuários médicos
- **BookingAccessGuard**: Restringe acesso aos agendamentos

### 🔐 Relacionamento Terapeuta-Cliente
- **Tabela ClientTherapist**: Relacionamento direto entre terapeutas e clientes
- **Terapeuta Principal**: Sistema de designação de responsável principal
- **Histórico de Relacionamentos**: Rastreamento de início e fim de responsabilidades
- **Migração Automática**: Dados existentes são migrados automaticamente

### 🚫 Prevenção de Acesso Não Autorizado
- **Filtros Automáticos**: APIs retornam apenas dados do terapeuta logado
- **Validação em Tempo Real**: Verificações de permissão em cada operação
- **Logs de Acesso**: Rastreamento de tentativas de acesso não autorizado

## 🧪 Testes

```bash
# Backend
cd backend
npm run test
npm run test:watch
npm run test:e2e

# Frontend
npm run lint
npx tsc --noEmit
```

## 📦 Scripts Disponíveis

### Backend
```bash
npm run start:dev    # Desenvolvimento com hot reload
npm run build        # Build de produção
npm run start:prod   # Executar produção
npm run test         # Testes unitários
npm run test:e2e     # Testes end-to-end
npm run prisma:generate  # Gerar cliente Prisma
npm run prisma:migrate   # Executar migrações
npm run prisma:seed      # Executar seed do banco
npm run prisma:studio    # Abrir Prisma Studio
```

### Frontend
```bash
npm run dev          # Desenvolvimento
npm run start:dev    # Alias para dev
npm run build        # Build de produção
npm run preview      # Preview da build
npm run lint         # Executar ESLint
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` no diretório `backend/`:

```bash
# Banco de dados
DATABASE_URL="file:./prisma/dev.db"

# Servidor
PORT=3001

# CORS
CORS_ORIGIN="http://localhost:3000"

# JWT
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="24h"

# Refresh Token
REFRESH_TOKEN_SECRET="your-refresh-secret-here"
REFRESH_TOKEN_EXPIRES_IN="7d"

# Cache (Redis)
REDIS_HOST=localhost
REDIS_PORT=6379
CACHE_TTL=300
```

## 🌐 URLs de Acesso

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Prisma Studio**: http://localhost:5555
- **Swagger API**: http://localhost:3001/docs

## 🚨 Solução de Problemas

### Erro de Build
```bash
# Limpar cache
rm -rf node_modules package-lock.json
npm install

# Limpar build
rm -rf dist
npm run build
```

### Erro de Prisma
```bash
# Regenerar cliente
npm run prisma:generate

# Resetar banco
npx prisma migrate reset
```

### Erro de Porta
```bash
# Verificar processos na porta
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Matar processo
taskkill /PID <PID> /F
```

### Problemas Comuns

**Porta já em uso:**
```bash
# Verificar portas
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Matar processo
taskkill /PID <PID> /F
```

**Banco não conecta:**
```bash
# Verificar arquivo .env
# Executar migrações
npx prisma migrate dev
```

**Dependências não instalam:**
```bash
# Limpar cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📱 Funcionalidades Principais

### Portal dos Terapeutas
- Dashboard com visão geral
- Gestão de clientes
- Agendamentos e calendário
- Prontuários médicos
- Gestão de salas

### Portal dos Pais
- Visualização de filhos
- Histórico de sessões
- Prontuários médicos
- Agendamento de sessões
- Progresso terapêutico

## 🤝 Contribuição

1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar logs da aplicação
2. Consultar documentação Swagger
3. Executar testes para validar funcionalidades
4. Verificar configurações de ambiente
5. Consultar este README para soluções comuns

---

**🎉 PsicoProntV** - Transformando a gestão de clínicas psicológicas com foco no cuidado infantil!

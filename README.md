# 🧠 PsicoPront

Sistema completo de gerenciamento de clínicas psicológicas com agendamento, prontuários médicos e gestão de clientes.

## ✨ Funcionalidades

- **👥 Gestão de Clientes**: CRUD completo com busca e estatísticas
- **📅 Agendamentos**: Sistema de reservas com salas e horários
- **📋 Prontuários Médicos**: Documentação clínica SOAP
- **🏥 Gestão de Salas**: Controle de ambientes de atendimento
- **👨‍⚕️ Usuários e Terapeutas**: Sistema de autenticação e autorização
- **📊 Relatórios**: Estatísticas e métricas de atendimento

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- SQLite (incluído no projeto)

### Backend (NestJS)

```bash
cd backend
npm install
npm run start:dev
```

**Servidor rodando em:** http://localhost:3000

### Frontend (React + Vite)

```bash
npm install
npm run dev
```

**Aplicação rodando em:** http://localhost:5173

## 🗄️ Banco de Dados

O projeto suporta **SQLite** para desenvolvimento local e **NeonDB (PostgreSQL)** para produção.

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

## 🚀 **Sistema de Cache**

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

**📖 Documentação completa:** [CACHE_STRATEGY.md](backend/CACHE_STRATEGY.md)

## 📚 Documentação da API

- **Swagger UI**: http://localhost:3000/docs
- **Integração com Bookings**: [INTEGRACAO_BOOKING_README.md](INTEGRACAO_BOOKING_README.md)
- **Gestão de Clientes**: [CLIENTES_README.md](CLIENTES_README.md)
- **Backend Completo**: [backend/README.md](backend/README.md)
- **Configuração NeonDB**: [backend/prisma/neon-setup.md](backend/prisma/neon-setup.md)
- **🚀 Guia Rápido NeonDB**: [NEONDB_QUICK_START.md](NEONDB_QUICK_START.md)

## 🏗️ Arquitetura

### Backend
- **Framework**: NestJS (Node.js)
- **Banco**: SQLite (dev) + NeonDB/PostgreSQL (prod) + Prisma ORM
- **Autenticação**: JWT + Passport
- **Validação**: class-validator + class-transformer
- **Documentação**: Swagger/OpenAPI

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Components**: Shadcn/ui + Tailwind CSS
- **Estado**: React Context + Hooks

## 🔐 Autenticação

O sistema usa JWT com diferentes níveis de acesso:

- **ADMIN**: Acesso total ao sistema
- **THERAPIST**: Pode gerenciar clientes e prontuários
- **USER**: Acesso limitado (em desenvolvimento)

## 📋 Estrutura SOAP

Os prontuários seguem a metodologia SOAP:

- **S (Subjective)**: Queixa principal do paciente
- **O (Objective)**: Observações objetivas
- **A (Assessment)**: Avaliação e diagnóstico
- **P (Plan)**: Plano terapêutico

## 🧪 Testes

```bash
# Backend
cd backend
npm run test
npm run test:e2e

# Frontend
npm run test
```

## 📦 Scripts Disponíveis

### Backend
```bash
npm run start:dev    # Desenvolvimento com hot reload
npm run build        # Build de produção
npm run start:prod   # Executar produção
npm run test         # Testes unitários
npm run test:e2e     # Testes end-to-end
```

### Frontend
```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run preview      # Preview da build
npm run test         # Executar testes
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` no diretório `backend/`:

```bash
# Banco de dados
DATABASE_URL="file:./prisma/dev.db"

# Servidor
PORT=3000

# CORS
CORS_ORIGIN="http://localhost:5173"

# JWT
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="24h"

# Refresh Token
REFRESH_TOKEN_SECRET="your-refresh-secret-here"
REFRESH_TOKEN_EXPIRES_IN="7d"
```

## 🚨 Troubleshooting

### Problemas Comuns

**Porta já em uso:**
```bash
# Verificar portas
netstat -ano | findstr :3000
netstat -ano | findstr :5173

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

## 🤝 Contribuição

1. Fork o projeto
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

---

**🎉 PsicoPront** - Transformando a gestão de clínicas psicológicas!

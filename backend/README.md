# PsicoPront Backend

Backend completo para o sistema de gestão de clínica psicológica, construído com NestJS e Prisma.

## 🚀 Funcionalidades Implementadas

### ✅ Módulos Principais
- **🔐 Autenticação (Auth)**: Sistema JWT com refresh tokens e controle de roles
- **👥 Usuários (Users)**: Gestão de terapeutas e administradores
- **🏥 Clientes (Clients)**: Cadastro e gestão de pacientes
- **📅 Agendamentos (Bookings)**: Sistema de agendamento de consultas
- **🏢 Salas (Rooms)**: Gestão de salas de atendimento
- **📋 Prontuários (Medical Records)**: Documentação clínica com metodologia SOAP

### 🛡️ Segurança e Validação
- Autenticação JWT obrigatória
- Controle de acesso baseado em roles (ADMIN, THERAPIST, USER)
- Validação de dados com class-validator
- Interceptor global para logging
- Filtro global para tratamento de exceções
- CORS configurado para frontend

### 📊 Banco de Dados
- **Prisma ORM** com SQLite (desenvolvimento) e NeonDB/PostgreSQL (produção)
- Migrações automáticas
- Relacionamentos complexos entre entidades
- Validações de integridade referencial
- Suporte a connection pooling e SSL

## 🏗️ Estrutura do Projeto

```
backend/
├── src/
│   ├── auth/           # Autenticação e autorização
│   ├── users/          # Gestão de usuários
│   ├── clients/        # Gestão de clientes
│   ├── bookings/       # Sistema de agendamentos
│   ├── rooms/          # Gestão de salas
│   ├── medical-records/# Prontuários médicos
│   ├── prisma/         # Configuração do banco
│   ├── interceptors/   # Interceptores globais
│   ├── filters/        # Filtros de exceção
│   └── main.ts         # Configuração da aplicação
├── prisma/
│   ├── schema.prisma   # Schema do banco
│   └── migrations/     # Migrações do banco
└── docs/               # Documentação da API
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação

#### Desenvolvimento Local (SQLite)
```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp env.local.example .env

# Gerar cliente Prisma
npm run prisma:generate

# Executar migrações
npm run prisma:migrate

# Popular banco com dados de teste (opcional)
npm run prisma:seed
```

#### Produção com NeonDB
```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp env.neon.example .env
# Editar .env com suas credenciais do NeonDB

# Gerar cliente Prisma
npm run prisma:generate

# Executar migrações
npm run prisma:migrate

# Popular banco com dados de teste (opcional)
npm run prisma:seed
```

### Desenvolvimento
```bash
# Executar em modo desenvolvimento
npm run start:dev

# Executar testes
npm test

# Executar testes em modo watch
npm run test:watch

# Build do projeto
npm run build
```

### Produção
```bash
# Build para produção
npm run build

# Executar em produção
npm run start:prod
```

## 📚 Documentação da API

### Swagger UI
Acesse a documentação interativa da API em:
```
http://localhost:3000/docs
```

### Documentação por Módulo
- [API de Clientes](CLIENTS_API_README.md)
- [API de Prontuários](MEDICAL_RECORDS_API_README.md)
- [Integração com Agendamentos](INTEGRACAO_BOOKING_README.md)

## 🔐 Autenticação

### Endpoints Públicos
- `POST /auth/login` - Login de usuário
- `POST /auth/refresh` - Renovar token

### Endpoints Protegidos
Todos os outros endpoints requerem token JWT válido no header:
```
Authorization: Bearer <seu_token_jwt>
```

### Roles e Permissões
- **ADMIN**: Acesso total a todos os módulos
- **THERAPIST**: Pode gerenciar clientes, agendamentos e prontuários
- **USER**: Acesso limitado (se implementado)

## 🗄️ Modelos de Dados

### User (Usuário)
- Dados pessoais e profissionais
- Sistema de roles
- Hash de senha e refresh tokens

### Client (Cliente)
- Informações pessoais e médicas
- Histórico médico
- Contatos de emergência

### Room (Sala)
- Configurações da sala
- Recursos disponíveis
- Horários de funcionamento

### Booking (Agendamento)
- Vinculação cliente-terapeuta-sala
- Controle de conflitos de horário
- Status de confirmação

### MedicalRecord (Prontuário)
- Metodologia SOAP
- Histórico de sessões
- Vinculação com agendamentos

## 🔍 Funcionalidades Avançadas

### Sistema de Busca
- Busca inteligente por nome, email e telefone
- Busca semântica em prontuários
- Filtros por cliente, terapeuta e período

### Estatísticas e Relatórios
- Progresso do cliente ao longo das sessões
- Estatísticas do terapeuta
- Métricas de agendamento

### Validações de Negócio
- Verificação de conflitos de horário
- Validação de relacionamentos
- Controle de integridade dos dados

## 🧪 Testes

### Executar Testes
```bash
# Todos os testes
npm test

# Testes específicos
npm test -- --testPathPattern=clients

# Testes em modo watch
npm run test:watch

# Cobertura de testes
npm run test:cov
```

### Estrutura de Testes
- Testes unitários para services
- Mocks para PrismaService
- Cobertura de casos de sucesso e erro

## 🚀 Deploy



### Variáveis de Ambiente

#### Desenvolvimento (SQLite)
```bash
# Banco de dados
DATABASE_URL="file:./prisma/dev.db"

# Servidor
PORT=3000

# CORS
CORS_ORIGIN="http://localhost:5173"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="24h"
```

#### Produção (NeonDB)
```bash
# Banco de dados
DATABASE_URL="postgresql://username:password@ep-xxx-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require"

# Servidor
PORT=3000

# CORS
CORS_ORIGIN="http://localhost:5173"

# JWT
JWT_SECRET="your-super-secret-key"
JWT_EXPIRES_IN="24h"

# NeonDB específicas
DATABASE_POOL_SIZE=10
DATABASE_CONNECTION_TIMEOUT=30000
DATABASE_SSL_MODE="require"
```

## 📝 Logs e Monitoramento

### Logs Automáticos
- Todas as requisições HTTP
- Tempo de resposta
- Erros e exceções
- Stack traces para debugging

### Formato de Log
```
[HTTP] GET /clients - Iniciando requisição
[HTTP] GET /clients - Concluído em 45ms
[ExceptionFilter] GET /clients/999 - 404 - Cliente não encontrado
```

## 🔧 Configurações

### CORS
Configurado para permitir comunicação com frontend React:
- Origin: Configurável via CORS_ORIGIN
- Credentials: true
- Métodos: GET, POST, PUT, PATCH, DELETE, OPTIONS

### Validação
- Whitelist: true (remove campos não declarados)
- Transform: true (converte tipos automaticamente)
- ForbidNonWhitelisted: true (rejeita campos extras)

### Swagger
- Documentação automática da API
- Autenticação Bearer configurada
- Exemplos de uso para cada endpoint

## 🤝 Contribuição

### Padrões de Código
- ESLint configurado
- Prettier para formatação
- TypeScript strict mode
- NestJS best practices

### Estrutura de Commits
- feat: nova funcionalidade
- fix: correção de bug
- docs: documentação
- test: testes
- refactor: refatoração

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar logs da aplicação
2. Consultar documentação Swagger
3. Executar testes para validar funcionalidades
4. Verificar configurações de ambiente

## 🎯 Próximos Passos

### Funcionalidades Futuras
- [ ] Sistema de notificações
- [ ] Relatórios avançados
- [ ] Integração com calendários externos
- [ ] Backup automático do banco
- [ ] Métricas de performance
- [ ] Cache Redis para consultas frequentes

### Melhorias Técnicas
- [ ] Testes E2E
- [ ] CI/CD pipeline
- [ ] Monitoramento com Prometheus
- [ ] Rate limiting
- [ ] Compressão de respostas

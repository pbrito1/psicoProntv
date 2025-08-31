# 🗄️ Configuração do Prisma com NeonDB

Este guia explica como configurar o Prisma para usar o NeonDB (PostgreSQL serverless).

## 🔧 Configuração Básica

### 1. Schema do Prisma

O schema já está configurado para PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2. Variáveis de Ambiente

Configure o arquivo `.env` com sua string de conexão do NeonDB:

```bash
DATABASE_URL="postgresql://username:password@ep-xxx-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require"
```

## 🚀 Configuração Avançada

### 1. Pool de Conexões

Para melhor performance com NeonDB, adicione estas configurações:

```bash
# Pool de conexões
DATABASE_POOL_SIZE=10
DATABASE_CONNECTION_TIMEOUT=30000

# Configurações de SSL
DATABASE_SSL_MODE="require"
```

### 2. Configuração do Prisma Client

Crie um arquivo `prisma/neon-client.ts` para configurações específicas:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Configurações específicas para NeonDB
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## 🔄 Migrações

### 1. Primeira Migração

```bash
# Gerar cliente Prisma
npx prisma generate

# Criar primeira migração
npx prisma migrate dev --name init

# Aplicar migração
npx prisma migrate deploy
```

### 2. Migrações em Produção

```bash
# Aplicar migrações existentes
npx prisma migrate deploy

# Verificar status
npx prisma migrate status
```

## 🧪 Seed (Dados de Teste)

### 1. Executar Seed

```bash
# Executar seed
npx prisma db seed

# Ou manualmente
npx ts-node prisma/seed.ts
```

### 2. Verificar Dados

```bash
# Abrir Prisma Studio
npx prisma studio

# Ou usar CLI
npx prisma studio --port 5555
```

## 🔍 Troubleshooting

### 1. Problemas de Conexão

**Erro: SSL connection required**
```bash
# Adicione sslmode=require na URL
DATABASE_URL="postgresql://...?sslmode=require"
```

**Erro: Connection timeout**
```bash
# Aumente o timeout
DATABASE_CONNECTION_TIMEOUT=60000
```

### 2. Problemas de Performance

**Conexões lentas:**
```bash
# Reduza o pool de conexões
DATABASE_POOL_SIZE=5
```

**Queries lentas:**
```bash
# Habilite logs para debug
log: ['query', 'info', 'warn', 'error']
```

## 📊 Monitoramento

### 1. Health Check

O sistema inclui um health check que verifica a conexão com o banco:

```typescript
// Verificar conexão
const result = await prisma.$queryRaw`SELECT 1`
```

### 2. Logs do Prisma

```bash
# Habilite logs detalhados
log: ['query', 'info', 'warn', 'error']

# Para desenvolvimento
log: ['query', 'error', 'warn']
```

## 🚀 Deploy

### 1. Build de Produção

```bash
# Gerar cliente Prisma
npx prisma generate

# Build da aplicação
npm run build
```

### 2. Migrações em Produção

```bash
# Sempre execute migrações antes de iniciar a aplicação
npx prisma migrate deploy
```

## 🔒 Segurança

### 1. Variáveis de Ambiente

- **NUNCA** commite arquivos `.env`
- **SEMPRE** use `.env.example` como template
- **ROTACIONAR** credenciais regularmente

### 2. Conexões SSL

- NeonDB requer SSL obrigatório
- Use `sslmode=require` na URL de conexão
- Não desabilite SSL em produção

## 📚 Recursos Adicionais

- [Documentação do Prisma](https://www.prisma.io/docs)
- [NeonDB Documentation](https://neon.tech/docs)
- [PostgreSQL com Prisma](https://www.prisma.io/docs/concepts/database-connectors/postgresql)

## 🎯 Dicas Importantes

1. **Sempre** execute `npx prisma generate` após mudanças no schema
2. **Teste** migrações em desenvolvimento antes de produção
3. **Monitore** performance das queries em produção
4. **Backup** regular dos dados importantes
5. **Use** connection pooling para melhor performance

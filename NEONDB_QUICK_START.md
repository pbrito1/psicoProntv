# 🚀 Configuração Rápida do NeonDB - PsicoPront

Este guia te ajudará a configurar o NeonDB em menos de 5 minutos!

## ⚡ Passos Rápidos

### 1. 🌐 Criar Conta no NeonDB

1. Acesse [neon.tech](https://neon.tech)
2. Clique em "Sign Up" ou "Get Started"
3. Crie sua conta (GitHub, Google ou email)

### 2. 🏗️ Criar Projeto

1. Clique em "Create New Project"
2. Escolha um nome (ex: "psicopront")
3. Escolha a região mais próxima
4. Clique em "Create Project"

### 3. 📋 Copiar String de Conexão

1. No dashboard, clique em "Connection Details"
2. Copie a string de conexão que aparece
3. Formato: `postgresql://username:password@ep-xxx-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require`

### 4. ⚙️ Configurar Projeto

#### Windows (PowerShell)
```powershell
# Configurar ambiente de produção
.\setup-neon.ps1 prod

# Editar o arquivo backend\.env com sua string de conexão
```

#### Linux/Mac
```bash
# Copiar configuração NeonDB
cp backend/env.neon.example backend/.env

# Editar backend/.env com sua string de conexão
```

### 5. 🗄️ Configurar Banco

```bash
cd backend

# Gerar cliente Prisma
npx prisma generate

# Executar migrações
npx prisma migrate deploy

# Popular com dados de teste
npx prisma db seed
```

### 6. 🚀 Executar

```bash
# Iniciar backend
npm run start:dev

# Acessar: http://localhost:3000
# Swagger: http://localhost:3000/docs
```

## 🔧 Configuração Manual

### Arquivo `.env`

```bash
# String de conexão do NeonDB
DATABASE_URL="postgresql://username:password@ep-xxx-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require"

# Configurações do servidor
PORT=3000
CORS_ORIGIN="http://localhost:5173"

# JWT (obrigatório para produção)
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="24h"

# Refresh Token
REFRESH_TOKEN_SECRET="your-super-secret-refresh-token-key-here"
REFRESH_TOKEN_EXPIRES_IN="7d"

# NeonDB específicas
DATABASE_POOL_SIZE=10
DATABASE_CONNECTION_TIMEOUT=30000
DATABASE_SSL_MODE="require"
```

## 🚨 Problemas Comuns

### Erro: SSL connection required
```bash
# Adicione sslmode=require na URL
DATABASE_URL="postgresql://...?sslmode=require"
```

### Erro: Connection timeout
```bash
# Aumente o timeout
DATABASE_CONNECTION_TIMEOUT=60000
```

### Erro: Pool exhausted
```bash
# Reduza o pool de conexões
DATABASE_POOL_SIZE=5
```

## 📊 Verificar Conexão

### Health Check
```bash
# Verificar se o banco está conectando
curl http://localhost:3000/health
```

### Prisma Studio
```bash
# Abrir interface visual do banco
npx prisma studio
```

## 🔒 Segurança

- ✅ **SEMPRE** use `sslmode=require`
- ✅ **NUNCA** commite arquivos `.env`
- ✅ **ROTACIONAR** chaves JWT regularmente
- ✅ **LIMITAR** acesso às credenciais

## 📚 Documentação Completa

- [Configuração Prisma + NeonDB](backend/prisma/neon-setup.md)
- [README do Backend](backend/README.md)
- [Documentação NeonDB](https://neon.tech/docs)

## 🎯 Próximos Passos

1. **Teste a API**: Use o Swagger em http://localhost:3000/docs
2. **Gerencie dados**: Use o Prisma Studio
3. **Monitore logs**: Verifique a console do backend
4. **Configure produção**: Ajuste variáveis de ambiente

---

**🎉 Parabéns!** Seu projeto está rodando com NeonDB!

**💡 Dica**: Use sempre `sslmode=require` para conexões seguras com o NeonDB.

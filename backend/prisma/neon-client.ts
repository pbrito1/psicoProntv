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
  // Configurações de conexão para NeonDB
  // NeonDB é serverless, então não precisamos de pool muito grande
  // O Prisma gerencia as conexões automaticamente
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Função para fechar conexões (útil para testes)
export const disconnectPrisma = async () => {
  await prisma.$disconnect()
}

// Função para limpar banco (útil para testes)
export const clearDatabase = async () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Não é possível limpar banco em produção')
  }
  
  // Limpar todas as tabelas em ordem reversa (devido a foreign keys)
  await prisma.medicalRecord.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.client.deleteMany()
  await prisma.room.deleteMany()
  await prisma.user.deleteMany()
}

// Função para verificar saúde da conexão
export const checkDatabaseHealth = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { status: 'healthy', timestamp: new Date().toISOString() }
  } catch (error) {
    return { 
      status: 'unhealthy', 
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

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
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export const disconnectPrisma = async () => {
  await prisma.$disconnect()
}

export const clearDatabase = async () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Não é possível limpar banco em produção')
  }
  
  await prisma.medicalRecord.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.client.deleteMany()
  await prisma.room.deleteMany()
  await prisma.user.deleteMany()
}

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

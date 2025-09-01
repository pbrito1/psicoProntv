-- Migração para adicionar relacionamento direto entre terapeutas e clientes
-- Data: 2024-01-XX

-- Criar tabela de relacionamento terapeuta-cliente
CREATE TABLE "ClientTherapist" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "therapistId" INTEGER NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientTherapist_pkey" PRIMARY KEY ("id")
);

-- Adicionar constraint único para evitar relacionamentos duplicados
ALTER TABLE "ClientTherapist" ADD CONSTRAINT "ClientTherapist_clientId_therapistId_key" UNIQUE ("clientId", "therapistId");

-- Adicionar foreign keys
ALTER TABLE "ClientTherapist" ADD CONSTRAINT "ClientTherapist_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClientTherapist" ADD CONSTRAINT "ClientTherapist_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Criar índices para melhor performance
CREATE INDEX "ClientTherapist_clientId_idx" ON "ClientTherapist"("clientId");
CREATE INDEX "ClientTherapist_therapistId_idx" ON "ClientTherapist"("therapistId");
CREATE INDEX "ClientTherapist_active_idx" ON "ClientTherapist"("endDate") WHERE "endDate" IS NULL;

-- Migrar dados existentes baseados em agendamentos e prontuários
-- Para cada cliente que tem agendamentos ou prontuários com um terapeuta, criar o relacionamento
INSERT INTO "ClientTherapist" ("clientId", "therapistId", "isPrimary", "startDate")
SELECT DISTINCT 
    b."clientId",
    b."therapistId",
    true as "isPrimary",
    MIN(b."createdAt") as "startDate"
FROM "Booking" b
WHERE b."clientId" IS NOT NULL
GROUP BY b."clientId", b."therapistId";

-- Adicionar relacionamentos baseados em prontuários (se não existirem)
INSERT INTO "ClientTherapist" ("clientId", "therapistId", "isPrimary", "startDate")
SELECT DISTINCT 
    mr."clientId",
    mr."therapistId",
    false as "isPrimary",
    MIN(mr."createdAt") as "startDate"
FROM "MedicalRecord" mr
WHERE NOT EXISTS (
    SELECT 1 FROM "ClientTherapist" ct 
    WHERE ct."clientId" = mr."clientId" 
    AND ct."therapistId" = mr."therapistId"
);

-- Atualizar o schema do Prisma
-- NOTA: Execute 'npx prisma generate' após aplicar esta migração

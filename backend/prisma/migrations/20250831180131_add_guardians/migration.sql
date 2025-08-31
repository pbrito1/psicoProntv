-- CreateTable
CREATE TABLE "public"."Guardian" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "passwordHash" TEXT NOT NULL,
    "refreshTokenHash" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "canViewRecords" BOOLEAN NOT NULL DEFAULT true,
    "canBookSessions" BOOLEAN NOT NULL DEFAULT false,
    "canCancelSessions" BOOLEAN NOT NULL DEFAULT false,
    "canViewBilling" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guardian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_ClientToGuardian" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ClientToGuardian_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Guardian_email_key" ON "public"."Guardian"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Guardian_cpf_key" ON "public"."Guardian"("cpf");

-- CreateIndex
CREATE INDEX "_ClientToGuardian_B_index" ON "public"."_ClientToGuardian"("B");

-- AddForeignKey
ALTER TABLE "public"."_ClientToGuardian" ADD CONSTRAINT "_ClientToGuardian_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ClientToGuardian" ADD CONSTRAINT "_ClientToGuardian_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Guardian"("id") ON DELETE CASCADE ON UPDATE CASCADE;

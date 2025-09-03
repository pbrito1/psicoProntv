-- CreateTable
CREATE TABLE "public"."ClientTherapist" (
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

-- CreateIndex
CREATE UNIQUE INDEX "ClientTherapist_clientId_therapistId_key" ON "public"."ClientTherapist"("clientId", "therapistId");

-- AddForeignKey
ALTER TABLE "public"."ClientTherapist" ADD CONSTRAINT "ClientTherapist_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClientTherapist" ADD CONSTRAINT "ClientTherapist_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

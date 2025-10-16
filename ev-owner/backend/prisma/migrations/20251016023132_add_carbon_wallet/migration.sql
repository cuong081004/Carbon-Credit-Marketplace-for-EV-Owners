-- CreateTable
CREATE TABLE "CarbonWallet" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarbonWallet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CarbonWallet_userId_key" ON "CarbonWallet"("userId");

-- AddForeignKey
ALTER TABLE "CarbonWallet" ADD CONSTRAINT "CarbonWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

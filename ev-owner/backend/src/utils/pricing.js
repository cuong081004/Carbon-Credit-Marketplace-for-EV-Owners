import prisma from '../prisma/client.js';

export async function suggestPricePerCreditCents(userId) {
  const fixedListings = await prisma.listing.findMany({
    where: { status: 'ACTIVE', type: 'FIXED', userId: { not: userId } },
    select: { pricePerCreditCents: true },
    take: 50,
    orderBy: { startAt: 'desc' },
  });
  const values = fixedListings
    .map(l => l.pricePerCreditCents)
    .filter(v => typeof v === 'number');
  if (values.length === 0) return 1000;
  values.sort((a, b) => a - b);
  const mid = Math.floor(values.length / 2);
  const median = values.length % 2 === 0 ? Math.round((values[mid - 1] + values[mid]) / 2) : values[mid];
  return median;
}

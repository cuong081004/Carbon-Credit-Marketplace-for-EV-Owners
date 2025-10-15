import express from 'express';
import prisma from '../prisma/client.js';
import { authMiddleware } from './auth.js';
import { suggestPricePerCreditCents } from '../utils/pricing.js';

const router = express.Router();

router.get('/suggest-price', authMiddleware, async (req, res) => {
  const cents = await suggestPricePerCreditCents(req.user.id);
  res.json({ suggestedPricePerCreditCents: cents });
});

router.get('/my-lots', authMiddleware, async (req, res) => {
  const lots = await prisma.creditLot.findMany({
    where: { userId: req.user.id, status: 'AVAILABLE', availableCredits: { gt: 0 } },
    orderBy: { mintedAt: 'desc' },
  });
  res.json({ lots });
});

router.get('/listings', async (req, res) => {
  const listings = await prisma.listing.findMany({
    where: { status: 'ACTIVE' },
    include: { user: { select: { id: true, name: true } }, creditLot: true },
    orderBy: { startAt: 'desc' },
  });
  res.json({ listings });
});

router.post('/listings', authMiddleware, async (req, res) => {
  try {
    const { creditLotId, type, quantity, pricePerCreditCents, minPricePerCreditCents, endAt } = req.body;
    const lot = await prisma.creditLot.findFirst({ where: { id: creditLotId, userId: req.user.id } });
    if (!lot) return res.status(404).json({ error: 'Credit lot not found' });
    const qty = Number(quantity) || 0;
    if (qty <= 0 || qty > Number(lot.availableCredits)) return res.status(400).json({ error: 'Invalid quantity' });
    const listing = await prisma.listing.create({
      data: {
        userId: req.user.id,
        creditLotId,
        type,
        status: 'ACTIVE',
        quantity: qty,
        pricePerCreditCents: type === 'FIXED' ? parseInt(pricePerCreditCents, 10) : null,
        minPricePerCreditCents: type === 'AUCTION' ? parseInt(minPricePerCreditCents, 10) : null,
        endAt: endAt ? new Date(endAt) : null,
      },
    });
    await prisma.creditLot.update({ where: { id: lot.id }, data: { status: 'LISTED', availableCredits: { decrement: qty } } });
    res.json({ listing });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

router.post('/bids', authMiddleware, async (req, res) => {
  const { listingId, pricePerCreditCents, quantity } = req.body;
  const listing = await prisma.listing.findUnique({ where: { id: parseInt(listingId, 10) } });
  if (!listing || listing.type !== 'AUCTION' || listing.status !== 'ACTIVE') return res.status(400).json({ error: 'Invalid listing' });
  const bid = await prisma.bid.create({
    data: {
      listingId: listing.id,
      userId: req.user.id,
      pricePerCreditCents: parseInt(pricePerCreditCents, 10),
      quantity: Number(quantity) || 0,
      status: 'ACTIVE',
    },
  });
  res.json({ bid });
});

router.post('/purchase', authMiddleware, async (req, res) => {
  try {
    const { listingId, quantity } = req.body;
    const qty = Number(quantity) || 0;
    const listing = await prisma.listing.findUnique({ where: { id: parseInt(listingId, 10) } });
    if (!listing || listing.status !== 'ACTIVE') return res.status(400).json({ error: 'Invalid listing' });
    if (listing.type !== 'FIXED') return res.status(400).json({ error: 'Use bids for auctions' });
    if (qty <= 0 || qty > Number(listing.quantity)) return res.status(400).json({ error: 'Invalid quantity' });
    const total = qty * listing.pricePerCreditCents;
    const wallet = await prisma.wallet.findUnique({ where: { userId: req.user.id } });
    if (!wallet || wallet.balanceCents < total) return res.status(400).json({ error: 'Insufficient wallet balance' });

    const tx = await prisma.$transaction(async (txp) => {
      await txp.wallet.update({ where: { userId: req.user.id }, data: { balanceCents: { decrement: total } } });
      await txp.ledgerEntry.create({ data: { userId: req.user.id, type: 'PURCHASE', amountCents: -total, creditsDelta: qty } });

      await txp.wallet.update({ where: { userId: listing.userId }, data: { balanceCents: { increment: total } } });
      await txp.ledgerEntry.create({ data: { userId: listing.userId, type: 'SALE_PROCEEDS', amountCents: total, creditsDelta: -qty } });

      const trade = await txp.transaction.create({
        data: {
          listingId: listing.id,
          buyerId: req.user.id,
          sellerId: listing.userId,
          quantity: qty,
          pricePerCreditCents: listing.pricePerCreditCents,
          totalCents: total,
          status: 'COMPLETED',
        },
      });

      await txp.listing.update({ where: { id: listing.id }, data: { quantity: { decrement: qty }, status: qty === Number(listing.quantity) ? 'SOLD_OUT' : 'ACTIVE' } });

      await txp.creditLot.create({ data: { userId: req.user.id, credits: qty, availableCredits: qty, status: 'AVAILABLE' } });

      return trade;
    });

    res.json({ transaction: tx });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Purchase failed' });
  }
});

export default router;

import express from 'express';
import prisma from '../prisma/client.js';
import { authMiddleware } from './auth.js';

const router = express.Router();

router.get('/me', authMiddleware, async (req, res) => {
  const [tripsAgg, creditsAgg, revenueAgg] = await Promise.all([
    prisma.trip.aggregate({ _sum: { co2ReducedKg: true, distanceKm: true, energyKWh: true }, where: { userId: req.user.id } }),
    prisma.creditLot.aggregate({ _sum: { credits: true, availableCredits: true }, where: { userId: req.user.id } }),
    prisma.ledgerEntry.aggregate({ _sum: { amountCents: true }, where: { userId: req.user.id, type: 'SALE_PROCEEDS' } }),
  ]);
  res.json({
    co2ReducedKg: tripsAgg._sum.co2ReducedKg || 0,
    distanceKm: tripsAgg._sum.distanceKm || 0,
    energyKWh: tripsAgg._sum.energyKWh || 0,
    totalCredits: creditsAgg._sum.credits || 0,
    availableCredits: creditsAgg._sum.availableCredits || 0,
    revenueCents: revenueAgg._sum.amountCents || 0,
  });
});

export default router;

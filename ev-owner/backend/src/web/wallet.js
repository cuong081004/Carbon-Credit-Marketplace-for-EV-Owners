import express from 'express';
import prisma from '../prisma/client.js';
import { authMiddleware } from './auth.js';

const router = express.Router();

router.get('/me', authMiddleware, async (req, res) => {
  const wallet = await prisma.wallet.findUnique({ where: { userId: req.user.id } });
  const entries = await prisma.ledgerEntry.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } });
  res.json({ wallet, entries });
});

router.post('/deposit', authMiddleware, async (req, res) => {
  const { amountCents } = req.body;
  const amount = parseInt(amountCents, 10) || 0;
  if (amount <= 0) return res.status(400).json({ error: 'Invalid amount' });
  const updated = await prisma.wallet.update({
    where: { userId: req.user.id },
    data: { balanceCents: { increment: amount } },
  });
  await prisma.ledgerEntry.create({ data: { userId: req.user.id, type: 'DEPOSIT', amountCents: amount, creditsDelta: 0 } });
  res.json({ wallet: updated });
});

router.post('/withdraw', authMiddleware, async (req, res) => {
  const { amountCents } = req.body;
  const amount = parseInt(amountCents, 10) || 0;
  if (amount <= 0) return res.status(400).json({ error: 'Invalid amount' });
  const wallet = await prisma.wallet.findUnique({ where: { userId: req.user.id } });
  if (!wallet || wallet.balanceCents < amount) return res.status(400).json({ error: 'Insufficient balance' });
  const updated = await prisma.wallet.update({
    where: { userId: req.user.id },
    data: { balanceCents: { decrement: amount } },
  });
  await prisma.ledgerEntry.create({ data: { userId: req.user.id, type: 'WITHDRAWAL', amountCents: -amount, creditsDelta: 0 } });
  const payout = await prisma.payout.create({ data: { userId: req.user.id, amountCents: amount, status: 'REQUESTED' } });
  res.json({ wallet: updated, payout });
});

export default router;

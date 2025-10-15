import express from 'express';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import prisma from '../prisma/client.js';
import { authMiddleware } from './auth.js';
import { computeCo2ReducedKg, convertCo2KgToCredits } from '../utils/co2.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', authMiddleware, async (req, res) => {
  const trips = await prisma.trip.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } });
  res.json({ trips });
});

router.post('/import', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'File is required (CSV)' });
    const csvText = req.file.buffer.toString('utf8');
    const rows = parse(csvText, { columns: true, skip_empty_lines: true, trim: true });

    let totalCredits = 0;
    const createdTrips = [];
    for (const row of rows) {
      const distanceKm = parseFloat(row.distance_km || row.distanceKm || '0');
      const energyKWh = parseFloat(row.energy_kwh || row.energyKWh || '0');
      const startAt = row.startAt || row.start_at || null;
      const endAt = row.endAt || row.end_at || null;
      const co2ReducedKg = computeCo2ReducedKg({ distanceKm, energyKWh });
      const credits = convertCo2KgToCredits(co2ReducedKg);
      totalCredits += credits;
      const trip = await prisma.trip.create({
        data: {
          userId: req.user.id,
          sourceFileName: req.file.originalname,
          startAt: startAt ? new Date(startAt) : null,
          endAt: endAt ? new Date(endAt) : null,
          distanceKm: distanceKm || 0,
          energyKWh: energyKWh || 0,
          co2ReducedKg: co2ReducedKg || 0,
          status: 'PROCESSED',
        },
      });
      createdTrips.push(trip);
      await prisma.creditLot.create({
        data: {
          userId: req.user.id,
          tripId: trip.id,
          credits: credits,
          availableCredits: credits,
          status: 'AVAILABLE',
        },
      });
    }

    res.json({ count: createdTrips.length, totalCreditsMinted: totalCredits, trips: createdTrips });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to import trips' });
  }
});

export default router;

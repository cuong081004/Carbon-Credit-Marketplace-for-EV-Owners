import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './web/auth.js';
import tripRouter from './web/trips.js';
import walletRouter from './web/wallet.js';
import marketRouter from './web/market.js';
import reportRouter from './web/reports.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('🚀 EV Owner Backend is running!');
});

app.use('/api/auth', authRouter);
app.use('/api/trips', tripRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/market', marketRouter);
app.use('/api/reports', reportRouter);

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

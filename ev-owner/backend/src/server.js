import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import userRoutes from "./routes/userRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());

// ✅ Route kiểm tra server
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running 🚀' });
});

// ✅ Gắn route Auth sau khi có app
app.use('/api/auth', authRoutes);

app.use("/api/user", userRoutes);

app.use("/api/wallet", walletRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

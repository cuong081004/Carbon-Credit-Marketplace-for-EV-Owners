import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// ✅ Lấy ví carbon của user đang đăng nhập
export const getWallet = async (req, res) => {
  try {
    const userId = req.user.userId; // từ middleware xác thực JWT

    const wallet = await prisma.carbonWallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      return res.status(404).json({ message: "Không tìm thấy ví carbon" });
    }

    res.json(wallet);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// ✅ Cộng thêm carbon
export const addCarbon = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { amount } = req.body;

    const wallet = await prisma.carbonWallet.update({
      where: { userId },
      data: { balance: { increment: amount } },
    });

    res.json({ message: "Cộng carbon thành công", wallet });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// ✅ Trừ carbon
export const subtractCarbon = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { amount } = req.body;

    const wallet = await prisma.carbonWallet.update({
      where: { userId },
      data: { balance: { decrement: amount } },
    });

    res.json({ message: "Trừ carbon thành công", wallet });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Tạo ví carbon thủ công
export const createWallet = async (req, res) => {
  try {
    const userId = req.user.userId;

    const existingWallet = await prisma.carbonWallet.findUnique({ where: { userId } });
    if (existingWallet)
      return res.status(400).json({ message: "User đã có ví carbon" });

    const wallet = await prisma.carbonWallet.create({
      data: { userId, balance: 0 },
    });

    res.json({ message: "Tạo ví thành công", wallet });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

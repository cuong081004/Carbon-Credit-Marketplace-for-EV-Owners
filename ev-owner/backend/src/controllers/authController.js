import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prisma/client.js";

// Đăng ký người dùng
export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: "Email đã được sử dụng" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { email, password: hashedPassword, name },
      select: { id: true, name: true, email: true, createdAt: true },
    });

//  Tự động tạo ví carbon cho user mới
    await prisma.carbonWallet.create({
      data: {
        userId: newUser.id,
        balance: 0, // số dư mặc định ban đầu
      },
    });

    res.status(201).json({ message: "Đăng ký thành công", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Đăng nhập người dùng
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Sai mật khẩu" });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({ message: "Đăng nhập thành công", token });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

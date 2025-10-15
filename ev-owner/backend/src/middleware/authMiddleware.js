import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Kiểm tra xem header có token không
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Không có token hoặc token không hợp lệ" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Lưu thông tin user vào request để các API khác có thể dùng
    req.user = decoded;

    next(); // Cho phép đi tiếp
  } catch (error) {
    return res.status(401).json({ message: "Xác thực thất bại", error: error.message });
  }
};

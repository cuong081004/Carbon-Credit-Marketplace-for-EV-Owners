import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// API chỉ cho phép user có token truy cập
router.get("/profile", verifyToken, (req, res) => {
  res.json({
    message: "Truy cập hợp lệ ✅",
    user: req.user,
  });
});

export default router;

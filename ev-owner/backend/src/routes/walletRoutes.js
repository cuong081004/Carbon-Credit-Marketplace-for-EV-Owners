import express from "express";
import { getWallet, addCarbon, subtractCarbon, createWallet } from "../controllers/walletController.js";
import { verifyToken } from "../middleware/authMiddleware.js"; 

const router = express.Router();

router.get("/", verifyToken, getWallet);       
router.post("/add", verifyToken, addCarbon);
router.post("/subtract", verifyToken, subtractCarbon);
router.post("/create", verifyToken, createWallet);

export default router;

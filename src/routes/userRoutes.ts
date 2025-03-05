import express from "express";
import { getUserProfile } from "../controllers/userController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/me", protect, getUserProfile); // ✅ Ensure this is correctly defined

export default router;
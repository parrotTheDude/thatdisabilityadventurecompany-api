import express from "express";
import { getUserProfile, getAllUsers } from "../controllers/userController"; // ✅ Added getAllUsers
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/me", protect, getUserProfile);
router.get("/", protect, getAllUsers); // ✅ Now properly imported

export default router;
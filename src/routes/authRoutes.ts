import express from "express";
import { login, logout } from "../controllers/authController"; // ✅ Ensure this is correctly imported

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);

export default router;
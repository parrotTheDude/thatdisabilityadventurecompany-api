import express from "express";
import { getSubscriptionLists } from "../controllers/subscriptionController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/lists", protect, getSubscriptionLists); // ✅ Fetch all subscription lists

export default router;
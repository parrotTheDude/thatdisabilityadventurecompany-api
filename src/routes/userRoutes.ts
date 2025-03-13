import express from "express";
import {
    getAllUsers,
    searchUsers,
    exportUsers,
    getUserTypes,
    getUserById,
    createUser,
    updateUser,
    getUserProfile
  } from "../controllers/userController";
import { getSubscriptionLists } from "../controllers/subscriptionController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/", protect, getAllUsers);
router.get("/me", protect, getUserProfile);
router.get("/search", protect, searchUsers);
router.get("/export", protect, exportUsers);
router.get("/types", protect, getUserTypes);
router.get("/:id", protect, getUserById);
router.post("/", protect, createUser);
router.put("/:id", protect, updateUser);
router.get("/subscriptions/lists", protect, getSubscriptionLists);

export default router;
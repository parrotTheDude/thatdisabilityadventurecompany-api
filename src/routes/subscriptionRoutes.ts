import express from "express";
import { 
  getSubscriptionLists, 
  getSubscribersByList, 
  toggleSubscription, 
  addUserToSubscription, 
  createSubscriptionList 
} from "../controllers/subscriptionController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

// ✅ Corrected route paths (no extra "/subscriptions")
router.get("/", protect, getSubscriptionLists); // ✅ View all subscription lists
router.get("/:list_name", protect, getSubscribersByList); // ✅ View subscribers of a list
router.put("/toggle", protect, toggleSubscription); // ✅ Toggle subscription status
router.post("/add", protect, addUserToSubscription); // ✅ Add user to a list
router.post("/create", protect, createSubscriptionList); // ✅ Create a new subscription list

export default router;
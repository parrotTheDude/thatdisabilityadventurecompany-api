import express from "express";
import { getSubscriptionLists, getSubscribersByList, toggleSubscription, addUserToSubscription, createSubscriptionList } from "../controllers/subscriptionController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/subscriptions", getSubscriptionLists); // ✅ View all subscription lists
router.get("/subscriptions/:list_name", getSubscribersByList); // ✅ View subscribers of a list
router.put("/subscriptions/toggle", toggleSubscription); // ✅ Toggle subscription status
router.post("/subscriptions/add", addUserToSubscription); // ✅ Add user to a list
router.post("/subscriptions/create", createSubscriptionList); // ✅ Create a new subscription list

export default router;
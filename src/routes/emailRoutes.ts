import express from "express";
import { getEmailTemplates, editEmailTemplate, getSentEmails } from "../controllers/emailController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/templates", protect, getEmailTemplates); // ✅ Fetch all email templates
router.put("/templates/:id", protect, editEmailTemplate); // ✅ Edit an email template
router.get("/sent", protect, getSentEmails); // ✅ View email logs

export default router;
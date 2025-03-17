import express from "express";
import { getEmailTemplates, addEmailTemplate } from "../controllers/emailController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/templates", protect, getEmailTemplates); // ✅ Fetch templates
router.post("/templates", protect, addEmailTemplate); // ✅ Add new template

export default router;
import express from "express";
import { getEmailTemplates, getEmailTemplateById, editEmailTemplate } from "../controllers/emailController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/templates", protect, getEmailTemplates); // ✅ Fetch all templates
router.get("/templates/:id", protect, getEmailTemplateById); // ✅ Fetch a single template
router.put("/templates/:id", protect, editEmailTemplate); // ✅ Edit a template

export default router;
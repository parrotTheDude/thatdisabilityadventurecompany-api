import { Request, Response } from "express";
import db from "../config/database";
import axios from "axios";
import postmark from "postmark";

// ✅ Get All Email Templates (Fetched from Database or BeeFree API)
export const getEmailTemplates = async (req: Request, res: Response): Promise<void> => {
  try {
    const [templates] = await db.query("SELECT id, name, content FROM email_templates");
    res.json(templates);
  } catch (error) {
    console.error("❌ Error fetching email templates:", error);
    res.status(500).json({ message: "Failed to fetch email templates" });
  }
};

export const addEmailTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, content } = req.body;

    if (!name || !content) {
      res.status(400).json({ message: "Name and content are required" });
      return;
    }

    await db.query("INSERT INTO email_templates (name, content) VALUES (?, ?)", [name, content]);

    res.json({ message: "Template saved successfully" });
  } catch (error) {
    console.error("❌ Error saving email template:", error);
    res.status(500).json({ message: "Failed to save email template" });
  }
};
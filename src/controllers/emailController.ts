import { Request, Response } from "express";
import db from "../config/database";
import axios from "axios";
import postmark from "postmark";

const postmarkApiKey = process.env.POSTMARK_API_KEY || "";
if (!postmarkApiKey) {
  console.error("❌ POSTMARK_API_KEY is missing in environment variables!");
}

const postmarkClient = new postmark.ServerClient(postmarkApiKey);

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

export const getEmailTemplateById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const [templates] = await db.query("SELECT id, name, content FROM email_templates WHERE id = ?", [id]);

    if ((templates as any[]).length === 0) {
      res.status(404).json({ message: "Template not found" });
      return;
    }

    res.json((templates as any[])[0]);
  } catch (error) {
    console.error("❌ Error fetching email template:", error);
    res.status(500).json({ message: "Failed to fetch email template" });
  }
};

export const editEmailTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, content } = req.body;

    if (!name || !content) {
      res.status(400).json({ message: "Name and content are required" });
      return;
    }

    await db.query("UPDATE email_templates SET name = ?, content = ?, updated_at = NOW() WHERE id = ?", [name, content, id]);

    res.json({ message: "Email template updated successfully" });
  } catch (error) {
    console.error("❌ Error updating email template:", error);
    res.status(500).json({ message: "Failed to update email template" });
  }
};

export const sendTestEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, templateContent } = req.body;

    if (!email || !templateContent) {
      res.status(400).json({ message: "Email and template content are required" });
      return;
    }

    await postmarkClient.sendEmail({
      From: "no-reply@yourdomain.com",
      To: email,
      Subject: "Test Email",
      HtmlBody: templateContent,
    });

    res.json({ message: "Test email sent successfully!" });
  } catch (error) {
    console.error("❌ Failed to send test email:", error);
    res.status(500).json({ message: "Failed to send test email." });
  }
};
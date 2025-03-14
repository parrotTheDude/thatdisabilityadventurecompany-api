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

// ✅ Edit an Email Template (Replace Variables)
export const editEmailTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { content } = req.body;
  
      await db.query("UPDATE email_templates SET content = ? WHERE id = ?", [content, id]);
  
      res.json({ message: "Email template updated successfully" });
    } catch (error) {
      console.error("❌ Error updating email template:", error);
      res.status(500).json({ message: "Failed to update email template" });
    }
  };

// // ✅ Configure Postmark Client
// const postmarkClient = new postmark.ServerClient(process.env.POSTMARK_API_KEY || "");

// // ✅ Send Bulk Email
// export const sendBulkEmail = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { list_name, template_id, variables } = req.body;

//     if (!list_name || !template_id) {
//       res.status(400).json({ message: "List name and template ID are required" });
//       return;
//     }

//     // ✅ Fetch Subscribers from DB
//     const [subscribers] = await db.query(
//       "SELECT u.email FROM subscriptions s JOIN users u ON s.user_id = u.id WHERE s.list_name = ? AND s.subscribed = 1",
//       [list_name]
//     );

//     if ((subscribers as any[]).length === 0) {
//       res.status(404).json({ message: "No subscribers found for this list" });
//       return;
//     }

//     // ✅ Fetch Email Template
//     const [templateData] = await db.query("SELECT content FROM email_templates WHERE id = ?", [template_id]);
//     if ((templateData as any[]).length === 0) {
//       res.status(404).json({ message: "Template not found" });
//       return;
//     }

//     let emailContent = (templateData as any[])[0].content;

//     // ✅ Replace Variables in Email Template
//     Object.keys(variables).forEach((key) => {
//       emailContent = emailContent.replace(new RegExp(`{{${key}}}`, "g"), variables[key]);
//     });

//     // ✅ Prepare and Send Emails via Postmark
//     const emailPromises = (subscribers as { email: string }[]).map(async (subscriber) => {
//       await postmarkClient.sendEmail({
//         From: "no-reply@yourdomain.com",
//         To: subscriber.email,
//         Subject: "Your Custom Email",
//         HtmlBody: emailContent,
//       });

//       // ✅ Log Sent Emails
//       await db.query(
//         "INSERT INTO email_logs (list_name, email, template_id, sent_at) VALUES (?, ?, ?, NOW())",
//         [list_name, subscriber.email, template_id]
//       );
//     });

//     await Promise.all(emailPromises);

//     res.json({ message: "Emails sent successfully" });
//   } catch (error) {
//     console.error("❌ Error sending bulk email:", error);
//     res.status(500).json({ message: "Failed to send emails" });
//   }
// };

// ✅ View Sent Emails (Logs)
export const getSentEmails = async (req: Request, res: Response): Promise<void> => {
    try {
      const [emails] = await db.query(
        "SELECT list_name, email, template_id, sent_at FROM email_logs ORDER BY sent_at DESC"
      );
  
      res.json(emails);
    } catch (error) {
      console.error("❌ Error fetching sent emails:", error);
      res.status(500).json({ message: "Failed to fetch sent emails" });
    }
  };
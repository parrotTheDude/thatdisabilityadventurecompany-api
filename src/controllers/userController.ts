import { Request, Response } from "express";
import db from "../config/database";

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userId = req.user.id;
    const [users] = await db.query("SELECT id, name, email FROM users WHERE id = ?", [userId]);

    if ((users as any[]).length === 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json((users as any[])[0]);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
};
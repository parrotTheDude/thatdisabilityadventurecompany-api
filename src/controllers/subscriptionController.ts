import { Request, Response } from "express";
import db from "../config/database";

export const getSubscriptionLists = async (req: Request, res: Response): Promise<void> => {
  try {
    const [lists] = await db.query("SELECT DISTINCT list_name FROM subscriptions");
    res.json(lists);
  } catch (error) {
    console.error("❌ Error fetching subscription lists:", error);
    res.status(500).json({ message: "Failed to fetch subscription lists" });
  }
};
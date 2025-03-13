import { Request, Response } from "express";
import db from "../config/database";

// ✅ Get all subscription lists with subscriber & unsubscriber counts
export const getSubscriptionLists = async (req: Request, res: Response): Promise<void> => {
  try {
    const [lists] = await db.query(`
      SELECT list_name, 
             SUM(CASE WHEN subscribed = 1 THEN 1 ELSE 0 END) AS subscribed_count,
             SUM(CASE WHEN subscribed = 0 THEN 1 ELSE 0 END) AS unsubscribed_count
      FROM subscriptions
      GROUP BY list_name
      ORDER BY list_name ASC
    `);

    res.json(lists);
  } catch (error) {
    console.error("❌ Error fetching subscription lists:", error);
    res.status(500).json({ message: "Failed to fetch subscription lists" });
  }
};

// ✅ Get all users subscribed/unsubscribed to a specific list
export const getSubscribersByList = async (req: Request, res: Response): Promise<void> => {
  try {
    const { list_name } = req.params;

    const [subscribers] = await db.query(`
      SELECT u.email, s.subscribed
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      WHERE s.list_name = ?
    `, [list_name]);

    res.json(subscribers);
  } catch (error) {
    console.error(`❌ Error fetching subscribers for ${req.params.list_name}:`, error);
    res.status(500).json({ message: "Failed to fetch subscribers" });
  }
};

// ✅ Toggle subscription status for a user
export const toggleSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, list_name } = req.body;

    // ✅ Check if the subscription exists
    const [existingSub] = await db.query(
      "SELECT s.user_id, s.subscribed FROM subscriptions s JOIN users u ON s.user_id = u.id WHERE u.email = ? AND s.list_name = ?",
      [email, list_name]
    );

    if ((existingSub as any[]).length === 0) {
      res.status(404).json({ message: "Subscription not found" });
      return;
    }

    const { user_id, subscribed } = (existingSub as any[])[0];

    // ✅ Toggle subscribed state
    await db.query(
      "UPDATE subscriptions SET subscribed = ?, updated_at = NOW() WHERE user_id = ? AND list_name = ?",
      [subscribed ? 0 : 1, user_id, list_name]
    );

    res.json({ message: "Subscription status updated successfully" });
  } catch (error) {
    console.error("❌ Error toggling subscription:", error);
    res.status(500).json({ message: "Failed to toggle subscription" });
  }
};

// ✅ Add user to a subscription list (if not already present)
export const addUserToSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, list_name } = req.body;

    // ✅ Get user ID from email
    const [user] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if ((user as any[]).length === 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    
    const user_id = (user as any[])[0].id;

    // ✅ Check if subscription already exists
    const [existingSub] = await db.query(
      "SELECT id FROM subscriptions WHERE user_id = ? AND list_name = ?",
      [user_id, list_name]
    );

    if ((existingSub as any[]).length > 0) {
      res.status(400).json({ message: "User is already in this subscription list" });
      return;
    }

    // ✅ Insert new subscription
    await db.query(
      "INSERT INTO subscriptions (user_id, list_name, subscribed, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())",
      [user_id, list_name, 1]
    );

    res.json({ message: "User added to subscription list" });
  } catch (error) {
    console.error("❌ Error adding user to subscription:", error);
    res.status(500).json({ message: "Failed to add user to subscription" });
  }
};

// ✅ Create a new subscription list (optionally copying users from another list)
export const createSubscriptionList = async (req: Request, res: Response): Promise<void> => {
  try {
    const { new_list_name, copy_from_list, emails } = req.body;

    if (!new_list_name) {
      res.status(400).json({ message: "New list name is required" });
      return;
    }

    // ✅ Insert users from an existing list if requested
    if (copy_from_list) {
      await db.query(
        "INSERT INTO subscriptions (user_id, list_name, subscribed, created_at, updated_at) SELECT user_id, ?, subscribed, NOW(), NOW() FROM subscriptions WHERE list_name = ?",
        [new_list_name, copy_from_list]
      );
    }

    // ✅ Insert individual emails if provided
    if (emails && emails.length > 0) {
      for (const email of emails) {
        const [user] = await db.query("SELECT id FROM users WHERE email = ?", [email]);

        if ((user as any[]).length > 0) {
          const user_id = (user as any[])[0].id;
          await db.query(
            "INSERT INTO subscriptions (user_id, list_name, subscribed, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())",
            [user_id, new_list_name, 1]
          );
        }
      }
    }

    res.json({ message: "Subscription list created successfully" });
  } catch (error) {
    console.error("❌ Error creating subscription list:", error);
    res.status(500).json({ message: "Failed to create subscription list" });
  }
};
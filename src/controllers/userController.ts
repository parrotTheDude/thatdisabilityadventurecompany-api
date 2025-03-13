import { Request, Response } from "express";
import db from "../config/database";
import { RowDataPacket } from "mysql2";
import { Parser } from "json2csv"; // ✅ Import CSV parser

interface User {
  id: number;
  name: string;
  last_name: string;
  email: string;
  user_type: string;
  gender: string;
}

interface GenderRow {
  gender: string;
}

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      console.log("❌ req.user is undefined");
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    console.log("✅ Authenticated user:", req.user);

    const userId = req.user.id;
    const [users] = await db.query("SELECT id, name, last_name, email, user_type, gender FROM users WHERE id = ?", [userId]);

    if ((users as any[]).length === 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json((users as any[])[0]);
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const [users] = await db.query<User[] & RowDataPacket[]>(
      "SELECT id, name, last_name, email, user_type, gender FROM users"
    );

    res.json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const getUserTypes = async (req: Request, res: Response) => {
  try {
    const [userTypes] = await db.query("SELECT DISTINCT user_type FROM users");
    res.json(userTypes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user types" });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;

    const [users] = await db.query<User[] & RowDataPacket[]>(
      "SELECT id, name, last_name, email, user_type, gender FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const [subscriptions] = await db.query<{ list_name: string; subscribed: boolean }[] & RowDataPacket[]>(
      "SELECT list_name, subscribed FROM subscriptions WHERE user_id = ?",
      [userId]
    );

    res.json({ ...users[0], subscriptions });
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    res.status(500).json({ message: "Failed to fetch user details" });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, last_name, email, user_type, gender, subscriptions } = req.body;
    if (!email || !user_type) {
      res.status(400).json({ message: "Email and user type are required" });
      return;
    }

    const [result] = await db.query("INSERT INTO users (name, last_name, email, user_type, gender) VALUES (?, ?, ?, ?, ?)", 
      [name, last_name, email, user_type, gender]);

    const userId = (result as any).insertId;

    if (subscriptions && subscriptions.length > 0) {
      for (const list_name of subscriptions) {
        await db.query("INSERT INTO subscriptions (user_id, list_name, subscribed) VALUES (?, ?, ?)", 
          [userId, list_name, true]);
      }
    }

    res.status(201).json({ message: "User created successfully", userId });
  } catch (error) {
    console.error("❌ Error creating user:", error);
    res.status(500).json({ message: "Failed to create user" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const { name, last_name, email, user_type, gender, subscriptions } = req.body;

    await db.query("UPDATE users SET name=?, last_name=?, email=?, user_type=?, gender=? WHERE id=?", [name, last_name, email, user_type, gender, userId]);

    if (subscriptions) {
      await db.query("DELETE FROM subscriptions WHERE user_id=?", [userId]);
      for (const list_name of subscriptions) {
        await db.query("INSERT INTO subscriptions (user_id, list_name, subscribed) VALUES (?, ?, ?)", [userId, list_name, true]);
      }
    }

    res.json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user" });
  }
};

export const searchUsers = async (req: Request, res: Response) => {
  try {
    const { search, sortBy = "created_at", order = "DESC", page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = "SELECT id, name, last_name, email, user_type, gender, created_at FROM users";
    let queryParams: any[] = [];

    if (search) {
      query += " WHERE name LIKE ? OR last_name LIKE ? OR email LIKE ?";
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY ${sortBy} ${order} LIMIT ? OFFSET ?`;
    queryParams.push(Number(limit), offset);

    console.log("🔍 Searching users with query:", query, queryParams); // ✅ Debug

    const [users] = await db.query(query, queryParams);
    res.json(users);
  } catch (error) {
    console.error("❌ Error searching users:", error);
    res.status(500).json({ message: "Failed to search users" });
  }
};

export const exportUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const [users] = await db.query<User[] & RowDataPacket[]>(
      "SELECT id, name, last_name, email, user_type, gender, created_at FROM users"
    );

    if (users.length === 0) {
      res.status(404).json({ message: "No users found" });
      return;
    }

    const fields = ["id", "name", "last_name", "email", "user_type", "gender", "created_at"];
    const json2csv = new Parser({ fields });
    const csv = json2csv.parse(users);

    res.header("Content-Type", "text/csv");
    res.attachment("users.csv");
    res.send(csv);
  } catch (error) {
    console.error("❌ Error exporting users:", error);
    res.status(500).json({ message: "Failed to export users" });
  }
};

export const getUserGenders = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await db.query<RowDataPacket[]>("SELECT DISTINCT gender FROM users WHERE gender IS NOT NULL AND gender != ''");

    // ✅ Ensure TypeScript recognizes that `rows` contains `gender` property
    const genderList = (rows as GenderRow[]).map((g) => g.gender);

    res.json(genderList);
  } catch (error) {
    console.error("❌ Error fetching genders:", error);
    res.status(500).json({ message: "Failed to fetch genders" });
  }
};
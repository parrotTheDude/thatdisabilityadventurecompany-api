import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import db from "../config/database";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const [users]: any[] = await db.query("SELECT id, email FROM users WHERE email = ?", [email]);

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = users[0];

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};

  export const logout = (req: Request, res: Response) => {
    res.json({ message: "Logged out successfully" });
  };
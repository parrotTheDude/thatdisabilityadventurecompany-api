import { Request, Response } from "express";
import db from "../config/database";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
  
      const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
      const user = (users as any[])[0];
  
      if (!user || !(await bcrypt.compare(password, user.password))) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }
  
      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET!, {
        expiresIn: "7d",
      });
  
      res.json({ token, user });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: (error as Error).message });
    }
  };

  export const logout = (req: Request, res: Response) => {
    res.json({ message: "Logged out successfully" });
  };
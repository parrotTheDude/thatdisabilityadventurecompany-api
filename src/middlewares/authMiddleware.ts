import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header("Authorization")?.split(" ")[1]; // ✅ Extract Bearer token

    if (!token) {
      res.status(401).json({ message: "Unauthorized: No token provided" });
      return; // ✅ Ensure function stops execution
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; email: string };
    req.user = decoded; // ✅ Attach user data to request

    next(); // ✅ Proceed to next middleware
  } catch (error) {
    res.status(401).json({ message: "Unauthorized: Invalid token" });
    return; // ✅ Ensure function stops execution
  }
};
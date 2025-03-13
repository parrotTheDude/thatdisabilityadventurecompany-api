import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface DecodedUser {
  id: number;
  email: string;
}

// Extend Express Request to include `user`
declare global {
  namespace Express {
    interface Request {
      user?: DecodedUser;
    }
  }
}

export const protect = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    console.log("❌ No Authorization header found.");
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];
  console.log("🔍 Extracted Token:", token);

  if (!token) {
    console.log("❌ Token is missing from Authorization header.");
    res.status(401).json({ message: "Unauthorized: Token missing" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedUser;
    console.log("✅ Token Verified:", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.log("❌ Token verification failed:", error);
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
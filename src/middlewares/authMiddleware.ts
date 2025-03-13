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
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedUser;
    req.user = decoded; // ✅ Attach user to request
    next(); // ✅ Ensure function ends with next()
  } catch (error) {
    res.status(401).json({ message: "Unauthorized: Invalid token" });
    return;
  }
};
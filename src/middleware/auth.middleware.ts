import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: bigint;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const bearerToken = req.headers.authorization?.split(' ')[1]
  const cookieToken = req.cookies?.access_token;
  const token = bearerToken || cookieToken

  if (!token)   
    return res.status(401).json({
      message: "No token provided",
    });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };
    req.userId = BigInt(decoded.id);
    next();
  } catch {
    res.status(401).json({
      message: "Invalid token",
    });
  }
};

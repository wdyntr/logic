import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../databases/db";
import { AuthRequest } from "../middleware/auth.middleware";
import { generateCsrfToken } from "../middleware/csrf.middleware";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from "../utils/token";

export const getCsrfToken = async (req: Request, res: Response) => {
  const csrfToken = generateCsrfToken(req, res);
  res.json({ csrfToken });
};

const setAuthCookies = async (req: Request, res: Response, userId: bigint) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken();

  const hashedToken = hashToken(refreshToken);
  await prisma.refreshToken.create({
    data: {
      token: hashedToken,
      userId,
      expiresAt: new Date(
        Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
      ),
    },
  });
};

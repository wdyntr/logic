import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../databases/db";
import { AuthRequest } from "../middleware/auth.middleware";
import { generateCsrfToken } from "../middleware/csrf.middleware";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  REFRESH_TOKEN_EXPIRY_DAYS,
} from "../utils/token";
import { AppError } from "../utils/app-error";
import { getCache, invalidUserMe, meKey, setCache } from "../utils/cache";

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

  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  });

  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) throw new AppError("Email sudah digunakan", 409);

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    });

    const tokens = await setAuthCookies(req, res, user.id);

    res.status(201).json({
      user: { id: user.id.toString(), name: user.name, email: user.email },
      ...tokens,
    });
  } catch (err: any) {
    if (err?.code === "P2002") throw new AppError("Email sudah digunakan", 409);

    if (err instanceof AppError) throw err;
    console.log("[register]", err);
    throw new AppError("Gagal register user", 500);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password)))
      throw new AppError("Kredensial salah", 401);

    const tokens = await setAuthCookies(req, res, user.id);

    res.status(200).json({
      user: { id: user.id.toString(), name: user.name, email: user.email },
      ...tokens,
    });
  } catch (err) {
    if (err instanceof AppError) throw err;

    console.log("[login]", err);
    throw new AppError("Gagal melakukan login", 500);
  }
};

export const logout = async (req: Request, res: Response) => {
  const token = req.cookies?.refresh_token;
  if (token) {
    await prisma.refreshToken.deleteMany({
      where: { token: hashToken(token) },
    });
  }

  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  res.clearCookie("csrf_token");

  res.json({ message: "Logout berhasil" });
};

export const me = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const key = await meKey(userId);

    const cached = await getCache(key);
    if (cached) return res.json(cached);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new AppError("User tidak ditemukan", 404);

    const userResponse = {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
    };

    const payload = { user: userResponse };
    await setCache(key, payload);

    res.json(payload);
  } catch (err) {
    if (err instanceof AppError) throw err;

    console.error("[me]:", err);
    throw new AppError("Gagal Memuat user", 500);
  }
};

export const update = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, currentPassword } = req.body;
    const userId = req.userId!;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new AppError("User tidak ditemukan", 404);

    if (password) {
      if (!currentPassword)
        throw new AppError("Current password wajib diisi", 422);

      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) throw new AppError("Password lama tidak valid", 401);
    }

    const data: { name?: string; email?: string; password?: string } = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (password !== undefined) data.password = await bcrypt.hash(password, 10);

    if (Object.keys(data).length === 0)
      throw new AppError("Tidak ada data yang diupdate", 400);

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
    });
    await invalidUserMe(userId);
    res.status(200).json({
      user: {
        id: updated.id.toString(),
        name: updated.name,
        email: updated.email,
      },
    });
  } catch (err: any) {
    if (err?.code === "P2002") throw new AppError("Email sudah digunakan", 409);
    if (err instanceof AppError) throw err;
    console.error("[update profile]:", err);
    throw new AppError("Gagal update data user", 500);
  }
};

export const refresh = async (req: AuthRequest, res: Response) => {
  const token = req.cookies?.refresh_token;

  res.clearCookie("access_token");
  res.clearCookie("refresh_token");

  if (!token)
    throw new AppError("Refresh token tidak valid atau kadaluasa", 401);

  const tokenHash = hashToken(token);
  const stored = await prisma.refreshToken.findUnique({
    where: { token: tokenHash },
  });

  if (!stored || stored.expiresAt < new Date())
    throw new AppError("Refresh token tidak valid atau kadaluasa", 401);

  try {
    await prisma.refreshToken.delete({
      where: { id: stored.id },
    });
  } catch (err: any) {
    if (err?.code === "P2025")
      throw new AppError("Refresh token sudah dipakai", 401);
    throw err;
  }

  const tokens = await setAuthCookies(req, res, stored.userId);

  res.json({ message: "Token diperbarui", ...tokens });
};

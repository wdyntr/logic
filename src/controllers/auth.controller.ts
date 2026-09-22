import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../databases/db";
import { generateAccessToken, generateRefreshToken, hashToken, REFRESH_TOKEN_EXPIRY_DAYS } from "../utils/token";
import { AuthRequest } from "../middleware/auth.middleware";
import { AppError } from "../utils/app-error";
import { generateCsrfToken } from "../middleware/csrf.middleware";

export const getCsrfToken = async (req: Request, res: Response) => {
  const csrfToken = generateCsrfToken(req, res)
  res.json({ csrfToken })
}

const setAuthCookies = async (req: Request, res: Response, userId: bigint) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken()

  const hashedToken = hashToken(refreshToken)
  await prisma.refreshToken.create({
    data: {
      token: hashedToken,
      userId,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
    }
  })

  // untuk web save keduanya di cookie httpOnly
  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
  })

  // mobile respon do body, biar bisa dsimpan manual ke keychain/keystore

  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing)
      throw new AppError('Email sudah digunakan', 409)


    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    });

    const tokens = await setAuthCookies(req, res, user.id);

    res.status(201).json({
      user: { id: user.id.toString(), name: user.name, email: user.email },
      ...tokens,
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error
    }

    console.error("[register]", error);
    throw new AppError('Gagal mendaftarkan user', 500)
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {

      throw new AppError('Kredensial salah', 401)
    }

    const tokens = await setAuthCookies(req, res, user.id);

    res.status(200).json({
      user: { id: user.id.toString(), name: user.name, email: user.email },
      ...tokens,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    console.error("[login]", error);
    throw new AppError('Gagal melakukan login', 500)

  }
};

export const logout = async (req: Request, res: Response) => {
  const token = req.cookies?.refresh_token
  if (token) {
    await prisma.refreshToken.deleteMany({
      where: { token: hashToken(token) }
    })
  }

  res.clearCookie("access_token");
  res.clearCookie('refresh_token', { path: '/' })
  res.clearCookie("csrf_token");

  res.json({ message: "Logout berhasil" });
};

export const me = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) throw new AppError('User tidak ditemukan', 404)

    res.json({
      user: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof AppError)
      throw error


    console.error("[me]", error);

    throw new AppError('Gagal memuat user', 500)
  }
};

export const update = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, currentPassword } = req.body;

    const userId = req.userId!

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user)
      throw new AppError('User tidak ditemukan', 404)

    if (password) {
      if (!currentPassword) {
        throw new AppError('Current password wajib diisi', 422)

      }
      const valid = await bcrypt.compare(currentPassword, user.password)
      if (!valid)
        throw new AppError('Password lama salah', 401)
    }

    const data: { name?: string; email?: string; password?: string } = {}
    if (name !== undefined) data.name = name
    if (email !== undefined) data.email = email
    if (password !== undefined) data.password = await bcrypt.hash(password, 10)

    if (Object.keys(data).length === 0) {
      throw new AppError('Tidak ada data yang diupdate', 400)

    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data
    })

    res.status(200).json({
      user: { id: updated.id.toString(), name: updated.name, email: updated.email }
    })

  } catch (error: any) {
    if (error?.code === 'P2002') throw new AppError('Email sudah digunakan', 409)

    if (error instanceof AppError) {
      throw error
    }

    console.error("[update profile]", error);
    throw new AppError('Gagal update data user', 500)

  }
};

export const refresh = async (req: AuthRequest, res: Response) => {
  const token = req.cookies?.refresh_token;
  if (!token)
    throw new AppError('Refresh token tidak ada', 401)

  const tokenHash = hashToken(token);
  const stored = await prisma.refreshToken.findUnique({ where: { token: tokenHash } });

  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError('Refresh token tidak valid atau kadaluarsa', 401)

  }

  await prisma.refreshToken.delete({ where: { id: stored.id } })
  const tokens = await setAuthCookies(req, res, stored.userId)

  res.json({ message: 'token diperbarui', ...tokens })
}
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../databases/db";
import { generateAccessToken, generateRefreshToken, hashToken, REFRESH_TOKEN_EXPIRY_DAYS } from "../utils/token";
import { AuthRequest } from "../middleware/auth.middleware";

const setAuthCookies = async (res: Response, userId: bigint) => {
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
      return res.status(400).json({ message: "Email sudah digunakan" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    });

    const tokens = await setAuthCookies(res, user.id);

    res.status(201).json({
      user: { id: user.id.toString(), name: user.name, email: user.email },
      ...tokens,
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return res.status(409).json({ message: "Email sudah terdaftar" });
    }
    console.error("[register]", error);
    res.status(500).json({ message: "Gagal mendaftarkan user" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Kredensial salah" });
    }

    const tokens = await setAuthCookies(res, user.id);

    res.status(200).json({
      user: { id: user.id.toString(), name: user.name, email: user.email },
      ...tokens,
    });
  } catch (error) {
    console.error("[login]", error);
    res.status(500).json({ message: "Gagal melakukan login" });
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
  
  res.json({ message: "Logout berhasil" });
};

export const me = async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
  });

  if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

  res.json({
    user: {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
    },
  });
};

export const update = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, currentPassword } = req.body;

    const userId = req.userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' })

    if (password) {
      if (!currentPassword) {
        return res.status(422).json({ message: 'Current password wajib diisi' })
      }
      const valid = await bcrypt.compare(currentPassword, user.password)
      if (!valid) return res.status(401).json({ message: 'Password lama salah' })
    }

    const data: { name?: string; email?: string; password?: string } = {}
    if (name !== undefined) data.name = name
    if (email !== undefined) data.email = email
    if (password !== undefined) data.password = await bcrypt.hash(password, 10)

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'Tidak ada data yang diupdate' })
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data
    })

    res.status(200).json({
      user: { id: updated.id.toString(), name: updated.name, email: updated.email }
    })

  } catch (error: any) {
    if (error?.code === "P2002") {
      return res.status(409).json({ message: "Email sudah digunakan" });
    }

    console.error("[update profile]", error);
    res.status(500).json({ message: "Gagal update data user" });
  }
};

export const refresh = async (req: AuthRequest, res: Response) => {
  const token = req.cookies?.refresh_token;
  if (!token)
    return res.status(401).json({ message: "Refresh Token tidak ada" });

  const tokenHash = hashToken(token);
  const stored = await prisma.refreshToken.findUnique({ where: { token: tokenHash } });

  if (!stored || stored.expiresAt < new Date()) {
    return res
      .status(401)
      .json({ message: 'Refresh token tidak valid atau kadaluarsa' })
  }

  await prisma.refreshToken.delete({ where: { id: stored.id } })
  const tokens = await setAuthCookies(res, stored.userId)

  res.json({ message: 'token diperbarui', ...tokens })
}
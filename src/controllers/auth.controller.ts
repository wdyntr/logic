import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../databases/db";
import { generateAccessToken } from "../utils/token";



const setAuthCookies = async (res: Response, userId: bigint) => {
  const accessToken = generateAccessToken(userId);

  // untuk web save keduanya di cookie httpOnly
  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
  });

  // mobile respon do body, biar bisa disimpan manual ke keychain/keystore
  return { accessToken };
};


export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
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
  res.clearCookie("access_token");


  res.json({ message: "Logout berhasil" });
};
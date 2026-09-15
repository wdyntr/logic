import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../databases/db";
import { AuthRequest } from "../middleware/auth.middleware";
import { AppError } from "../utils/app-error";
import { hitungFrekuensi } from "../utils/hitungFrekuensi";

export const display = async (req: AuthRequest, res: Response) => {
    try {
        const { data } = req.body
        const hasil = hitungFrekuensi(data)

        return res.json({ Output: hasil })
    } catch (error) {
        throw new AppError('Gagal DSA data', 500)
    }
}
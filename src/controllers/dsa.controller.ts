import { Request, Response } from "express";
import { AppError } from "../utils/app-error";
import { hitungFrekuensi, hitungStatus } from "../utils/hitungFrekuensi";
import { AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../databases/db";

export const display = async (req: Request, res: Response) => {
    try {
        const { data } = req.body
        const hasil = hitungFrekuensi(data)

        return res.json({ Output: hasil })
    } catch (error) {
        throw new AppError('Gagal DSA data', 500)
    }
}

export const displayDB = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId

        if (!userId) throw new AppError('User tidak ditemukan', 401)

        const data = await prisma.todo.findMany({
            where: {
                userId: userId
            }
        })
        const status = data.map(t => t.status)

        const hasil = hitungStatus(status)

        return res.json({ Output: hasil })
    } catch (error) {
        if (error instanceof AppError) throw error

        throw new AppError('Gagal DSA data', 500)
    }
}
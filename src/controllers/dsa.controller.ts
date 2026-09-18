import { Request, Response } from "express";
import { AppError } from "../utils/app-error";
import { hitungFrekuensi } from "../utils/hitungFrekuensi";
import { AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../databases/db";
import { notificationQueue } from "../utils/notification-queue";

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

        const hasil = hitungFrekuensi(status)

        return res.json({ Output: hasil })
    } catch (error) {
        if (error instanceof AppError) throw error

        throw new AppError('Gagal DSA data', 500)
    }
}

export const enqueue = async (req: Request, res: Response) => {
    try {
        const { message } = req.body

        if (!message) throw new AppError("Message tidak boleh kosong", 400)

        notificationQueue.enqueue(message)

        return res.status(201).json({
            message: 'Berhasil ditambahkan',
            data: message,
            remaining: notificationQueue.size
        })
    } catch (error) {
        if (error instanceof AppError) throw error

        throw new AppError('Gagal Queue data', 500)
    }
}

export const dequeue = async (req: Request, res: Response) => {
    try {
        if (notificationQueue.size === 0) throw new AppError("Antrian kosong", 404)

        const headIndex = notificationQueue.index

        const deq = notificationQueue.dequeue()

        return res.status(201).json({
            message: 'Berhasil Dihapus (digeser)',
            headIndex: {
                headIndexBefore: headIndex,
                headIndexAfter: notificationQueue.index,
            },
            dataFirst: deq,
            remaining: notificationQueue.size
        })
    } catch (error) {
        if (error instanceof AppError) throw error

        throw new AppError('Gagal Queue data', 500)
    }
}

export const peek = async (req: Request, res: Response) => {
    try {
        if (notificationQueue.size === 0) throw new AppError('Tidak ada antrian saat ini', 404)

        const firstData = notificationQueue.peek()

        return res.status(200).json({
            message: 'Berhasil menampilkan first data',
            data: firstData
        })

    } catch (error) {
        if (error instanceof AppError) throw error

        throw new AppError('Gagal Queue data', 500)
    }
}
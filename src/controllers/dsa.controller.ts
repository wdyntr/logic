import { Request, Response } from "express";
import { AppError } from "../utils/app-error";
import { hitungFrekuensi } from "../utils/hitungFrekuensi";
import { AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../databases/db";
import { notificationQueue } from "../utils/notification-queue";
import { historyStack } from "../utils/stack-instance";
import { linkedList } from "../utils/linked-list-instance";

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

export const pushStack = async (req: Request, res: Response) => {
    try {
        const { data } = req.body

        if (!data) throw new AppError("Data tidak boleh kosong", 400)

        historyStack.push(data)

        return res.status(201).json({
            message: 'Berhasil ditambahkan',
            data: data,
            remaining: historyStack.size
        })
    } catch (error) {
        if (error instanceof AppError) throw error

        throw new AppError('Gagal Stack data', 500)
    }
}

export const popStack = async (req: Request, res: Response) => {
    try {
        if (historyStack.size === 0) throw new AppError("Stack kosong", 404)

        const data = historyStack.pop()

        return res.status(201).json({
            message: 'Berhasil Dihapus',
            deleted: data,
            remaining: historyStack.size
        })
    } catch (error) {
        if (error instanceof AppError) throw error

        throw new AppError('Gagal Stack data', 500)
    }
}

export const top = async (req: Request, res: Response) => {
    try {
        if (historyStack.size === 0) throw new AppError('Tidak ada stack saat ini', 404)

        const lastData = historyStack.top()

        return res.status(200).json({
            message: 'Berhasil menampilkan data teratas',
            data: lastData,
            remaining: historyStack.size
        })

    } catch (error) {
        if (error instanceof AppError) throw error

        throw new AppError('Gagal Stack data', 500)
    }
}

export const snapshot = async (req: Request, res: Response) => {
    try {
        if (historyStack.size === 0) throw new AppError('Tidak ada stack saat ini', 404)

        const snap = historyStack.snapshot

        return res.status(200).json({
            message: 'Berhasil menampilkan seluruh stack data',
            data: snap,
            remaining: historyStack.size
        })

    } catch (error) {
        if (error instanceof AppError) throw error

        throw new AppError('Gagal Stack data', 500)
    }
}

// =========== Linked list
export const appendList = async (req: Request, res: Response) => {
    try {
        const { data } = req.body

        if (!data) throw new AppError("Data tidak boleh kosong", 400)

        linkedList.append(data)

        return res.status(201).json({
            message: 'Berhasil ditambahkan',
            data: data,
            array: linkedList.toArray()
        })

    } catch (error) {
        if (error instanceof AppError) throw error

        throw new AppError('Gagal linked list data', 500)
    }
}

export const prependList = async (req: Request, res: Response) => {
    try {
        const { data } = req.body

        if (!data) throw new AppError("Data tidak boleh kosong", 400)

        linkedList.prepend(data)

        return res.status(201).json({
            message: 'Berhasil ditambahkan',
            data: data,
            array: linkedList.toArray()
        })

    } catch (error) {
        if (error instanceof AppError) throw error

        throw new AppError('Gagal linked list data', 500)
    }
}

export const deleteList = async (req: Request, res: Response) => {
    try {
        const { data } = req.body

        if (!data) throw new AppError("Data tidak boleh kosong", 400)

        const result = linkedList.delete(data)

        if (!result) throw new AppError('Data tidak ditemukan', 404)

        return res.status(201).json({
            message: 'Berhasil dihapus',
            data: data,
            array: linkedList.toArray()
        })

    } catch (error) {
        if (error instanceof AppError) throw error

        throw new AppError('Gagal linked list data', 500)
    }
}

export const findList = async (req: Request, res: Response) => {
    try {
        const { data } = req.body

        if (!data) throw new AppError("Data tidak boleh kosong", 400)

        const result = linkedList.find(data)

        if (!result) throw new AppError('Data tidak ditemukan', 404)

        return res.status(200).json({
            message: 'Berhasil ditemukan',
            data: data,
            array: linkedList.toArray()
        })

    } catch (error) {
        if (error instanceof AppError) throw error

        throw new AppError('Gagal linked list data', 500)
    }
}

export const arrayList = async (req: Request, res: Response) => {
    try {
        const result = linkedList.toArray()

        return res.status(200).json({
            message: 'Berhasil ditemukan',
            array: result
        })

    } catch (error) {
        if (error instanceof AppError) throw error

        throw new AppError('Gagal linked list data', 500)
    }
}

export const sizeList = async (req: Request, res: Response) => {
    try {
        const result = linkedList.size

        return res.status(200).json({
            message: 'Berhasil ditemukan',
            array: linkedList.toArray(),
            size: result
        })

    } catch (error) {
        if (error instanceof AppError) throw error

        throw new AppError('Gagal linked list data', 500)
    }
}
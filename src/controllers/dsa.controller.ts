import { Request, Response } from "express";
import { AppError } from "../utils/app-error";
import { hitungFrekuensi } from "../utils/hitungFrekuensi";

export const display = async (req: Request, res: Response) => {
    try {
        const { data } = req.body
        const hasil = hitungFrekuensi(data)

        return res.json({ Output: hasil })
    } catch (error) {
        throw new AppError('Gagal DSA data', 500)
    }
}
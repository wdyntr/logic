import { Request, Response, NextFunction } from "express";
import { AppError } from '../utils/app-error'


export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({ message: 'Route tidak ditemukan' });
};

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err instanceof AppError ? err.statusCode : 500
    const message = err instanceof AppError ? err.message : 'Terjadi kesalahan pada server'

    const response: any = { message }

    if (process.env.NODE_ENV === 'local') {
        response.stack = err.stack
    }

    res.status(statusCode).json(response)
};
import { Request, Response, NextFunction } from "express";
import { AppError } from '../utils/app-error'


export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({ message: 'Route tidak ditemukan' });
};

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    const e = err as { statusCode?: number; status?: number }
    const statusCode = err instanceof AppError ? err.statusCode
                     : typeof e.statusCode === 'number' ? e.statusCode
                     : typeof e.status === 'number' ? e.status
                     : 500
    const message = err instanceof AppError ? err.message
                  : statusCode < 500 && err.message ? err.message
                  : 'Terjadi kesalahan pada server'

    if (statusCode >= 500) console.error('[errorHandler]', err)

    const response: any = { message }

    if (process.env.NODE_ENV === 'local') {
        response.stack = err.stack
    }

    res.status(statusCode).json(response)
};
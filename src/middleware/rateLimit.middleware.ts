import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    limit: 5, // maks 5 percobaan 
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Terlalu banyak percobaan, Silahkan coba lagi dalam 15 menit!' }
})

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit:100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {message: 'Terlalu banyak request. Coba lagi nanti'}
})
import { z } from 'zod'

export const registerSchema = z.object({
    name: z.string().min(1, 'Nama wajib diisi'),
    email: z.string().email('Email tidak valid'),
    password: z.string().min(8, 'Password minimal 8 karakter'),
})

export const loginSchema = z.object({
    email: z.string().email('Email tidak valid'),
    password: z.string().min(8, 'Password minimal 8 karakter')
})

export const updateSchema = z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
    currentPassword: z.string().min(8).optional(),
}).refine((data) => {
    // Jika password diisi, currentPassword wajib
    if (data.password && !data.currentPassword) return false;
    return true;
}, { message: "Current password wajib diisi jika mengubah password" });
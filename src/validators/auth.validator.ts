import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid").toLowerCase(),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid").toLowerCase(),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export const updateSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    email: z.string().email().toLowerCase().optional(),
    password: z.string().min(8).optional(),
    currentPass: z.string().min(8).optional(),
  })
  .refine(
    (data) => {
      // kalau password diisi current pass juga wajib
      if (data.password && !data.currentPass) return false;
      return true;
    },
    { message: "Current password wajib diisi jika ingin mengubah password" },
  );

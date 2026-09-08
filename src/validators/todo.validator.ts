import { z } from "zod";

export const createTodoSchema = z.object({
  name: z.string().min(1).max(255),
});

export const updateTodoSchema = z.object({
  name: z.string().optional(),
  status: z.boolean().optional(),
});

export const todoIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "Invalid ID format")
});

import {
    createTodoSchema, updateTodoSchema, todoIdParamSchema
} from "../todo.validator";

describe('createTodoSchema', () => {
    it('should pass with valid name', () => {
        // Kirim data valid → expect success = true
        const result = createTodoSchema.safeParse({ name: "Belajar" });
        expect(result.success).toBe(true);
    })

    it('should pass with 1 char name', () => {
        // Nama 1 karakter → lolos karena min(1)
        const result = createTodoSchema.safeParse({ name: "A" });
        expect(result.success).toBe(true);
    })

    it('should pass with 255 chars name', () => {
        // Nama 255 karakter → lolos karena max(255)
        const result = createTodoSchema.safeParse({ name: "A".repeat(255) });
        expect(result.success).toBe(true);
    })
    it('should fail if name is empty', () => {
        // Nama kosong → ditolak karena min(1)
        const result = createTodoSchema.safeParse({ name: "" });
        expect(result.success).toBe(false);
    })

    it('should fail if name > 255 chars', () => {
        // Nama 256 karakter → ditolak karena max(255)
        const result = createTodoSchema.safeParse({ name: "A".repeat(256) });
        expect(result.success).toBe(false);
    })

    it('should fail if name is not provided', () => {
        // Object kosong → ditolak karena name required
        const result = createTodoSchema.safeParse({});
        expect(result.success).toBe(false);
    })
})

describe('updateTodoSchema', () => {
    it('should pass with name only', () => {
        const result = updateTodoSchema.safeParse({ name: "New Name" });
        expect(result.success).toBe(true);
    })

    it('should pass with status only', () => {
        const result = updateTodoSchema.safeParse({ status: true });
        expect(result.success).toBe(true);
    })

    it('should pass with both name and status', () => {
        const result = updateTodoSchema.safeParse({ name: "Updated", status: false });
        expect(result.success).toBe(true);
    })

    it('should pass with empty object', () => {
        // Semua field optional → object kosong pun lolos
        const result = updateTodoSchema.safeParse({});
        expect(result.success).toBe(true);
    })
})

describe('todoIdParamSchema', () => {
    it('should pass with numeric id', () => {
        const result = todoIdParamSchema.safeParse({ id: "123" });
        expect(result.success).toBe(true);
    })

    it('should pass with large numeric id', () => {
        const result = todoIdParamSchema.safeParse({ id: "999999" });
        expect(result.success).toBe(true);
    })

    it('should fail if id contains letters', () => {
        const result = todoIdParamSchema.safeParse({ id: "abc" });
        expect(result.success).toBe(false);
    })

    it('should fail if id is empty string', () => {
        const result = todoIdParamSchema.safeParse({ id: "" });
        expect(result.success).toBe(false);
    })

    it('should fail if id contains special characters', () => {
        const result = todoIdParamSchema.safeParse({ id: "12-34" });
        expect(result.success).toBe(false);
    })
})
// auth.validator.test.ts
import { registerSchema, loginSchema } from "../auth.validator";

describe("registerSchema", () => {
  it("should pass with valid data", () => {
    const result = registerSchema.safeParse({
      name: "Budi",
      email: "budi@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("should fail if name is empty", () => {
    const result = registerSchema.safeParse({
      name: "",
      email: "budi@example.com",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("should fail if password < 8 chars", () => {
    const result = registerSchema.safeParse({
      name: "Budi",
      email: "budi@example.com",
      password: "1234567",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("should pass with valid email and password", () => {
    const result = loginSchema.safeParse({
      email: "budi@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("should fail if email is invalid", () => {
    const result = loginSchema.safeParse({
      email: "budi",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("should fail if password < 8 chars", () => {
    const result = loginSchema.safeParse({
      email: "budi@example.com",
      password: "1234567",
    });
    expect(result.success).toBe(false);
  });
});
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken, hashToken } from "../token";

// Perlu set env variable untuk test
beforeAll(() => {
  process.env.JWT_SECRET = "test-secret";
});

describe("generateAccessToken", () => {
  it("should return a string", () => {
    const token = generateAccessToken(BigInt(1));
    expect(typeof token).toBe("string");
  });

  it("should decode to correct userId", () => {
    const token = generateAccessToken(BigInt(42));
    const decoded = jwt.verify(token, "test-secret") as { id: string };
    expect(decoded.id).toBe("42");
  });

  it("should have expiry", () => {
    const token = generateAccessToken(BigInt(1));
    const decoded = jwt.decode(token) as { exp: number };
    expect(decoded.exp).toBeDefined();
  });
});

describe("generateRefreshToken", () => {
  it("should return a hex string of 80 chars", () => {
    const token = generateRefreshToken();
    expect(typeof token).toBe("string");
    expect(token).toHaveLength(80);
    expect(token).toMatch(/^[0-9a-f]+$/);
  });
});

describe("hashToken", () => {
  it("should return 64 char sha256 hex string", () => {
    const hash = hashToken("hello");
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]+$/);
  });

  it("should be consistent", () => {
    expect(hashToken("test")).toBe(hashToken("test"));
  });

  it("should differ for different inputs", () => {
    expect(hashToken("a")).not.toBe(hashToken("b"));
  });
});
import request from 'supertest'
import app from '../test-app'
import { cleanUpDatabase, disconnectDatabase } from '../setup'

let cookies: string;

beforeAll(async () => {
    await cleanUpDatabase();

    // Register
    await request(app)
        .post("/api/auth/register")
        .send({ name: "Budi", email: "budi@test.com", password: "password123" });

    // Login (untuk pastikan cookie valid)
    const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "budi@test.com", password: "password123" });

    const raw = res.headers["set-cookie"];
    cookies = Array.isArray(raw) ? raw[0] : (raw ?? "");
});

describe("POST /api/auth/register", () => {
    it("should register new user", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ name: "toro", email: "toro@test.com", password: "password123" });

        expect(res.status).toBe(201);
    });

    it("should fail if email already exist", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ name: "toro", email: "toro@test.com", password: "password123" });

        expect(res.status).toBe(400);
    });
    // ... test lainnya
});

describe("POST /api/auth/login", () => {
    it("should berhasil login", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "toro@test.com", password: "password123" });

        expect(res.status).toBe(200);
    });

    it("should fail with wrong password", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "toro@test.com", password: "12345asas" });

        expect(res.status).toBe(401);
    });

    it("should fail with non-existent email", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "wwd@test.com", password: "password123" });

        expect(res.status).toBe(401);
    });

});

describe("GET /api/auth/me", () => {
    it("should return current user", async () => {
        const res = await request(app)
            .get("/api/auth/me")
            .set("Cookie", cookies);  // cookie dari login/register

        expect(res.status).toBe(200);
    });

    it("should fail without token", async () => {
        const res = await request(app)
            .get("/api/auth/me")

        expect(res.status).toBe(401);
    });

});

describe("PATCH /api/auth/me", () => {

    it("update name", async () => {
        const res = await request(app)
            .patch("/api/auth/me")
            .send({ name: 'toro (budi update)' })
            .set("Cookie", cookies);

        expect(res.status).toBe(200);
    });

    it("update email", async () => {
        const res = await request(app)
            .patch("/api/auth/me")
            .send({ email: 'toronew@test.com' })
            .set("Cookie", cookies);

        expect(res.status).toBe(200);
    });

    it("update email fail without cookie", async () => {
        const res = await request(app)
            .patch("/api/auth/me")
            .send({ email: 'toronew@test.com' })

        expect(res.status).toBe(401);
    });

    it("update password", async () => {
        const res = await request(app)
            .patch("/api/auth/me")
            .send({ password: 'newpass123', currentPassword: 'password123' })
            .set("Cookie", cookies);

        expect(res.status).toBe(200);
    });

});

afterAll(async () => {
    await cleanUpDatabase();
    await disconnectDatabase();
});
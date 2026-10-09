import request from "supertest";
import app from '../test-app'
import { cleanUpDatabase, disconnectDatabase } from "../setup";
import { loginWithCsrf } from "../helper";


let auth: { cookie: string; csrfToken: string };

beforeAll(async () => {
    await cleanUpDatabase();

    await request(app)
        .post("/api/auth/register")
        .send({ name: "Budi", email: "budi@test.com", password: "password123" });

    auth = await loginWithCsrf(app, "budi@test.com", "password123");
});

describe("POST /api/todos", () => {
    it("should create todo", async () => {
        const res = await request(app)
            .post("/api/todos")
            .set("Cookie", auth.cookie)
            .set("x-csrf-token", auth.csrfToken)
            .send({ name: 'todo 1' });

        expect(res.status).toBe(201);
    });

    it("should fail if name is empty", async () => {
        const res = await request(app)
            .post("/api/todos")
            .set("Cookie", auth.cookie)
            .set("x-csrf-token", auth.csrfToken)
            .send({ name: '' });  // cookie dari login/register

        expect(res.status).toBe(422);
    });

    it("should fail if duplicate name", async () => {
        const res = await request(app)
            .post("/api/todos")
            .set("Cookie", auth.cookie)
            .set("x-csrf-token", auth.csrfToken)
            .send({ name: 'todo 1' });  // cookie dari login/register

        expect(res.status).toBe(409);
    });

    it('race condition test', async () => {
        const requests = []

        for (let i = 1; i <= 6; i++) {
            requests.push(
                request(app)
                    .post('/api/todos')
                    .set("Cookie", auth.cookie)
                    .set("x-csrf-token", auth.csrfToken)
                    .send({ name: `race test ${i}` })
            )
        }

        const res = await Promise.all(requests)

        const statuses = res.map(r => r.status);
        const successCount = statuses.filter(s => s === 201).length;
        // console.log("RACE STATUSES:", statuses);
        expect(successCount).toBeLessThanOrEqual(5);
        expect(statuses.every(s => s === 201 || s === 406 || s === 409)).toBe(true);

    })

    // it("should fail if > 5 incomplete todos", async () => {
    // await request(app)
    //     .post("/api/todos")
    //     .set("Cookie", cookie)
    //     .send({ name: 'todo 2' });

    // await request(app)
    //     .post("/api/todos")
    //     .set("Cookie", cookie)
    //     .send({ name: 'todo 3' });

    // await request(app)
    //     .post("/api/todos")
    //     .set("Cookie", cookie)
    //     .send({ name: 'todo 4' });

    // await request(app)
    //     .post("/api/todos")
    //     .set("Cookie", cookie)
    //     .send({ name: 'todo 5' });

    // const res = await request(app)
    //     .post("/api/todos")
    //     .set("Cookie", cookie)
    //     .send({ name: 'todo 6' });

    //     expect(res.status).toBe(406);
    // });

    it("should clean up incomplete todos for next tests", async () => {
        const listRes = await request(app)
            .get("/api/todos")
            .set("Cookie", auth.cookie)
            .set("x-csrf-token", auth.csrfToken)


        const todos = listRes.body.data;
        for (const todo of todos) {
            await request(app)
                .patch(`/api/todos/${todo.id}/toggle`)
                .set("Cookie", auth.cookie)
                .set("x-csrf-token", auth.csrfToken)
        }

        // console.log("INCOMPLETE SEBELUM CLEANUP:", todos.filter((t: any) => t.status === false).length);

        expect(todos.filter((t: any) => t.status === false).length).toBeLessThanOrEqual(5);
    });

    it("should fail without auth", async () => {
        const res = await request(app)
            .post("/api/todos")
            .set("x-csrf-token", auth.csrfToken)
            .send({ name: 'todo 7' });

        expect(res.status).toBe(401);
    });

    it('toggle race condition - genap harus kembali ke status awal', async () => {
        // 1. Buat 1 todo baru, catat statusnya (harusnya false)
        const created = await request(app)
            .post("/api/todos")
            .set("Cookie", auth.cookie)
            .set("x-csrf-token", auth.csrfToken)
            .send({ name: "todo for toggle" });

        const id = created.body.data.id;

        // 2. Kirim 2 request PATCH /:id/toggle BERSAMAAN (Promise.all)
        const [res1, res2] = await Promise.all([
            request(app)
                .patch(`/api/todos/${id}/toggle`)
                .set("Cookie", auth.cookie)
                .set("x-csrf-token", auth.csrfToken),
            request(app)
                .patch(`/api/todos/${id}/toggle`)
                .set("Cookie", auth.cookie)
                .set("x-csrf-token", auth.csrfToken)
        ])

        // 3. Setelah itu, GET todo itu lagi, cek status FINAL-nya
        const get = await request(app)
            .get(`/api/todos/${id}`)
            .set("Cookie", auth.cookie)
            .set("x-csrf-token", auth.csrfToken)

        const status = get.body.data.status

        // 4. expect status akhir HARUS false (karena 2x toggle = genap = balik ke awal)
        expect(res1.status).toBe(200);   // ← kalau gagal, pesannya jelas
        expect(res2.status).toBe(200);
        expect(status).toBe(false);
    });
});

describe("GET /api/todos", () => {
    it("should return paginated todos", async () => {
        const res = await request(app)
            .get("/api/todos")
            .set("Cookie", auth.cookie)
            .set("x-csrf-token", auth.csrfToken)

        expect(res.status).toBe(200);
    });

    it("should fail without auth", async () => {
        const res = await request(app)
            .get("/api/todos")

        expect(res.status).toBe(401);
    });
});

describe("PATCH /api/todos/:id", () => {
    it("should update todo", async () => {
        const created = await request(app)
            .post("/api/todos")
            .set("Cookie", auth.cookie)
            .set("x-csrf-token", auth.csrfToken)
            .send({ name: "todo for update" });

        const id = created.body.data.id;

        const res = await request(app)
            .patch(`/api/todos/${id}`)
            .set("Cookie", auth.cookie)
            .set("x-csrf-token", auth.csrfToken)
            .send({ name: "todo updated" });

        expect(res.status).toBe(200);
    });

    it("should fail if todo not found", async () => {
        const res = await request(app)
            .patch("/api/todos/999999")
            .set("Cookie", auth.cookie)
            .set("x-csrf-token", auth.csrfToken)
            .send({ name: "todo not found" });
        expect(res.status).toBe(404);
    });
});

describe("PATCH /api/todos/:id/toggle", () => {
    it("should toggle status", async () => {
        const created = await request(app)
            .post("/api/todos")
            .set("Cookie", auth.cookie)
            .set("x-csrf-token", auth.csrfToken)
            .send({ name: "todo for toogle" });

        const id = created.body.data.id;

        const res = await request(app)
            .patch(`/api/todos/${id}/toggle`)
            .set("Cookie", auth.cookie)
            .set("x-csrf-token", auth.csrfToken)

        expect(res.status).toBe(200);
    });

    it("should fail if todo not found", async () => {
        const res = await request(app)
            .patch(`/api/todos/565/toggle`)
            .set("Cookie", auth.cookie)
            .set("x-csrf-token", auth.csrfToken)

        expect(res.status).toBe(404);
    });
});

describe("DELETE /api/todos/:id", () => {
    it("should delete todo", async () => {
        const created = await request(app)
            .post("/api/todos")
            .set("Cookie", auth.cookie)
            .set("x-csrf-token", auth.csrfToken)
            .send({ name: "todo for delete" });

        const id = created.body.data.id;

        const res = await request(app)
            .delete(`/api/todos/${id}`)
            .set("Cookie", auth.cookie)
            .set("x-csrf-token", auth.csrfToken)
        expect(res.status).toBe(200);
    });

    it("should fail if todo not found", async () => {
        const res = await request(app)
            .delete(`/api/todos/666`)
            .set("Cookie", auth.cookie)
            .set("x-csrf-token", auth.csrfToken)
        expect(res.status).toBe(404);
    });
});

afterAll(async () => {
    await cleanUpDatabase();
    await disconnectDatabase();
});
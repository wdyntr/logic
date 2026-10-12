import request from "supertest";
import app from "./test-app";
import { loginWithCsrf } from "./helper";
import { invalidateUserTodos } from "../utils/cache";

async function main() {
  // langkah1
  const email = `stampede${Date.now()}@lab.test`;
  const password = "stampede123";
  const reg = await request(app)
    .post("/api/auth/register")
    .send({ name: "stampede", email, password: password });

  if (reg.status !== 201) {
    throw new Error(
      `Register gagal: ${reg.status} ${JSON.stringify(reg.body)}`,
    );
  }

  const { cookie } = await loginWithCsrf(app, email, password);

  // langkah 2
  const me = await request(app).get("/api/auth/me").set("Cookie", cookie);
  if (me.status !== 200)
    throw new Error(
      `Gagal Get userId: ${me.status} ${JSON.stringify(me.body)}`,
    );

  const userId = me.body.user.id;

  // langkah 3
  const getTodos = await request(app)
    .get("/api/todos?page=1&limit=10")
    .set("Cookie", cookie);
  if (getTodos.status !== 200)
    throw new Error(
      `Gagal Get pemanasan todos: ${getTodos.status} ${JSON.stringify(getTodos.body)}`,
    );

  // langkah 4
  await invalidateUserTodos(userId);
  console.log("Cache telah dibersihkan");

  // Langkah 5 
  console.log('=== MULAI TEMBAK ===');
  const N = 50;
  const hasil = await Promise.all(
    Array.from({ length: N }, async () => {
      const mulai = performance.now();
      const res = await request(app).get('/api/todos?page=1&limit=10').set('Cookie', cookie);
      const selesai = performance.now();
      return { status: res.status, ms: selesai - mulai };
    })
  );
  console.log('=== SELESAI ===');

  // Penjaga eksperimen: semua harus 200
  const gagal = hasil.filter((h) => h.status !== 200);
  if (gagal.length > 0) throw new Error(`Ada ${gagal.length} request non-200: ${JSON.stringify(gagal.slice(0, 3))}`);

  const ms = hasil.map((h) => h.ms).sort((a, b) => a - b);
  const p50 = ms[Math.floor(ms.length * 0.5)];
  const p95 = ms[Math.floor(ms.length * 0.95)];
  console.log(JSON.stringify({ n: hasil.length, min: +ms[0].toFixed(1), p50: +p50.toFixed(1), p95: +p95.toFixed(1), max: +ms[ms.length - 1].toFixed(1) }));
  process.exit(0);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
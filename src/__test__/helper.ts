import request from "supertest";

export async function loginWithCsrf(app: any, email: string, password: string) {
  // 1) Login → server balas Set-Cookie (access_token, refresh_token)
  const loginRes = await request(app).post("/api/auth/login").send({ email, password });
  if (loginRes.status !== 200) throw new Error(`Login gagal: ${loginRes.status}`);

  // 2) Ambil csrf token — butuh cookie login tadi
  const cookie1 = joinCookies(loginRes.headers["set-cookie"]);
  const csrfRes = await request(app).get("/api/auth/csrf-token").set("Cookie", cookie1);

  // 3) Gabung semua cookie + token untuk request berikutnya
  const cookieAll = joinCookies([
    ...(loginRes.headers["set-cookie"] ?? []),
    ...(csrfRes.headers["set-cookie"] ?? []),
  ]);
  return { cookie: cookieAll, csrfToken: csrfRes.body.csrfToken };
}

// Set-Cookie dari server = "a=v; Path=/; HttpOnly" → yang dikirim balik hanya "a=v"
function joinCookies(sc: string[] | string | undefined) {
  const list = sc ? (Array.isArray(sc) ? sc : [sc]) : [];
  return list.map((c) => c.split(";")[0]).join("; ");
}
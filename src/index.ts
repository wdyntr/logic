import { env } from './config/env';
import app from './app'
import { cleanUpIdempotencyKeys } from './jobs/cleanup-idempotency';
import { prisma } from './databases/db';

const PORT = env.PORT
// index.ts
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    cleanUpIdempotencyKeys().catch(console.error);
});

const job = setInterval(
  () => {
    cleanUpIdempotencyKeys().catch(console.error);
  },
  60 * 60 * 1000,
);

const shutdown = (signal: string) => {
  console.log(`${signal} diterima — menutup server...`);
  server.close(async () => {              // 1) berhenti terima koneksi baru, tunggu yang in-flight selesai
    clearInterval(job);                    // 2) matikan timer
    await prisma.$disconnect();            // 3) tutup koneksi DB dengan rapi
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref(); // 4) paksa keluar kalau ada request nyangkut >10 detik
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
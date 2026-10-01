import { redis } from '../config/redis';

export default async () => {
  await redis.quit();  // Tutup SEMUA koneksi sekali di akhir
};



const { redis } = require('../config/redis');

module.exports = async () => {
  try {
    await redis.quit();
  } catch (e) {
    // Redis mungkin sudah tertutup oleh test lain / cleanup
    // Abaikan error agar Jest exit clean
    console.warn('Redis quit skipped:', e.message);
  }
};
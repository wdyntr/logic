import app from './app'
import { cleanUpIdempotencyKeys } from './jobs/cleanup-idempotency';

const PORT = 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  cleanUpIdempotencyKeys().catch(console.error);
});

setInterval(
  () => {
    cleanUpIdempotencyKeys().catch(console.error);
  },
  60 * 60 * 1000,
);

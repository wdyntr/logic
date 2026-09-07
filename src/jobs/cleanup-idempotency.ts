import { prisma } from '../databases/db'

export const cleanUpIdempotencyKeys = async () => {
    const cutOff = new Date(Date.now() - 1 * 60 * 60 * 1000)

    await prisma.idempotencyKey.deleteMany({
        where: { createdAt: { lt: cutOff } }
    })
}
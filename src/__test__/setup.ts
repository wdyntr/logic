import { prisma } from "../databases/db";

export const cleanUpDatabase = async () => {
    await prisma.idempotencyKey.deleteMany({})
    await prisma.todo.deleteMany({})
    await prisma.user.deleteMany({})
}

export const disconnectDatabase = async () => {
    await prisma.$disconnect()
}
// tes query N = 1

import { Response, Request } from "express";
import { prisma } from "../databases/db";
import { AuthRequest } from "../middleware/auth.middleware";

export const getUsersV1 = async (req: AuthRequest, res: Response) => {
    const users = await prisma.user.findMany()
    const result = []
    for (const user of users) {
        const count = await prisma.todo.count({ where: { userId: user.id } })
        result.push({ ...user, count, id:user.id.toString()})
    }
    res.json({ data: result })
}

export const getUsersV2 = async (req: AuthRequest, res: Response) => {
    const users = await prisma.user.findMany({
        include: { _count: { select: { todo: true } } }
    })

    const safeUsers = users.map(u => ({...u, id:u.id.toString()}))
    res.json({data:safeUsers})
}

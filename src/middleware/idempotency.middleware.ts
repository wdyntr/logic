import { Request, Response, NextFunction } from "express";
import { prisma } from "../databases/db";

export const idempotency = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rawKey = req.headers["idempotency-key"] as string;
    if (!rawKey) return next();

    const scopedKey = `${req.method}:${req.path}:${rawKey}`;
    const cutOff = new Date(Date.now() - 60 * 60 * 1000);

    const exist = await prisma.idempotencyKey.findUnique({
      where: { key: scopedKey },
    });

    if (exist) {
      if (exist.createdAt < cutOff) {
        await prisma.idempotencyKey.delete({ where: { key: scopedKey } });
      } else {
        return res.status(exist.statusCode).json(exist.response);
      }
    }

    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      prisma.idempotencyKey
        .upsert({
          where: { key: scopedKey },
          create: { key: scopedKey, response: body, statusCode: res.statusCode },
          update: { response: body, statusCode: res.statusCode },
        })
        .catch(console.error);
      return originalJson(body);
    };
    next();
  } catch (error) {
    next(error)
  } 
};
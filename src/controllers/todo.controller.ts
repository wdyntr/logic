import { Request, Response } from "express";
import { prisma } from "../databases/db";
import { AuthRequest } from "../middleware/auth.middleware";
import { serializeTodo, serializeTodos } from "../utils/serializer";
import { AppError } from "../utils/app-error";

export const index = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const where = { userId };
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(req.query.limit as string) || 10),
  );
  const skip = (page - 1) * limit;

  const [todos, total] = await Promise.all([
    prisma.todo.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.todo.count({ where }),
  ]);

  res.json({
    data: serializeTodos(todos),
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
};

export const store = async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    const userId = req.userId!;

    const cek = await prisma.$transaction(async (tx) => {
      const exist = await tx.todo.findFirst({
        where: { name, userId },
      });

      if (exist) throw new AppError('Nama todo sudah tersedia', 409)

      const incompleteCount = await tx.todo.count({
        where: { userId, status: false },
      });

      if (incompleteCount >= 5) throw new AppError('Todo list mencapai limit', 406)

      return await tx.todo.create({
        data: { userId, name, status: false },
      });
    }, { isolationLevel: 'Serializable' })

    res.status(201).json({ message: "Berhasil menyimpan data Todo", data: serializeTodo(cek) });
  } catch (error: any) {
    if (error?.code === "P2034")
      throw new AppError('Gagal menyimpan data, todo mencapai limit', 406)


    if (error instanceof AppError) throw error
    throw new AppError('Gagal Menyimpan todo', 500)
  }
};

export const toggle = async (req: AuthRequest, res: Response) => {
  try {
    const id = BigInt(req.params.id);
    const userId = req.userId!;
    const todo = await prisma.todo.findFirst({
      where: { id, userId },
    });

    if (!todo) {
      throw new AppError('Todo tidak ditemukan', 404)
    }

    const hasil = await prisma.todo.update({
      where: { id },
      data: { status: !todo.status },
    });

    res.status(200).json({ message: "Berhasil toggle status", data: serializeTodo(hasil) });
  } catch (error) {
    if (error instanceof AppError) throw error

    throw new AppError('Gagal toggle todo', 500)
  }
};

export const update = async (req: AuthRequest, res: Response) => {
  try {
    const id = BigInt(req.params.id);
    const userId = req.userId!;
    const { name, status } = req.body;

    const todo = await prisma.todo.findFirst({
      where: { id, userId },
    });

    if (!todo)
      throw new AppError('Todo tidak ditemukan', 404)


    const data: { name?: string; status?: boolean } = {};
    if (name !== undefined) data.name = name;
    if (status !== undefined) data.status = status;

    if (Object.keys(data).length === 0)
      throw new AppError('Tidak ada data yang diupdate', 400)


    const hasil = await prisma.todo.update({
      where: { id },
      data,
    });

    res.status(200).json({ message: "Berhasil update todo", data: serializeTodo(hasil) });
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError("Gagal update todo", 500)
  }
};


export const destroy = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const id = BigInt(String(req.params.id));
  const todo = await prisma.todo.findFirst({
    where: { id, userId },
  });
  if (!todo) throw new AppError('Todo tidak ditemukan', 404)

  const hasil = await prisma.todo.delete({
    where: { id, userId },
  });
  if (hasil) {
    res.status(204).send();
  } else {
    throw new AppError('Hapus data gagal', 500)
  }
};

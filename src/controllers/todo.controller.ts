import { Request, Response } from "express";
import { prisma } from "../databases/db";
import { AuthRequest } from "../middleware/auth.middleware";

function serializeTodo(todo: any) {
  return {
    ...todo,
    id: todo.id.toString(),
    userId: todo.userId.toString(),
  };
}

function serializeTodos(todos: any[]) {
  return todos.map(serializeTodo);
}

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

    const hasil = await prisma.$transaction(async (tx) => {
      // Query 1: hitung incomplete todos (dalam transaksi)
      const hitung = await tx.todo.count({
        where: { userId, status: false },
      });
      if (hitung >= 5) {
        return null; // signal: limit tercapai
      }
      // Query 2: cek duplikat nama (dalam transaksi yang sama)
      const exist = await tx.todo.findFirst({
        where: { name, userId },
      });
      if (exist) {
        return "duplicate"; // signal: nama sudah ada
      }
      // Query 3: create
      return await tx.todo.create({
        data: { userId, name, status: false },
      });
    });

    if (hasil === null) {
      return res.status(406).json({ message: "Todo list mencapai limit" });
    }
    if (hasil === "duplicate") {
      return res.status(409).json({ message: "Nama todo sudah tersedia" });
    }

    res.status(201).json({
      message: "Berhasil menyimpan data Todo",
      data: serializeTodo(hasil),
    });
  } catch (error) {
    return res.status(500).json({ message: `Gagal menyimpan todo ${error}` });
  }
};
export const toggle = async (req: AuthRequest, res: Response) => {
  try {
    const id = BigInt(req.params.id);
    const userId = req.userId!;

    const hasil = await prisma.$transaction(async (tx) => {
      // Query 1: hitung incomplete todos (dalam transaksi)
      const todo = await tx.todo.findFirst({
        where: { id, userId },
      });

      if (!todo) {
        return 404;
      }

      return await tx.todo.update({
        where: { id },
        data: { status: !todo.status },
      });
    });

    if (hasil === 404)
      return res.status(404).json({ message: "Todo tidak ditemukan" });

    res.status(200).json({
      message: "Berhasil toggle status",
      data: serializeTodo(hasil),
    });
  } catch (error) {
    return res.status(500).json({ message: `Gagal toggle todo ${error}` });
  }
};

export const update = async (req: AuthRequest, res: Response) => {
  try {
    const id = BigInt(req.params.id);
    const userId = req.userId!;
    const { name, status } = req.body;

    const hasil = await prisma.$transaction(async (tx) => {
      const todo = await tx.todo.findFirst({
        where: { id, userId },
      });

      if (!todo) {
        return 404;
      }

      const data: { name?: string; status?: boolean } = {};
      if (name !== undefined) data.name = name;
      if (status !== undefined) data.status = status;

      if (Object.keys(data).length === 0) {
        return 400;
      }

      return await tx.todo.update({
        where: { id },
        data,
      });
    });
    if (hasil === 404)
      return res.status(404).json({ message: "Todo tidak ditemukan" });

    if (hasil === 400)
      return res.status(400).json({ message: "Tidak ada data yang diupdate" });

    res
      .status(200)
      .json({ message: "Berhasil update todo", data: serializeTodo(hasil) });
  } catch (error) {
    return res.status(500).json({ message: `Gagal update todo ${error}` });
  }
};

export const destroy = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const id = BigInt(String(req.params.id));
  const todo = await prisma.todo.findFirst({
    where: { id, userId },
  });
  if (!todo) return res.status(404).json({ message: "Todo tidak ditemukan" });

  const hasil = await prisma.todo.delete({
    where: { id, userId },
  });
  if (hasil) {
    res.status(204).send();
  } else {
    res.status(500).json({ message: "Hapus data gagal" });
  }
};

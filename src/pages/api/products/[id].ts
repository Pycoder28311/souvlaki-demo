import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) return res.status(400).json({ error: "Invalid ID" });

  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
    include: {
      ingCategories: {
        include: {
          ingredients: true,
        },
      },
      options: true,
    },
  });

  if (!product) return res.status(404).json({ error: "Product not found" });

  res.status(200).json(product);
}

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    const { name } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Product name is required" });
    }

    const productId = parseInt(id, 10);

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { name },
    });

    return res.status(200).json(updatedProduct);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update product" });
  }
}

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    const { offer } = req.body as { offer: boolean };

    if (typeof offer !== "boolean") {
      return res.status(400).json({ message: "Invalid offer value" });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: { offer }, // use the value from request body
    });

    return res.status(200).json(updatedProduct);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update product offer" });
  }
}

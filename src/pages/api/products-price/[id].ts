import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  // Only allow PUT requests
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Validate ID
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    const { price } = req.body;

    if (!price || typeof price !== "number") {
      return res.status(400).json({ message: "Price is required and must be a number" });
    }

    const productId = parseInt(id, 10);

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { price },
    });

    return res.status(200).json(updatedProduct);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update product description" });
  }
}

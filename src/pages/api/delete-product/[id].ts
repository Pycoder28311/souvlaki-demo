import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    const productId = parseInt(id, 10);

    // Delete the product
    await prisma.product.delete({
      where: { id: productId },
    });

    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to delete product" });
  }
}

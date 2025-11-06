import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: "Invalid category ID" });
  }

  try {
    const { name } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Category name is required" });
    }

    const categoryId = parseInt(id, 10);

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: { name },
    });

    return res.status(200).json(updatedCategory);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update category" });
  }
}

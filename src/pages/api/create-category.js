import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { name } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Category name is required" });
    }

    // Get the current maximum position
    const maxPositionResult = await prisma.category.aggregate({
      _max: { position: true },
    });

    const maxPosition = maxPositionResult._max.position ?? 0;

    // Create category with position = max + 1
    const newCategory = await prisma.category.create({
      data: {
        name,
        position: maxPosition + 1,
      },
    });

    return res.status(201).json(newCategory);
  } catch (error) {
    console.error("Error creating category:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

import { prisma } from "@/lib/prisma";

const DEFAULT_DAY = "default"; // same as your frontend

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

    // Create category with a default interval
    const newCategory = await prisma.category.create({
      data: {
        name,
        position: maxPosition + 1,
        intervals: {
          create: {
            open: "04:00",
            close: "03:59",
          },
        },
      },
      include: {
        intervals: true,
      },
    });

    // Return the category in the frontend-friendly shape
    const formattedCategory = {
      ...newCategory,
      intervals: {
        [DEFAULT_DAY]: newCategory.intervals.map((i) => ({
          id: i.id,
          open: i.open,
          close: i.close,
          isAfterMidnight: Number(i.close.split(":")[0]) < 4,
        })),
      },
    };

    return res.status(201).json(formattedCategory);
  } catch (error) {
    console.error("Error creating category:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

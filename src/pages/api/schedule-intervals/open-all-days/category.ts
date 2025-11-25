import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { ALL_DAY_OPEN, ALL_DAY_CLOSE } from "../../../../app/utils/hours";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { categoryId } = req.body;

  if (typeof categoryId !== "number") {
    return res.status(400).json({ error: "Invalid category ID" });
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { intervals: true },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // DELETE — remove all intervals
    if (req.method === "DELETE") {
      await prisma.timeInterval.deleteMany({
        where: { categoryId: category.id },
      });

      return res.status(200).json({ success: true });
    }

    // POST — remove all intervals, then create an "open all day" interval
    if (req.method === "POST") {
      await prisma.timeInterval.deleteMany({
        where: { categoryId: category.id },
      });

      const newInterval = await prisma.timeInterval.create({
        data: {
          categoryId: category.id,
          open: ALL_DAY_OPEN,
          close: ALL_DAY_CLOSE,
        },
      });

      return res.status(200).json({ success: true, interval: newInterval });
    }

    return res.status(405).json({ error: "Method not allowed" });

  } catch (error) {
    console.error("Error handling category intervals:", error);
    return res.status(500).json({ error: "Failed to handle intervals" });
  }
}

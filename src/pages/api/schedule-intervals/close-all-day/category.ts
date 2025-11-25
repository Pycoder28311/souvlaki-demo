import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { categoryId } = req.body;

  if (typeof categoryId !== "number") {
    return res.status(400).json({ error: "Invalid day" });
  }

  try {
    if (req.method === "DELETE") {
      // Find the schedule for the day
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        include: { intervals: true },
      });

      if (!category) {
        return res.status(404).json({ error: "Schedule not found" });
      }

      // Delete all intervals for this schedule
      await prisma.timeInterval.deleteMany({
        where: { categoryId: category.id },
      });

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error deleting intervals:", error);
    return res.status(500).json({ error: "Failed to delete intervals" });
  }
}

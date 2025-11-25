import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { overrideId } = req.body;

  if (!overrideId || Array.isArray(overrideId)) {
    return res.status(400).json({ error: "Invalid overrideId" });
  }

  const overrideIdNum = parseInt(overrideId, 10);
  if (isNaN(overrideIdNum)) {
    return res.status(400).json({ error: "Invalid overrideId number" });
  }

  try {
    const override = await prisma.override.findUnique({
      where: { id: overrideIdNum },
      include: { intervals: true },
    });

    if (!override) {
      return res.status(404).json({ error: "Override not found" });
    }

    if (req.method === "DELETE") {
      // Delete all intervals
      await prisma.timeInterval.deleteMany({ where: { overrideId: override.id } });
      return res.status(200).json({ success: true });
    }

    if (req.method === "POST") {
      // Delete all intervals first
      await prisma.timeInterval.deleteMany({ where: { overrideId: override.id } });

      // Create an interval that is "open all day"
      const newInterval = await prisma.timeInterval.create({
        data: {
          overrideId: override.id,
          open: "04:00",
          close: "03:59",
        },
      });

      return res.status(200).json({ success: true, interval: newInterval });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error handling override intervals:", error);
    return res.status(500).json({ error: "Failed to handle intervals" });
  }
}

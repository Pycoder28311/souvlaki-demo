import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { ALL_DAY_OPEN, ALL_DAY_CLOSE } from "../../../../app/utils/hours";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { week } = req.query;

  if (typeof week !== "string") {
    return res.status(400).json({ error: "Invalid day" });
  }

  try {
    const schedule = await prisma.schedule.findUnique({
      where: { day: week },
      include: { intervals: true },
    });

    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    if (req.method === "DELETE") {
      // Delete all intervals
      await prisma.timeInterval.deleteMany({ where: { scheduleId: schedule.id } });
      return res.status(200).json({ success: true });
    }

    if (req.method === "POST") {
      // Delete all intervals first
      await prisma.timeInterval.deleteMany({ where: { scheduleId: schedule.id } });

      // Create an interval that is "open all day"
      const newInterval = await prisma.timeInterval.create({
        data: {
          scheduleId: schedule.id,
          open: ALL_DAY_OPEN,
          close: ALL_DAY_CLOSE,
        },
      });

      return res.status(200).json({ success: true, interval: newInterval });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error handling schedule intervals:", error);
    return res.status(500).json({ error: "Failed to handle intervals" });
  }
}

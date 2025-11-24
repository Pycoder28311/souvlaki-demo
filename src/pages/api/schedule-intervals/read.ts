// pages/api/schedules/weeklyIntervals.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

type Interval = {
  id: number | string;
  open: string;
  close: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const schedules = await prisma.schedule.findMany({
      include: { intervals: true },
    });

    // Build an object: { Monday: [...], Tuesday: [...], ... }
    const weeklyIntervals: Record<string, Interval[]> = {};

    for (const schedule of schedules) {
      weeklyIntervals[schedule.day] = schedule.intervals.map((i) => ({
        id: i.id,
        open: i.open,
        close: i.close,
      }));
    }

    return res.status(200).json({ weeklyIntervals });
  } catch (error) {
    console.error("Error fetching weekly intervals:", error);
    return res.status(500).json({ error: "Failed to fetch intervals" });
  }
}

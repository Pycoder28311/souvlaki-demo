import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { DayOfWeek } from "../../../../../app/types";
import { ALL_DAY_OPEN, ALL_DAY_CLOSE } from "../../../../../app/utils/hours";

type Data =
  | { interval: {
  id: number
  scheduleId: number | null   // can be null (override case OR future schema)
  open: string
  close: string
  productId: number | null
  categoryId: number | null
} }
  | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { query, body, method } = req;

  if (method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Validate day
  const dayParam = query.day;
  if (!dayParam || Array.isArray(dayParam)) {
    return res.status(400).json({ error: "Invalid day parameter" });
  }
  if (!Object.values(DayOfWeek).includes(dayParam as DayOfWeek)) {
    return res.status(400).json({ error: "Invalid day parameter" });
  }
  const day = dayParam as DayOfWeek;

  const { open, close } = body;
  if (!open || !close) {
    return res.status(400).json({ error: "Missing open or close times" });
  }

  try {
    // Find or create schedule for this day
    let schedule = await prisma.schedule.findUnique({ where: { day } });
    if (!schedule) {
      schedule = await prisma.schedule.create({ data: { day } });
    }

    // Remove existing "all-day" interval if exists
    const allDayInterval = await prisma.timeInterval.findFirst({
      where: { scheduleId: schedule.id, open: ALL_DAY_OPEN, close: ALL_DAY_CLOSE },
    });
    if (allDayInterval) {
      await prisma.timeInterval.delete({ where: { id: allDayInterval.id } });
    }

    // Create new interval
    const interval = await prisma.timeInterval.create({
      data: { scheduleId: schedule.id, open, close },
    });

    return res.status(200).json({ interval });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Unknown error" });
  }
}

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { DayOfWeek } from "../../../../app/types";

type Data =
  | { interval: { id: number; scheduleId: number; open: string; close: string } }
  | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { query, body, method } = req;

  if (method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // req.query.day can be string | string[] | undefined
  const dayParam = query.day;
  if (!dayParam || Array.isArray(dayParam)) {
    return res.status(400).json({ error: "Invalid day parameter" });
  }

  // Validate that dayParam is a valid DayOfWeek
  if (!Object.values(DayOfWeek).includes(dayParam as DayOfWeek)) {
    return res.status(400).json({ error: "Invalid day parameter" });
  }

  const day = dayParam as DayOfWeek; // ✅ safe cast

  try {
    const { open, close } = body;

    if (!open || !close) {
      return res.status(400).json({ error: "Missing open or close times" });
    }

    // Find or create schedule
    let schedule = await prisma.schedule.findUnique({ where: { day } });
    if (!schedule) {
      schedule = await prisma.schedule.create({ data: { day } });
    }

    // Create interval
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

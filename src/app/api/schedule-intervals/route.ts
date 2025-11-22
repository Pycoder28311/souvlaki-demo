import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const schedules = await prisma.schedule.findMany({
      include: { intervals: true },
    });

    // Build an object: { Monday: [...], Tuesday: [...], ... }
    const weeklyIntervals: Record<string, any[]> = {};
    for (const schedule of schedules) {
      weeklyIntervals[schedule.day] = schedule.intervals.map((i) => ({
        id: i.id,
        open: i.open,
        close: i.close,
      }));
    }

    return NextResponse.json({ weeklyIntervals });
  } catch (error) {
    console.error("Error fetching weekly intervals:", error);
    return NextResponse.json({ error: "Failed to fetch intervals" }, { status: 500 });
  }
}
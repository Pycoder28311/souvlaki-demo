import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST → add a new interval to a day
export async function POST(req: NextRequest, context: { params: { day: string } }) {
  const params = await context.params;
  const day = params.day;

  const { open, close } = await req.json();

  // Find or create schedule for the day
  let schedule = await prisma.schedule.findUnique({ where: { day } });
  if (!schedule) {
    schedule = await prisma.schedule.create({ data: { day } });
  }

  // Create interval
  const interval = await prisma.interval.create({
    data: { scheduleId: schedule.id, open, close },
  });

  return NextResponse.json({ interval });
}

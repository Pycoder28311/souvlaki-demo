// src/app/api/schedule/get/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
  
    const weekly = await prisma.weeklySchedule.findMany({
      orderBy: { id: "asc" },
    });
    const overrides = await prisma.dateScheduleOverride.findMany({
      orderBy: { date: "asc" },
    });
    
    return NextResponse.json({ weekly, overrides });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 });
  }
}

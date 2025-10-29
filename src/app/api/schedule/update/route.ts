// src/app/api/schedule/update/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { weekly, overrides } = await request.json();

    // Update or insert weekly schedule
    if (Array.isArray(weekly)) {
      for (const day of weekly) {
        await prisma.weeklySchedule.upsert({
          where: { id: day.id || 0 }, // αν δεν υπάρχει id, θα δημιουργηθεί
          update: {
            openHour: day.openHour,
            closeHour: day.closeHour,
            alwaysClosed: day.alwaysClosed,
          },
          create: {
            dayOfWeek: day.dayOfWeek,
            openHour: day.openHour,
            closeHour: day.closeHour,
            alwaysClosed: day.alwaysClosed,
          },
        });
      }
    }

    // Replace all overrides (delete old and insert new)
    if (Array.isArray(overrides)) {
        // Φιλτράρουμε μόνο overrides που έχουν έγκυρο ISO string για date
        const validOverrides = overrides
        .filter(o => o.date && !isNaN(Date.parse(o.date)))
        .map(o => ({
            ...o,
            date: new Date(o.date),
        }));

        await prisma.dateScheduleOverride.deleteMany({});
        if (validOverrides.length > 0) {
          await prisma.dateScheduleOverride.createMany({ data: validOverrides });
        }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update schedule" }, { status: 500 });
  }
}

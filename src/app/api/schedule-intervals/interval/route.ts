// app/api/schedules/interval/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT → update a single interval by ID
export async function PUT(req: NextRequest) {
  const { id, open, close } = await req.json();

  const updated = await prisma.timeInterval.update({
    where: { id },
    data: { open, close },
  });

  return NextResponse.json({ interval: updated });
}

// DELETE → remove a single interval by ID
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  console.log(id)

  await prisma.timeInterval.delete({ where: { id } });

  return NextResponse.json({ success: true });
}

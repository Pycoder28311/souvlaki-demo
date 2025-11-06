import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const images = await prisma.image.findMany({
      select: { id: true }, // only return IDs
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(images)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 })
  }
}

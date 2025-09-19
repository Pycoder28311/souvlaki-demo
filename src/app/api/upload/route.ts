import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get("file") as File

  if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 })

  const bytes = Buffer.from(await file.arrayBuffer())

  const saved = await prisma.image.create({
    data: { data: bytes },
  })

  return NextResponse.json({ id: saved.id })
}

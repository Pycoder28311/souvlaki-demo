import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(req: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    const imageId = Number(id)

    if (isNaN(imageId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const image = await prisma.image.findUnique({ where: { id: imageId } })

    if (!image || !image.data) {
      return NextResponse.json({ error: `Image with ID ${imageId} not found` }, { status: 404 })
    }

    // Convert Uint8Array to Buffer for Node.js/Next.js
    const buffer = Buffer.from(image.data)

    return new Response(buffer, {
      headers: {
        "Content-Type": "image/png", // or dynamically detect type
        "Cache-Control": "public, max-age=31536000",
      },
    })
  } catch (err) {
    if (err instanceof Error) {
      console.error(err)
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 })
  }
}

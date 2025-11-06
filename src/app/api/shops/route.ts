import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET and POST
export async function GET() {
  try {
    const shops = await prisma.shop.findMany({
      orderBy: { id: "asc" },
    });
    return NextResponse.json(shops);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch shops" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { street, validRadius } = body;

    if (!street || street.trim().length < 1) {
      return NextResponse.json({ error: "Street is required" }, { status: 400 });
    }

    const newShop = await prisma.shop.create({
      data: {
        street,
        validRadius: validRadius ?? 0,
      },
    });

    return NextResponse.json(newShop);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create shop" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";

// Example using Prisma, adjust to your database setup
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { id, field, value } = await req.json();

    if (!id || !field || typeof value === "undefined") {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Update the specified field
    const updatedCategory = await prisma.product.update({
      where: { id },
      data: { [field]: value },
    });

    return NextResponse.json({ success: true, data: updatedCategory });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

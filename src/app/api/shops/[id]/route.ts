import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const shopId = parseInt(params.id);
    const body = await req.json();
    const { street, validRadius } = body;

    const updatedShop = await prisma.shop.update({
      where: { id: shopId },
      data: {
        street,
        validRadius: validRadius ?? 0,
      },
    });

    return NextResponse.json(updatedShop);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update shop" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const shopId = parseInt(params.id);

    await prisma.shop.delete({
      where: { id: shopId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete shop" }, { status: 500 });
  }
}

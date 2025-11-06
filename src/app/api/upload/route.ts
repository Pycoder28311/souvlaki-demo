import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const productId = formData.get("productId") as string; // product ID from the form

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  if (!productId) {
    return NextResponse.json({ error: "No productId provided" }, { status: 400 });
  }

  // Convert file to bytes
  const bytes = Buffer.from(await file.arrayBuffer());

  // Create the image
  const savedImage = await prisma.image.create({
    data: { data: bytes },
  });

  // Update the product to reference the image
  await prisma.product.update({
    where: { id: Number(productId) },
    data: { imageId: savedImage.id },
  });

  return NextResponse.json({ id: savedImage.id });
}

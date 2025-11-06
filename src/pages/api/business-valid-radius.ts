import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma"; // adjust path if needed
import { Shop } from "@/app/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 🔹 Fetch all shops and select only validRadius
    const shops = await prisma.shop.findMany({
      select: { validRadius: true },
      orderBy: { id: "asc" },
    });

    // 🔹 Map to an array of numbers, replacing null with 0
    const validRadii = shops.map((shop: Shop) => shop.validRadius ?? 0);

    return res.status(200).json(validRadii);
  } catch (error) {
    console.error("Error fetching valid radii:", error);
    return res.status(500).json({ error: "Failed to fetch valid radii" });
  }
}

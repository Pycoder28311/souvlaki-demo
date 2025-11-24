// pages/api/schedule-intervals/product-read.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

type Interval = {
  id: number;
  open: string;
  close: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { id } = req.body;
    const productId = Number(id);

    if (!productId || isNaN(productId)) {
      return res.status(400).json({ error: "Missing or invalid product id" });
    }

    const intervals = await prisma.timeInterval.findMany({
      where: { productId },
    });

    const formattedIntervals: Interval[] = intervals.map((i) => ({
      id: i.id,
      open: i.open,
      close: i.close,
    }));

    return res.status(200).json({ intervals: formattedIntervals });
  } catch (error) {
    console.error("Error fetching product intervals:", error);
    return res.status(500).json({ error: "Failed to fetch intervals" });
  }
}

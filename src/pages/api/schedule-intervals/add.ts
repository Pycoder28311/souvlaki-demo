import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export interface Interval { 
  id: number; 
  open: string; 
  close: string, 
};

type Data =
  | { interval: Interval }
  | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { open, close, object, id: objectId } = req.body;

    // Basic validation
    if (!open || !close) {
      return res.status(400).json({ error: "Missing open or close times" });
    }

    if (!object || typeof object !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'object'" });
    }

    if (!objectId || typeof objectId !== "number") {
      return res.status(400).json({ error: "Missing or invalid 'id'" });
    }

    // Build dynamic relation field
    let relationField: Record<string, number> = {};

    if (object === "schedule") {
      relationField = { scheduleId: objectId };
    } else if (object === "product") {
      relationField = { productId: objectId };
    } else if (object === "category") {
      relationField = { categoryId: objectId };
    } else if (object === "override") {
      relationField = { overrideId: objectId };
    } else {
      return res.status(400).json({ error: "Invalid object type" });
    }

    const intervalToRemove = await prisma.timeInterval.findFirst({
      where: {
        open: "04",
        close: "03:59",
        ...relationField, // make sure it matches the same schedule/product/category
      },
    });

    if (intervalToRemove) {
      await prisma.timeInterval.delete({
        where: { id: intervalToRemove.id },
      });
    }

    // Create interval
    const interval = await prisma.timeInterval.create({
      data: {
        open,
        close,
        ...relationField, // dynamically inserts the correct FK
      },
    });
    console.log(interval)

    return res.status(200).json({ interval });

  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Unknown error" });
  }
}
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { overrideId, newDate } = req.body;

    if (!overrideId || !newDate || typeof newDate !== "string") {
      return res.status(400).json({ error: "Missing or invalid fields" });
    }

    const updatedOverride = await prisma.override.update({
      where: { id: overrideId },
      data: { date: newDate },
    });

    return res.status(200).json({ override: updatedOverride });
  } catch (error) {
    console.error("Error updating override date:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

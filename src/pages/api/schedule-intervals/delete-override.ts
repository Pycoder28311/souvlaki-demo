import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { overrideId } = req.body;

    if (typeof overrideId !== "number") {
      return res.status(400).json({ error: "Invalid overrideId" });
    }

    // Delete all intervals for this override first
    await prisma.timeInterval.deleteMany({ where: { overrideId } });

    // Delete the override itself
    await prisma.override.delete({ where: { id: overrideId } });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error deleting override:", error);
    return res.status(500).json({ error: "Failed to delete override" });
  }
}

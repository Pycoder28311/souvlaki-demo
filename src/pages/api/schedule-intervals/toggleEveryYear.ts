import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

// Example: replace with your actual database logic
async function updateOverrideEveryYear(overrideId: number, everyYear: boolean) {
  // This is where you'd update your DB, e.g. using Prisma, MySQL, etc.
  // Example with Prisma:
  return prisma.override.update({
     where: { id: overrideId },
     data: { everyYear },
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { overrideId, everyYear } = req.body;

    if (typeof overrideId !== "number" || typeof everyYear !== "boolean") {
      return res.status(400).json({ message: "Invalid request body" });
    }

    const updatedOverride = await updateOverrideEveryYear(overrideId, everyYear);

    return res.status(200).json(updatedOverride);
  } catch (error) {
    console.error("Error updating everyYear:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

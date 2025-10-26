import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma"; // adjust path if needed

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Fetch the first user with business=true
    const user = await prisma.user.findFirst({
      where: { business: true },
      select: { validRadius: true },
    });

    if (!user || user.validRadius == null) {
      return res.status(404).json({ error: "Business user not found" });
    }

    res.status(200).json(user.validRadius); // returns just the number
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch valid radius" });
  }
}

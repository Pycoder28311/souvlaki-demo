import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const updates: { id: number; position: number }[] = req.body;

    await Promise.all(
      updates.map((u) =>
        prisma.category.update({
          where: { id: u.id },
          data: { position: u.position },
        })
      )
    );

    return res.status(200).json({ message: "Positions updated" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

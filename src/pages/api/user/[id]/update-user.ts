import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query; // ✅ get user ID from folder name

  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { name, address, distanceToDestination } = req.body;

    if (!name && !address && !distanceToDestination) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) }, // ✅ use id from URL
      data: {
        ...(name && { name }),
        ...(address && { address }),
        ...(distanceToDestination && { distanceToDestination }),
      },
    });

    return res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Error updating user:", err);
    return res.status(500).json({ error: "Failed to update user" });
  }
}

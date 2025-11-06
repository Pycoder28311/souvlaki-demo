import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query; // ✅ user ID from folder name

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { floor, bellName, comment } = req.body as {
    floor?: string;
    bellName?: string;
    comment?: string;
  };

  if (!id) {
    return res.status(400).json({ error: "Missing user ID" });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        ...(floor && { floor }),
        ...(bellName && { bellName }),
        ...(comment && { comment }),
      },
    });

    return res.status(200).json({
      success: true,
      user: updatedUser,
      message: "User details updated successfully",
    });
  } catch (error) {
    console.error("Error updating user details:", error);
    return res.status(500).json({ error: "Failed to update user details" });
  }
}

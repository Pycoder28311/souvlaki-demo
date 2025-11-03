import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query; // user id from URL

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { validRadius } = req.body;

  if (!id || validRadius == null) {
    return res.status(400).json({ message: "Missing user ID or validRadius" });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) }, // ensure correct type
      data: { validRadius: parseFloat(validRadius) }, // convert to number
    });

    return res.status(200).json(updatedUser);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update validRadius" });
  }
}

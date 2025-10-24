// pages/api/update-vali-radius.ts
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { userId, validRadius } = req.body;

  if (!userId || validRadius == null) {
    return res.status(400).json({ message: "Missing userId or valiRadius" });
  }
  console.log(validRadius)

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { validRadius: parseFloat(validRadius) }, // ensure decimal
    });

    return res.status(200).json(updatedUser);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update valiRadius" });
  }
}

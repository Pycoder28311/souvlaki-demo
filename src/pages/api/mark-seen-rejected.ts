// pages/api/mark-seen-rejected.ts
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma"; // adjust path to your prisma client

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { orderId } = req.body;

  if (!orderId) return res.status(400).json({ message: "Missing orderId" });

  try {
    const updatedOrder = await prisma.productOrder.update({
      where: { id: orderId },
      data: { seenRejected: true },
    });
    return res.status(200).json(updatedOrder);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update order" });
  }
}

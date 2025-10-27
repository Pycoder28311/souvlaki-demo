// /pages/api/reject-order.ts
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: "Missing order id" });

    const updatedOrder = await prisma.productOrder.update({
      where: { id: Number(id) },
      data: { status: "rejected" }, // αλλάζουμε μόνο το status
    });

    return res.status(200).json({ success: true, order: updatedOrder });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Failed to reject order" });
  }
}

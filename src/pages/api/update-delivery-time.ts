// pages/api/update-delivery-time.ts
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id, deliveryTimeEdit, currentRange, deliveryTime } = req.body;

  if (!id || deliveryTimeEdit == null) {
    return res.status(400).json({ message: "Missing order ID or deliveryTimeEdit" });
  }

  try {
    let updatedDeliveryTime: string;

    const edit = Number(deliveryTimeEdit);

    if (!currentRange) {
      // Αν δεν υπάρχει προηγούμενο range, απλώς φτιάχνουμε νέο
      updatedDeliveryTime = `${edit}-${edit + 5}`;
    } else {
      // parse currentRange
      const [curStartStr, curEndStr] = currentRange.split("-");
      const curStart = Number(curStartStr);
      const curEnd = Number(curEndStr);

      // parse deliveryTime (τώρα)
      let diffStart = 0;
      let diffEnd = 0;
      if (deliveryTime) {
        const [delStartStr, delEndStr] = deliveryTime.split("-");
        const delStart = Number(delStartStr);
        const delEnd = Number(delEndStr);
        diffStart = delStart - curStart;
        diffEnd = delEnd - curEnd;
      }

      const newStart = curStart + edit + diffStart;
      const newEnd = curEnd + edit + diffEnd;

      updatedDeliveryTime = `${newStart}-${newEnd}`;
    }

    const updatedOrder = await prisma.productOrder.update({
      where: { id },
      data: { deliveryTime: updatedDeliveryTime },
    });

    return res.status(200).json(updatedOrder);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update delivery time" });
  }
}

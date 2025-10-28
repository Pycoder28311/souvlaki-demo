import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";

function isAvailableNow(
  openHour: string | null,
  closeHour?: string | null,
  alwaysClosed?: boolean
): { available: boolean; reason?: string } {
  if (alwaysClosed) return { available: false, reason: "alwaysClosed" };
  if (!openHour || !closeHour) return { available: false, reason: "noHoursSet" };

  const now = new Date();
  const [openH, openM] = openHour.split(":").map(Number);
  const [closeH, closeM] = closeHour.split(":").map(Number);

  const openDate = new Date(now);
  openDate.setHours(openH, openM, 0, 0);

  const closeDate = new Date(now);
  closeDate.setHours(closeH, closeM, 0, 0);

  // Overnight logic
  let available: boolean;
  if (closeDate <= openDate) {
    available = now >= openDate || now <= closeDate;
  } else {
    available = now >= openDate && now <= closeDate;
  }

  return { available, reason: available ? undefined : "closedNow" };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { productIds } = req.body as { productIds: number[] };

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: "Missing or invalid productIds" });
    }

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        openHour: true,
        closeHour: true,
        alwaysClosed: true,
        category: {
          select: {
            id: true,
            name: true,
            openHour: true,
            closeHour: true,
            alwaysClosed: true,
          },
        },
      },
    });

    const productsWithAvailability = products.map((p) => {
      const prodStatus = isAvailableNow(p.openHour, p.closeHour, p.alwaysClosed);
      const catStatus = isAvailableNow(
        p.category.openHour,
        p.category.closeHour,
        p.category.alwaysClosed
      );

      const available = prodStatus.available && catStatus.available;
      let reason = undefined;

      if (!available) {
        // Priority: alwaysClosed > closedNow > noHoursSet
        if (p.alwaysClosed || p.category.alwaysClosed) {
          reason = "alwaysClosed";
        } else if (!prodStatus.available || !catStatus.available) {
          reason = "closedNow";
        } else {
          reason = "noHoursSet";
        }
      }

      return {
        ...p,
        available,
        unavailableReason: reason,
      };
    });

    res.status(200).json({ products: productsWithAvailability });
  } catch (err) {
    console.error("Error fetching product hours:", err);
    res.status(500).json({ error: "Failed to fetch product hours" });
  }
}


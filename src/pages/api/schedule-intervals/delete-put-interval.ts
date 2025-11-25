// pages/api/schedules/interval.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "PUT") {
      const { id, field, value } = req.body;

      if (!id || !field || value === undefined) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const updated = await prisma.timeInterval.update({
        where: { id },
        data: { [field]: value },
      });

      return res.status(200).json({ interval: updated });
    }

    if (req.method === "DELETE") {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Missing interval ID" });
      }

      await prisma.timeInterval.delete({
        where: { id },
      });

      return res.status(200).json({ success: true });
    }

    // Method not allowed
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

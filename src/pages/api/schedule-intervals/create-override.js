// pages/api/overrides/index.ts
import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { date } = req.body;

      if (!date) {
        return res.status(400).json({ message: "Date is required" });
      }

      // Create override with empty intervals
      const override = await prisma.override.create({
        data: {
          date,
        },
      });

      return res.status(201).json(override);
    } catch (error) {
      console.error("Error creating override:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

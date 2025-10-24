import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { floor, userEmail } = req.body;

    if (!userEmail || !floor) {
      return res.status(400).json({ error: "Missing userId or floor" });
    }

    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: { floor },
    });

    return res.status(200).json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("Error updating floor:", err);
    return res.status(500).json({ error: "Failed to update floor" });
  }
}


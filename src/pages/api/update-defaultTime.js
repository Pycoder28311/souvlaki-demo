// pages/api/update-defaultTime.js
import { prisma } from "../../lib/prisma"; // αν χρησιμοποιείς Prisma

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { defaultTime, userEmail } = req.body;

  if (!userEmail) return res.status(400).json({ message: "Missing userEmail" });

  try {
    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: { defaultTime }, // Βεβαιώσου ότι η βάση έχει πεδίο defaultTime
    });
    res.status(200).json({ message: "Default time updated", user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating default time" });
  }
}

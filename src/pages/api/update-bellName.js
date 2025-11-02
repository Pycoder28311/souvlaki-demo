// pages/api/update-bellName.js
import { prisma } from "../../lib/prisma"; // Αν χρησιμοποιείς Prisma

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { bellName, userEmail } = req.body;

  if (!userEmail) return res.status(400).json({ message: "Missing userEmail" });

  try {
    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: { bellName }, // Βεβαιώσου ότι η βάση έχει πεδίο bellName
    });
    res.status(200).json({ message: "Bell name updated", user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating bell name" });
  }
}

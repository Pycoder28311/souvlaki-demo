// pages/api/update-comment.js
import { prisma } from "../../lib/prisma"; // αν χρησιμοποιείς Prisma

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { comment, userEmail } = req.body;

  if (!userEmail) return res.status(400).json({ message: "Missing userEmail" });

  try {
    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: { comment }, // assumes your User table has a 'comment' field
    });
    res.status(200).json({ message: "Comment updated", user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating comment" });
  }
}

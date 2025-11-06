import { prisma } from "@/lib/prisma"; // adjust path if needed

export default async function handler(req, res) {
  const { id } = req.query; // ✅ get user ID from folder name

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { comment } = req.body;

  if (!id) return res.status(400).json({ message: "Missing user ID" });

  try {
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) }, // use id from folder
      data: { comment },            // ensure the database has this field
    });

    res.status(200).json({ message: "Comment updated", user: updatedUser });
  } catch (err) {
    console.error("Error updating comment:", err);
    res.status(500).json({ message: "Error updating comment" });
  }
}

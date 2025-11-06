import { prisma } from "../../lib/prisma"; // adjust path if needed

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { defaultTime } = req.body;

  if (!defaultTime) {
    return res.status(400).json({ message: "Missing defaultTime" });
  }

  try {
    // Update all users where business = true
    const updatedUsers = await prisma.user.updateMany({
      where: { business: true },
      data: { defaultTime }, // make sure your DB has this field
    });

    res.status(200).json({
      message: "Default time updated for business users",
      count: updatedUsers.count,
    });
  } catch (err) {
    console.error("Error updating default time for business users:", err);
    res.status(500).json({ message: "Error updating default time" });
  }
}

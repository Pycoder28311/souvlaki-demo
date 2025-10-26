import { prisma } from "../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../app/api/auth/authOptions";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(200).json({});
    }

    const { name, address, selected, distanceToDestination } = req.body;

    if (!name && !address && !selected && !distanceToDestination) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(name && { name }),
        ...(address && { address }),
        ...(distanceToDestination && { distanceToDestination }),
      },
    });

    return res.status(200).json(updatedUser);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update user" });
  }
}

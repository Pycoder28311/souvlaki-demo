// pages/api/update-address.ts
import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { address, email } = req.body;

    if (!address || !email) {
      return res.status(400).json({ error: "Missing address or email" });
    }

    // 🔹 Find the business user
    const businessUser = await prisma.user.findFirst({
      where: { business: true },
      select: { address: true },
    });

    if (!businessUser || !businessUser.address) {
      return res.status(404).json({ error: "No business address found" });
    }

    const destination = businessUser.address;

    // 🔹 Call Google Distance Matrix API
    const distanceRes = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${encodeURIComponent(
        address
      )}&destinations=${encodeURIComponent(destination)}&key=${process.env.NEXT_PUBLIC_GEOLOCATION_API}`
    );
    const data = await distanceRes.json();
    const distanceInfo = data?.rows?.[0]?.elements?.[0]?.distance;

    if (!distanceInfo) {
      return res.status(404).json({ error: "No distance data found" });
    }

    const distanceToDestination = distanceInfo.value / 1000; // meters → km

    // 🔹 Update the user
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { address, distanceToDestination },
    });

    return res.status(200).json({
      success: true,
      updatedUser,
      distanceText: distanceInfo.text,
      distanceValue: distanceToDestination,
    });
  } catch (err) {
    console.error("Error updating address and calculating distance:", err);
    return res.status(500).json({ error: "Failed to update address and distance" });
  }
}

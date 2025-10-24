import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const { origin } = await req.json(); // μόνο origin λαμβάνουμε από τον client

    if (!origin) {
      return NextResponse.json({ error: "Missing origin" }, { status: 400 });
    }

    // 🔹 Βρίσκουμε τον business χρήστη (π.χ. το κατάστημα)
    const businessUser = await prisma.user.findFirst({
      where: { business: true },
      select: { address: true },
    });

    if (!businessUser || !businessUser.address) {
      return NextResponse.json({ error: "No business address found" }, { status: 404 });
    }

    const destination = businessUser.address;

    // 🔹 Κάνουμε κλήση στο Google Distance Matrix API
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${encodeURIComponent(
        origin
      )}&destinations=${encodeURIComponent(destination)}&key=${process.env.NEXT_PUBLIC_GEOLOCATION_API}`
    );

    const data = await res.json();

    // 🔹 Αν η απόσταση υπάρχει, επιστρέφουμε μόνο τα βασικά
    const distanceInfo =
      data?.rows?.[0]?.elements?.[0]?.distance || null;

    if (!distanceInfo) {
      return NextResponse.json({ error: "No distance data found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      origin,
      destination,
      distanceText: distanceInfo.text, // π.χ. "7.3 km"
      distanceValue: distanceInfo.value, // π.χ. 7300 (μέτρα)
    });
  } catch (err) {
    console.error("Error in get-distance:", err);
    return NextResponse.json({ error: "Failed to get distance" }, { status: 500 });
  }
}

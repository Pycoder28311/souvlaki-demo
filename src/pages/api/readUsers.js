import prisma from "../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true }, // select the fields you want
    });
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

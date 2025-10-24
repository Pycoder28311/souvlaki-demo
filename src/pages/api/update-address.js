// /pages/api/update-address.ts
import { prisma } from "../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { address, email } = req.body;
  await prisma.user.update({
    where: { email },
    data: { address },
  });

  res.status(200).json({ success: true });
}

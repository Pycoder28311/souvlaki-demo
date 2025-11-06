import { prisma } from '../../lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "../../app/api/auth/authOptions";

const getUser = async (session) => {
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) throw new Error("User not found");
  return user;
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {

      const session = await getServerSession(req, res, authOptions);
      if (!session) {
        return res.status(200).json({});
      }

      const user = await getUser(session); 
      if (!user) {
        return res.status(200).json({});
      }

      const shops = await prisma.shop.findMany({
        orderBy: { id: "asc" },
        select: { id: true, street: true, validRadius: true },
      });

      // Merge session with user data and include validRadii
      session.user = { ...session.user, ...user };
      session.shops = shops;

      return res.status(200).json(session);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}

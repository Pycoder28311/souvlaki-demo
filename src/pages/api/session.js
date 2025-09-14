import prisma from '../../lib/prisma';
import { getServerSession } from "next-auth"; // Import getServerSession
import { authOptions } from "../../app/api/auth/authOptions";

const getUser = async (session) => {
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }, // Find user by email
  });
  if (!user) throw new Error("User not found");
  return user; // Return the entire user object
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

      const images = await prisma.image.findMany({
        where: {
          entity: "user",    // The model (e.g., "post", "user", etc.)
          entityId: user.id 
        },
      });
      
      session.user = { 
        ...session.user, 
        ...user, 
        images: images.map((image) => image.base64), // Add the first image (or null if no images exist)
      };

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
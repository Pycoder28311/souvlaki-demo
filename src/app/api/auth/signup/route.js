import { prisma } from '../../../../lib/prisma'; 
import bcrypt from 'bcryptjs';

export async function POST(req) {
  const { email, password, name, address } = await req.json();
  const hashedPassword = await bcrypt.hash(password, 10);

  // Check if the user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return new Response(JSON.stringify({ error: "User already exists" }), {
      status: 400,
    });
  }

  const user = await prisma.$transaction([
    prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        address,
      },
    }),
  ]);

  return new Response(JSON.stringify(user), { status: 200 });
}

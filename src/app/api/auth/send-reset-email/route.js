// src/app/api/auth/reset-password/route.js

import { prisma } from '../../../../lib/prisma';  // Adjust according to your setup
import { sendPasswordResetEmail } from '../../../../lib/resetEmail'; // Adjust with your email utility

// Handle POST requests (for sending reset email)
export async function POST(req) {
  const { email } = await req.json(); 

  if (!email) {
    return new Response(
      JSON.stringify({ message: 'Email is required' }),
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return new Response(
        JSON.stringify({ message: 'User not found' }),
        { status: 404 }
      );
    }

    const resetToken = Math.random().toString(36).substring(2); // Example token
    await prisma.passwordReset.create({
      data: { userId: user.id, token: resetToken },
    });

    await sendPasswordResetEmail(email, resetToken); 

    return new Response(
      JSON.stringify({ message: 'Password reset email sent' }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: 'An unexpected error occurred' }),
      { status: 500 }
    );
  }
}

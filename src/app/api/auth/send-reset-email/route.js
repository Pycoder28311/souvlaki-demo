// src/app/api/auth/reset-password/route.js

import { prisma } from '../../../../lib/prisma';  // Adjust according to your setup
import { sendPasswordResetEmail } from '../../../../lib/resetEmail'; // Adjust with your email utility

// Handle POST requests (for sending reset email)
export async function POST(req) {
  const { email } = await req.json(); 
  console.log('Received email for password reset:', email);

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
    console.log('User found:', user);

    if (!user) {
      return new Response(
        JSON.stringify({ message: 'User not found' }),
        { status: 404 }
      );
    }

    const resetToken = Math.random().toString(36).substring(2); // Example token
    console.log('Generated reset token:', resetToken);
    await prisma.passwordReset.create({
      data: { userId: user.id, token: resetToken },
    });
    console.log('Password reset token saved to database');

    await sendPasswordResetEmail(email, resetToken); 
    console.log('Password reset email sent to:', email);

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

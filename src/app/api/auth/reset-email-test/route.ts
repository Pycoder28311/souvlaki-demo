// src/app/api/send-email/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import Mailgen from 'mailgen';
import path from 'path';

// Initialize Mailgen
const mailGenerator = new Mailgen({
  theme: {
    path: path.resolve('public/assets/default.html'),
    plaintextPath: path.resolve('public/assets/theme.txt'),
  },
  product: { name: 'Sizo Develops', link: 'https://www.souvlaki.info' },
});

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password/${body.resetToken}`;

    const emailContent = {
      body: {
        name: body.name || body.email.split('@')[0],
        intro: 'You requested a password reset.',
        action: {
          instructions: 'Click the button below to reset your password:',
          button: {
            color: '#22BC66',
            text: 'Reset Password',
            link: resetUrl,
          },
        },
        outro: 'If you did not request this, please ignore this email.',
      },
    };

    const emailBody = mailGenerator.generate(emailContent);

    // Prepare the message
    const message = {
      from: 'ScanA Team <kopotitore@souvlaki.info>', // verified domain/email
      to: body.email,
      subject: 'Password Reset Request',
      html: emailBody,
    };

    // Send email via Resend
    const result = await resend.emails.send(message);

    return NextResponse.json({ message: 'Email Sent Successfully', result }, { status: 200 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}


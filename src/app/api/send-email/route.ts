// src/app/api/send-email/route.ts
import { Email } from '../../email/EmailComposition';
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

    // Generate HTML email using Mailgen
    const email = Email(body.name);

    const emailBody = mailGenerator.generate(email.styledEmail);

    // Prepare the message
    const message = {
      from: 'ScanA Team <kopotitore@souvlaki.info>', // must be a verified domain/email in Resend
      to: body.email,
      subject: 'Using Resend with Next.js',
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



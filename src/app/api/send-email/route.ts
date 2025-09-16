// src/app/api/send-email/route.ts
import { Email } from '../../email/EmailComposition';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import Mailgen from 'mailgen';
import path from 'path';

// Initialize Mailgen
console.log("Initializing Mailgen...");
const mailGenerator = new Mailgen({
  theme: {
    path: path.resolve('public/assets/default.html'),
    plaintextPath: path.resolve('public/assets/theme.txt'),
  },
  product: { name: 'Sizo Develops', link: 'https://www.souvlaki.info' },
});
console.log("Mailgen initialized.");

// Initialize Resend
console.log("Initializing Resend...");
const resend = new Resend(process.env.RESEND_API_KEY);
console.log("Resend initialized with API key:", process.env.RESEND_API_KEY ? "Yes" : "No");

export async function POST(request: Request) {
  try {
    console.log("POST request received");
    const body = await request.json();
    console.log("Request body:", body);

    // Generate HTML email using Mailgen
    console.log("Generating email with Mailgen...");
    const email = Email(body.name);
    console.log("Email object:");

    const emailBody = mailGenerator.generate(email.styledEmail);
    console.log("Email HTML generated.");

    // Prepare the message
    console.log("Preparing to send email via Resend...");
    const message = {
      from: 'ScanA Team <kopotitore@souvlaki.info>', // must be a verified domain/email in Resend
      to: body.email,
      subject: 'Using Resend with Next.js',
      html: emailBody,
    };
    console.log("Message prepared:", message);

    // Send email via Resend
    console.log("Sending email...");
    const result = await resend.emails.send(message);
    console.log("Email sent. Resend response:", result);

    return NextResponse.json({ message: 'Email Sent Successfully', result }, { status: 200 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('SendMail failed:', err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

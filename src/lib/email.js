import nodemailer from 'nodemailer';

export const sendContactEmail = async ({ name, email, phone, subject, message }) => {
  try {
    // Use a proper SMTP transport (more reliable in production)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,       // e.g., smtp.gmail.com, smtp.sendgrid.net
      port: process.env.SMTP_PORT || 465, // 465 for SSL, 587 for TLS
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
      auth: {
        user: process.env.EMAIL_USER,   // sender email
        pass: process.env.EMAIL_PASS,   // SMTP password or app password
      },
    });

    const mailOptions = {
      from: `"${name}" <${process.env.EMAIL_USER}>`,
      to: "kopotitore@gmail.com", // your destination email
      subject: subject || '📩 New Contact Form Message',
      text: `
        You have received a new message from your website contact form:

        👤 Name: ${name}
        📧 Email: ${email}
        📞 Phone: ${phone || 'N/A'}

        📝 Message:
        ${message}
              `,
      replyTo: email,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to kopotitore@gmail.com`);
  } catch (error) {
    console.error('Error sending contact email:', error);
    throw new Error('Email sending failed');
  }
};

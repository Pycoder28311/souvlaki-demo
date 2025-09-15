import nodemailer from 'nodemailer';

export const sendContactEmail = async ({ name, email, phone, subject, message }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // sender email
      pass: process.env.EMAIL_PASS, // app password
    },
  });
  console.log('Email transporter created',email,process.env.EMAIL_USER, process.env.EMAIL_PASS);

  const mailOptions = {
    from: process.env.EMAIL_USER, // your email account (the sender)
    to: email, // where you want to receive messages
    subject: subject || '📩 New Contact Form Message',
    text: `
      You have received a new message from your website contact form:

      👤 Name: ${name}
      📧 Email: ${email}
      📞 Phone: ${phone || 'N/A'}

      📝 Message:
      ${message}
    `,
    replyTo: email, // so you can reply directly to the sender
  };

  await transporter.sendMail(mailOptions);
};

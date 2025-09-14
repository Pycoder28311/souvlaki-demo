import nodemailer from 'nodemailer';

export const sendPasswordResetEmail = async (email, resetToken) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // your email
      pass: process.env.EMAIL_PASS, // your email password
    },
  });
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password/${resetToken}`;

  const mailOptions = {
    from: 'kopotitore@gmail.com',
    to: email,
    subject: 'Password Reset',
    text: `Click here to reset your password: ${resetUrl}`,
  };

  await transporter.sendMail(mailOptions);
};

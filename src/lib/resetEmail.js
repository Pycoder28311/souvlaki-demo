import nodemailer from 'nodemailer';

export const sendPasswordResetEmail = async (email, resetToken) => {
  console.log('Preparing to send password reset email...');
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // your email
      pass: process.env.EMAIL_PASS, // your email password
    },
  });
  console.log('Email:', email);
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password/${resetToken}`;
  console.log('Reset URL:', resetUrl);

  const mailOptions = {
    from: 'kopotitore@gmail.com',
    to: email,
    subject: 'Password Reset',
    text: `Click here to reset your password: ${resetUrl}`,
  };

  await transporter.sendMail(mailOptions);
};

// pages/api/contact.js
import { sendContactEmail } from '../../lib/email';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }

    await sendContactEmail({ name, email, phone, subject, message });

    return res.status(200).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to send message' });
  }
}

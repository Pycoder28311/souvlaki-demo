import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { name, email, phone, subject, message } = req.body;

      const newMessage = await prisma.message.create({
        data: {
          content: message,
          subject,
          senderName: name,
          senderEmail: email,
          senderPhone: phone,
          receiverId: 3, // example: admin/business user id
          senderId: null,
        },
      });

      return res.status(200).json({ success: true, message: newMessage });
    } catch (error) {
      console.error("Error saving message:", error);
      return res.status(500).json({ success: false, error: "Failed to save message" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

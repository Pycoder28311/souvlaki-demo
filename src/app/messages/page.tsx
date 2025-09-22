// src/app/data/page.tsx
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

// Define the type for a message row
type MessageItem = {
  id: number;
  content: string;
  senderEmail: string;
  createdAt: Date;
};

export default async function DataPage() {
  // Server-side fetch
  const messages: MessageItem[] = await prisma.message.findMany({
    select: {
      id: true,
      content: true,
      senderEmail: true,
      createdAt: true,
    },
  });

  return (
    <div>
      <div className="p-8">
        <h1 className="text-2xl">Messages</h1>

        <ul className="list-disc list-inside mt-4">
          {messages.length > 0 ? (
            messages.map((m: MessageItem) => (
              <li key={m.id}>
                ({m.senderEmail}) {m.content}
              </li>
            ))
          ) : (
            <p>No messages found</p>
          )}
        </ul>
      </div>
    </div>
  );
}
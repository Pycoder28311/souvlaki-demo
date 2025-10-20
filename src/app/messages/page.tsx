// src/app/data/page.tsx
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/authOptions";
import { redirect } from "next/navigation";

export const revalidate = 0;

// Define the type for a message row
type MessageItem = {
  id: number;
  content: string;
  senderEmail: string;
  createdAt: Date;
};

export default async function DataPage() {

  const session = await getServerSession(authOptions);
  if (!session || session?.user?.email !== "kopotitore@gmail.com") {
    // Redirect σε error page
    redirect("/error"); // ή οποιοδήποτε route για σφάλμα
  }

  const messages: MessageItem[] = await prisma.message.findMany({
    select: {
      id: true,
      content: true,
      senderEmail: true,
      createdAt: true,
    },
  });

  return (
    <div className="min-h-screen bg-gray-100 pt-12">
      <div className="p-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Μηνύματα</h1>

        {messages.length > 0 ? (
          <ul className="space-y-4">
            {messages.slice().reverse().map((m: MessageItem) => (
              <li
                key={m.id}
                className="bg-white shadow-sm rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700">{m.senderEmail}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(m.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-800">{m.content}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Δεν υπάρχουν μηνύματα.</p>
        )}
      </div>
    </div>
  );
}

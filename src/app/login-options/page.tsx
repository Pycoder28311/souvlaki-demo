"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { LogIn, UserPlus } from "lucide-react";

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-3xl p-8 w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold mb-6">Welcome</h1>

        {/* Signup button */}
        <Link
          href="/auth/signup"
          className="flex items-center justify-center gap-3 w-full px-5 py-3 
                     bg-blue-500 text-white font-medium rounded-lg shadow-md 
                     hover:bg-blue-600 transition mb-4"
        >
          <UserPlus className="w-5 h-5" />
          Sign up with Email
        </Link>

        {/* Google login button */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="flex items-center justify-center gap-3 w-full px-5 py-3 
                     bg-red-500 text-white font-medium rounded-lg shadow-md 
                     hover:bg-red-600 transition"
        >
          <LogIn className="w-5 h-5" />
          Sign un with Google
        </button>
      </div>
    </div>
  );
}

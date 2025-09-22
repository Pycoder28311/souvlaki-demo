"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { UserPlus } from "lucide-react";
import { FcGoogle } from "react-icons/fc"; // Using react-icons for Google icon

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
                    hover:bg-blue-600 hover:scale-105 transition transform mb-4
                    cursor-pointer"
        >
          <UserPlus className="w-5 h-5" />
          Sign up with Email
        </Link>

        {/* Google login button */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="flex items-center justify-center gap-3 w-full px-5 py-3 
                    bg-white border border-gray-300 font-medium rounded-lg shadow-md 
                    hover:bg-gray-100 hover:scale-105 transition transform
                    cursor-pointer"
        >
          <FcGoogle className="w-5 h-5" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

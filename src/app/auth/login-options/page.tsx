"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { UserPlus } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { googleButtonClasses } from "../buttonStyles";

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-3xl p-8 w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold mb-6">Καλώς ήρθατε</h1>

        {/* Signup button */}
        <Link
          href="/auth/signup"
          className={googleButtonClasses}
        >
          <UserPlus className="w-5 h-5" />
          Εγγραφή με Email
        </Link>

        {/* Google login button */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className={`${googleButtonClasses} mt-4`}
        >
          <FcGoogle className="w-5 h-5" />
          Σύνδεση με Google
        </button>
      </div>
    </div>
  );
}
